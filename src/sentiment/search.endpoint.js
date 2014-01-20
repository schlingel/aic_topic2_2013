var orm = require('./orm.js'),
    _ = require('underscore'),
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
    res.send(mockedResponse(name));
    next();
});

function mockedResponse(name) {
    return {
        success : true,
        result : {
            item : name,
            normalizedScores : [
                {
                    type : 'default',
                    sections : [{ // sections können z.B. verwendet werden um Ergebnisse in Monats/Quartals/Jahresabschnitten zusammen zu fassen
                        description : '2014-01',
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
                    }] // es könnten auch mehrere sections vorhanden sein
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