(function () {
    'use strict';

    angular
        .module('app.core.directives', [])
        .directive('twilioVideo', twilioVideoDirective);

    function twilioVideoDirective() {
        return {
            template: '<div class="twilio-video-media-container"></div>',
            restrict: 'E',
            replace: true,
            scope: {
                media: '=',
            },
            link: function (scope, element, $attributes) {
               scope.$watch('media', function (newval, oldval) {
                    if (scope.media) {
                        scope.media.attach(element[0]);
                    }
                }, true);
            }
        };
    }
})();