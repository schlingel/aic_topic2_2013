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

    };

    function beforeSearch() {

    };

    function onResult(result) {

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