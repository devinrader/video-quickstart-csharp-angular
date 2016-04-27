(function () {
    'use strict';

    angular
        .module('app.core.services', [])
        .factory('tokenService', tokenService);

    tokenService.$inject = ['$http'];

    function tokenService($http) {
        var service = {
            getToken: function getToken() {
                return $http.get('/token')
                    .then(function(response) {
                        return response.data;
                    })
                    .catch(function(error) {
                        console.error('XHR Failed for getToken.' + error.data);
                    });
            }
        };
        return service;
    }
})();