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
            for (var i = 0; i < scores.length; i++) {
                calculatedScore += scores[i].score;
            }
            if (scores.length > 0) {
                calculatedScore /= scores.length;
            }

            // This query will retrieve summed up scores (inkl count) grouped by month, for the last year.
            sequelize.query("select " +
                                "strftime('%m', s.createdAt) as month, " +
                                "strftime('%Y', s.createdAt) as year, " +
                                "count(s.score) as count, " +
                                "sum(s.score) as sum " +
                            "from score s " +
                            "where entity_id = " + entity.id + 
                            " group by year, month " +
                            "order by year asc, month asc " +
                            "limit 12").success(function(scoresPerMonth) {
                var sections = [];
                for (i = 0; i < scoresPerMonth.length; i++) {
                    var score = scoresPerMonth[i];
                    sections.push({ description : score.year + '-' + score.month,
                        values : [score.sum / score.count]});
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

function mockedResponse(name) {
    return {
        success : true,
        result : {
            item : name,
            normalizedScores : [
                {
                    type : 'default',
                    score : 0.49,
                    sections : [{ // sections können z.B. verwendet werden um Ergebnisse in Monats/Quartals/Jahresabschnitten zusammen zu fassen
                        description : '2013-11',
                        values : [
                            0.13,
                            0.87,
                            0.11,
                            0.05,
                            0.12,
                            0.09,
                            0.93,
                            0.74,
                            0.45,
                            0.67,
                            0.98,
                            0.32,
                            0.32
                        ]
                    },
                    { // sections können z.B. verwendet werden um Ergebnisse in Monats/Quartals/Jahresabschnitten zusammen zu fassen
                        description : '2013-12',
                        values : [
                            0.32,
                            0.58,
                            0.23,
                            0.34,
                            0.53,
                            0.23,
                            0.76,
                            0.35,
                            0.75,
                            0.23,
                            0.98,
                            0.34,
                            0.32
                        ]
                    },
                    { // sections können z.B. verwendet werden um Ergebnisse in Monats/Quartals/Jahresabschnitten zusammen zu fassen
                        description : '2014-01',
                        values : [
                            0.34,
                            0.98,
                            0.34,
                            0.52,
                            0.64,
                            0.82,
                            0.93,
                            0.22,
                            0.53,
                            0.90,
                            0.23,
                            0.11,
                            0.91
                        ]
                    }
                    ] // es könnten auch mehrere sections vorhanden sein
                } // hier könnten noch weitere scores kommen, z.B. für Rentabilität, etc.
            ]
        }
    };
};

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
