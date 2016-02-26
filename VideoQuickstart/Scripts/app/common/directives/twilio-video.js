angular.module('directives.twiliovideo', [])

.directive('twilioVideo', function ($compile) {
    return {
        template: '<div class="twilio-video-media-container"></div>',
        restrict: 'E',
        scope: {
            media: '=',
        },
        link: function (scope, el, $attrs) {
            scope.$watch('media', function (newval, oldval) {
                if (scope.media) {
                    scope.media.attach(el[0].querySelector('div'));
                }
            }, true);
        }
    }
});