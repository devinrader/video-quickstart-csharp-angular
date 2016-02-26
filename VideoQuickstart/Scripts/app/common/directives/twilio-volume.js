angular.module('directives.twiliovolume', [])

.directive('twilioVolume', function ($compile) {

    var canvasContext;

    return {
        restrict: 'A',
        scope: {
            meter: '=',
        },
        link: function (scope, el, $attrs) {
            var canvas = el[0];
            canvasContext = canvas.getContext("2d");

            function drawLoop(time) {

                canvasContext.clearRect(0, 0, 300, 50);

                if (scope && scope.meter) {
                    // check if we're currently clipping
                    if (scope.meter.checkClipping())
                        canvasContext.fillStyle = "red";
                    else
                        canvasContext.fillStyle = "green";

                    console.log('Volume: ' + scope.meter.volume);

                    var w = scope.meter.volume * 300 * 1.4;

                    console.log('Width: ' + w);
                    canvasContext.fillRect(0, 0, w, 50);
                }

                // set up the next visual callback
                rafID = window.requestAnimationFrame(drawLoop);
            }

            drawLoop();
        }
    }


});