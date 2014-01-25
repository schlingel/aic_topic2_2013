$(document).ready(function() {
    var scoring = new CrowdScoring({
            onResult : onResult,
            beforeSearch : beforeSearch,
            onEmptyResult : onEmptyResult
        }),
        completer = new AutoCompleter({
            inputElement: $('#search-input'),
            scoring : scoring
        });

    function onEmptyResult() {
        console.log('no result!');
    };

    function beforeSearch() {
        console.log('before search');
    };

    function onResult(result) {
        var $results = $('#search-results');
        $results.empty();
        $results.append($('<div>').append($('<h1>').text(result.item)));

        for(var i = 0; i < result.normalizedScores.length; i++) {
            createCategoryView(result.normalizedScores[i], $results);
        }
    };

    function createCategoryView(normalizedScore, $target) {
        var graphId = 'graph_' + (new Date()).getTime(),
            $container = $('<div>')
                            .append($('<h2>').text(normalizedScore.type))
                            .append($('<span>').text('Score: ' + normalizedScore.score)),
            $result = $('<div>').appendTo($container),
            $graph = $('<div>').attr('id', graphId).appendTo($container);

        $target.append($container);

        createGraph(normalizedScore, graphId);

        return $container;
    };

    function createGraph(normalizedScore, graphId) {
        var values = _.flatten(_.map(normalizedScore.sections, function(section) { return section.values; }));
        var ticks = [];

        _.each(normalizedScore.sections, function(section) {
            _.each(section.values, function(val, key) {
                ticks.push([
                    ticks.length + 1,
                    key == 0 ? section.description : ""
                ]);
            })
        });

        $.jqplot(graphId, [values], {
            axes : {
                xaxis : {
                    min : 1,
                    max : ticks.length,
                    ticks : ticks
                }
            }
        });
    };

    $('#search-input').keyup(function(event) {
        if(event.keyCode === 13) {
            var value = $('#search-input').val();
            scoring.triggerSearch($.trim(value));
        }
    });

    $('#btn-search').click(function() {
        var value = $('#search-input').val();
        scoring.triggerSearch($.trim(value));
    });

    $('#search-input').autocomplete(completer.config());
});