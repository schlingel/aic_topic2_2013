var orm = require('./orm.js'),
    _ = require('underscore'),
    ScoreEntity = orm.ScoreEntity,
    Score = orm.Score,
    sequelize = orm.sequelize;
    restify = require('restify');

var server = restify.createServer(),
    cfg = {
        url : 'http://localhost',
        port : 54762
    };

server.use(restify.bodyParser());
server.use(restify.CORS());

/**
 * Muss normalisierte Bewertungen zurückgeben. Normalisiert bedeutet, dass bereits
 * etwaige Faktoren für die einzelnen Scores eingerechnet wurden. Z.B.: wenn das Alter
 * einer Bewertung eine Rolle spielt, muss der Faktor bereits enthalten sein.
 *
 * Im ersten Anlauf brauchen wir nur eine Charge von normalisierten Daten aber wenn wir noch
 * einbauen, dass man nicht nur nach einem allgemeinen Score sondern nach mehreren Arten wie Stabilität,
 * Rentabilität, etc. suchen kann muss sich beim Frontend nicht mehr viel ändern.
 *
 * Für Details wie das aussehen soll einfach mockedResponse betrachten.
 */
server.get('/lookup/:name', function(req, res, next) {
    var name = req.params.name;

    res.charSet('UTF-8');

    ScoreEntity.find({ where : { name : name}}).success(function(entity) {
        Score.findAll({ where : { entity_id : entity.id}}).success(function(scores) {
            var calculatedScore = 0.0;
            var upperWhisker = 0.0;
            var lowerWhisker = 0.0;

            // Only dismiss outlier if we have more than 15 values
            if (scores.length < 15) {
                for (var i = 0; i < scores.length; i++) {
                    calculatedScore += scores[i].score;
                }
                if (scores.length > 0) {
                    calculatedScore /= scores.length;
                }
            } else {
                // Build a list with the score values and order it
                var rawScores = [];
                for (var i = 0; i < scores.length; i++) {
                    rawScores.push(scores[i].score);
                }
                rawScores.sort(function(a,b) {return a - b;});

                // Get both quartiles
                var i25 = Math.floor(0.25 * scores.length);
                var i75 = Math.floor(0.75 * scores.length);

                var p25 = (rawScores[i25] + rawScores[i25 + 1]) / 2;
                var p75 = (rawScores[i75] + rawScores[i75 + 1]) / 2;
                var quartilDif = 1.5 * (p75 - p25);
                upperWhisker = p75 + quartilDif;
                lowerWhisker = p25 - quartilDif;
                console.log('Entity: ' + entity.name +
                        ', Upper whisker: ' + upperWhisker + ', lower whisker: ' + lowerWhisker);

                // Only allow values which are in the box
                var filteredScores = [];
                for (var i = 0; i < rawScores.length; i++) {
                    if (rawScores[i] < upperWhisker && rawScores[i] > lowerWhisker) {
                        filteredScores.push(rawScores[i]);
                    }
                }
                
                for (var i = 0; i < filteredScores.length; i++) {
                    calculatedScore += filteredScores[i];
                }
                calculatedScore /= filteredScores.length;

            }

            var queryString = "select " +
                                "strftime('%m', s.createdAt) as month, " +
                                "strftime('%Y', s.createdAt) as year, " +
                                "count(s.score) as count, " +
                                "sum(s.score) as sum " +
                            "from score s " +
                            "where entity_id = ? "; 
            if (upperWhisker > 0) {
                queryString += "and s.score > ? ";
                queryString += "and s.score < ? ";
            }
            queryString += " group by year, month " +
                           "order by year asc, month asc " +
                           "limit 12";

            // This query will retrieve summed up scores (inkl count) grouped by month, for the last year.
            sequelize.query(queryString, null, {raw: true}, [entity.id, lowerWhisker, upperWhisker]).success(
                    function(scoresPerMonth) {
                var sections = [];
                for (i = 0; i < scoresPerMonth.length; i++) {
                    var score = scoresPerMonth[i];
                    var value = 0.0;
                    if (score.count > 0) {
                        value = score.sum / score.count;
                    }
                    sections.push({ description : score.year + '-' + score.month,
                        values : [value]});
                }
                res.send({
                    success : true,
                    result : {
                        item : name,
                        normalizedScores : [{
                            type : 'Default',
                            score : calculatedScore,
                            sections : sections 
                        }]
                    }
                });
                next();
            }).error(function() {
                res.send({
                    success : false,
                    error : 'Unable to load scores per month.'
                });
            });

        }).error(function() {
            res.send({
                success : false,
                error : 'Unable to load associated scores!'
            });
        });
    }).error(function() {
        res.send({
            success : false,
            error : 'Unable to retrieve data for ' + name
        });
        next();
    });
});

server.get('/autocomplete/:term', function(req, res, next) {
    var term = req.params.term,
        queryParam = '%' + term + '%';

    res.charSet('UTF-8');

    ScoreEntity.findAll({ where : [ 'name like ?', queryParam ]}).success(function(entities) {
        res.send({
           success : true,
           result : {
               terms : _.uniq(_.map(entities, function(entity) { return entity.name; }))
           }
        });
        next();
    }).error(function() {
        res.send({
            success : false,
            error : 'Could not fetch data'
        });
        next();
    });
});


/**
 * Soll das selbe wie /lookup/:name zurückgeben, allerdings nur für Firmen
 */
server.get('/company/:company', function(req, res, next) {
    var companyName = req.params.company;
    res.charSet('UTF-8');
    res.send(mockedResponse(companyName));
    next();
});

/**
 * Soll das selbe wie /lookup/:name zurückgeben, allerdings nur für Produkte
 */
server.get('/product/:product', function(req, res, next) {
    var productName = req.params.product;
    res.charSet('UTF-8');
    res.send(mockedResponse(productName));
    next();
});

server.listen(cfg.port);
