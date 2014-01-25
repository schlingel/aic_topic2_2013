(function(host) {
    function Scoring(config) {
        this.onResult = config.onResult;
        this.onEmptyResult = config.onEmptyResult;
        this.beforeSearch = config.beforeSearch;
    };

    Scoring.prototype.callBeforeSearch = function() {
        if(!!this.beforeSearch) {
            this.beforeSearch();
        }
    };

    Scoring.prototype.callOnResult = function(result) {
        if(!!this.onResult) {
            this.onResult(result);
        }
    };

    Scoring.prototype.callOnEmptyResult = function() {
        if(!!this.onEmptyResult) {
            this.onEmptyResult();
        }
    };

    Scoring.prototype.triggerSearch = function(name) {
        var self = this,
            url = 'http://127.0.0.1:54762/lookup/' + name;

        this.callBeforeSearch();

        $.get(url)
            .done(function(resp) {
                var isSuccess = !!resp && resp.success;

                console.log('got result : ', resp);

                if(isSuccess) {
                    self.callOnResult(resp.result);
                } else {
                    self.callOnEmptyResult();
                }
            })
            .error(function() {
                self.callOnEmptyResult();
            });
    };

    function AutoCompleter(config) {
        this.inputElement = config.inputElement;
        this.scoring = config.scoring;
        this.autocompleteUrl = 'http://localhost:54762/autocomplete/';
    };

    AutoCompleter.prototype.config = function() {
        var self = this;

        function transform(resp) {
            resp = (typeof resp == 'string') ? JSON.parse(resp) : resp;

            var isSuccess = !!resp && resp.success,
                terms = [];

            if(isSuccess) {
                terms = !!resp.result ? resp.result.terms : [];
            }

            return { suggestions : terms };
        }

        function serviceUrl() {
            var term = $.trim(self.inputElement.val());
            return self.autocompleteUrl + encodeURIComponent(term);
        }

        return {
            minChars : 1,
            transformResult : transform,
            serviceUrl : serviceUrl
        };
    };

    host.AutoCompleter = AutoCompleter;
    host.CrowdScoring = Scoring;
})(window);