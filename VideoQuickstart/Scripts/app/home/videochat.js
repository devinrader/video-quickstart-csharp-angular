angular.module('controllers.videochat', ['directives.twiliovideo', 'directives.twiliovolume'])

    .controller('videochatController', ['$scope', '$http', function ($scope, $http) {

        $scope.remoteParticipants = {};
        $scope.previewMedia;
        $scope.activeConversation;
        $scope.inviteTo;
        $scope.log = 'Preparing to listen';
        $scope.clientConnected = false;
        $scope.audioMeter;

        audioContext = window.AudioContext || window.webkitAudioContext;
        var audioContext = new AudioContext();

        $scope.previewCamera = function () {
            $scope.previewMedia = new Twilio.Conversations.LocalMedia();
            Twilio.Conversations.getUserMedia().then(
                function (mediaStream) {
                    $scope.$apply(function () {
                        $scope.previewMedia.addStream(mediaStream);

                        var mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
                        $scope.audioMeter = createAudioMeter(audioContext);
                        mediaStreamSource.connect($scope.audioMeter);
                    });
                },
                function (error) {
                    console.error('Unable to access local media', error);
                });
        }

        var muted = false;
        $scope.toggleMute = function () {
            if ($scope.previewMedia) {
                $scope.previewMedia.mute(!$scope.previewMedia.isMuted);
            }
        }

        var camera = false;
        $scope.toggleCamera = function () {
            if ($scope.previewMedia) {
                $scope.previewMedia.pause(!$scope.previewMedia.isPaused);
            }
        }

        $scope.sendInvite = function () {
            if ($scope.activeConversation) {
                // Add a participant
                $scope.activeConversation.invite($scope.inviteTo);
            } else {
                // Create a conversation
                var options = {};
                if ($scope.previewMedia) {
                    options.localMedia = $scope.previewMedia;
                }
                conversationsClient.inviteToConversation($scope.inviteTo, options).then(conversationStarted, function (error) {
                    $scope.$apply(function () {
                        $scope.log = 'Unable to create conversation';
                        console.error('Unable to create conversation', error);
                    });
                });
            }
        };

        $http.get('/token').then(function (response) {
            identity = response.data.identity;
            var accessManager = new Twilio.AccessManager(response.data.token);

            console.log(identity);

            conversationsClient = new Twilio.Conversations.Client(accessManager);
            conversationsClient.listen().then(clientConnected, function (error) {
                $scope.$apply(function () {
                    $scope.log = 'Could not connect to Twilio: ' + error.message;
                });
            });
        });

        // Successfully connected!
        function clientConnected() {
            $scope.clientConnected = true;

            $scope.$apply(function () {
                $scope.log = "Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'";
                console.log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");
            });

            conversationsClient.on('invite', function (invite) {
                $scope.$apply(function () {
                    $scope.log = 'Incoming invite from: ' + invite.from;
                    invite.accept().then(conversationStarted);
                });
            });
        }

        function conversationStarted(conversation) {

            var mediaStreamSource = audioContext.createMediaStreamSource(conversation.localMedia.audioTracks[0]);
            meter = createAudioMeter(audioContext);
            mediaStreamSource.connect(meter);
            drawLoop();


            $scope.$apply(function () {
                $scope.log = 'In an active Conversation';
                $scope.activeConversation = conversation;
            });

            if (!$scope.previewMedia) {
                $scope.$apply(function () {
                    $scope.previewMedia = conversation.localMedia;
                    console.log('set previewMedia: ' + $scope.previewMedia);
                });
            }

            // When a participant joins, draw their video on screen
            conversation.on('participantConnected', function (participant) {
                $scope.$apply(function () {
                    console.log("Participant '" + participant.identity + "' connected");
                    $scope.log = "Participant '" + participant.identity + "' connected";
                    $scope.remoteParticipants[participant.sid] = participant.media;
                });
            });

            // When a participant disconnects, note in log
            conversation.on('participantDisconnected', function (participant) {
                $scope.$apply(function () {
                    $scope.log = "Participant '" + participant.identity + "' disconnected";
                    delete $scope.remoteParticipants[participant.sid];
                });
            });

            // When the conversation ends, stop capturing local video
            conversation.on('disconnected', function (conversation) {
                $scope.$apply(function () {
                    $scope.log = "Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'";
                });
                conversation.localMedia.stop();
                $scope.clientConnected = false;
                conversation.disconnect();
                activeConversation = null;
            });
        }

        //function drawLoop(time) {

        //    canvasContext.clearRect(0, 0, 300, 50);

        //    // check if we're currently clipping
        //    if (meter.checkClipping())
        //        canvasContext.fillStyle = "red";
        //    else
        //        canvasContext.fillStyle = "green";

        //    var w = meter.volume * 300 * 1.4;
        //    canvasContext.fillRect(0, 0, w, 50);

        //    // set up the next visual callback
        //    rafID = window.requestAnimationFrame(drawLoop);
        //}
    }])


/*
var canvasContext = document.getElementById("meter").getContext("2d");

//Step 1: Create an AudioContext, our generic audio-processing graph
var audioContext = new AudioContext();

if (navigator.getUserMedia) {

    navigator.getUserMedia(
        { audio: true },
        function (stream) {
            var localAudio = document.querySelector("audio#local-audio");
            localAudio.src = window.URL.createObjectURL(stream);

            //Step 2: Create a new mediaStreamSource
            //Step 3: Create a new AudioMeter
            //Step 4: Connect the meter to the mediastreamsource
            //Step 5: start drawLoop
            var mediaStreamSource = audioContext.createMediaStreamSource(stream);
            meter = createAudioMeter(audioContext);
            mediaStreamSource.connect(meter);
            drawLoop();


        },
        function (err) {
            console.log(err);
        });
}

function drawLoop(time) {

    canvasContext.clearRect(0, 0, 300, 50);

    // check if we're currently clipping
    if (meter.checkClipping())
        canvasContext.fillStyle = "red";
    else
        canvasContext.fillStyle = "green";

    var w = meter.volume * 300 * 1.4;
    canvasContext.fillRect(0, 0, w, 50);

    // set up the next visual callback
    rafID = window.requestAnimationFrame(drawLoop);
}
*/