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
                            .append(createScore(normalizedScore)),
            $result = $('<div>').appendTo($container),
            $graph = $('<div>').attr('id', graphId).appendTo($container);

        $target.append($container);


        createGraph(normalizedScore, graphId);

        return $container;
    };

    function createScore(normalizedScore, target) {
        var $entry = $('<div>').addClass('score'),
            width = normalizedScore.score * 100,
            style = width + '%';

        console.log('width: ', style);

        $entry.append($('<div>').append($('<strong>').text('Score : ' + normalizedScore.score)).append($('<br>')).append($('<span>').text(alertText(normalizedScore.score))).addClass('alert').addClass(alertScoreClass(normalizedScore.score)));
        $entry.append($('<div>').addClass('progress').append($('<div>')
            .attr('role', 'progressbar')
            .attr('aria-valuenow', width)
            .attr('aria-valuemin', '0')
            .attr('aria-valuemax', '100')
            .addClass('progress-bar')
            .addClass(scoreClass(normalizedScore.score))
            .css('width', style)
            .append($('<span>').addClass('sr-only'))));

        return $entry;
    };

    function scoreClass(score) {
        if(score < 0.33) {
            return 'progress-bar-danger';
        } else if(score < 0.6) {
            return 'progress-bar-warning';
        } else {
            return 'progress-bar-success';
        }
    }

    function alertScoreClass(score) {
        if(score < 0.33) {
            return 'alert-danger';
        } else if(score < 0.6) {
            return 'alert-warning';
        } else {
            return 'alert-success';
        }
    };

    function alertText(score) {
        if(score < 0.33) {
            return 'Be careful. The majority of the analyzation crowd does not trust this.';
        } else if(score < 0.6) {
            return 'There is no negative or positive major oppinion.';
        } else {
            return 'Looks good to our crowd.';
        }
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