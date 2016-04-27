(function () {
    'use strict';

    angular
        .module('app.videochat', [])
        .controller('VideoChatController', VideoChatController);

    VideoChatController.$inject = ['$scope', '$log', 'tokenService'];

    function VideoChatController($scope, $log, tokenService) {
        var vm = this;
        var conversationsClient;
        var activeConversation;
        var token;
        var identity;

        vm.clientConnected = false;
        vm.log = 'Preparing to listen';
        vm.inviteTo = '';
        vm.remoteParticipants = {};
        
        vm.previewCamera = function () {
            vm.previewMedia = new Twilio.Conversations.LocalMedia();
            Twilio.Conversations.getUserMedia().then(
                function (mediaStream) {

                    $scope.$apply(function () {
                        vm.previewMedia.addStream(mediaStream);
                    });

                }).catch(function (error) {
                    $log.error('Unable to access local media', error);
                });
        };

        vm.sendInvite = function () {
            if (activeConversation) {
                activeConversation.invite(vm.inviteTo);
            } else {
                var options = {};
                if (vm.previewMedia) {
                    options.localMedia = vm.previewMedia;
                }
                conversationsClient.inviteToConversation(vm.inviteTo, options).then(conversationStarted).catch(function (error) {
                    $scope.$apply(function () {
                        vm.log = 'Unable to create conversation';
                        $log.error('Unable to create conversation', error);
                    });
                });
            }
        };

        vm.toggleMute = function () {
            if (vm.previewMedia) {
                vm.previewMedia.mute(!$scope.previewMedia.isMuted);
            }
        };

        vm.toggleCamera = function () {
            if (vm.previewMedia) {
                vm.previewMedia.pause(!$scope.previewMedia.isPaused);
            }
        };

        activate();

        function activate() {
            return getToken().then(function (token) {
                $log.info('Token Retrieved: ' + token);

                var accessManager = new Twilio.AccessManager(token);

                $log.log(identity);

                conversationsClient = new Twilio.Conversations.Client(accessManager);
                conversationsClient.listen().then(clientConnected).catch(function (error) {
                    $scope.$apply(function () {
                        vm.log = 'Could not connect to Twilio: ' + error.message;
                    });
                });
            });
        }

        function conversationStarted(conversation) {
            $scope.$apply(function () {
                vm.log = 'In an active Conversation';
                activeConversation = conversation;
            });

            if (!vm.previewMedia) {
                $scope.$apply(function () {
                    vm.previewMedia = conversation.localMedia;
                });
            }

            // When a participant joins, draw their video on screen
            conversation.on('participantConnected', function (participant) {
                $scope.$apply(function () {
                    $log.log("Participant '" + participant.identity + "' connected");
                    vm.log = "Participant '" + participant.identity + "' connected";
                    vm.remoteParticipants[participant.sid] = participant.media;
                });
            });

            // When a participant disconnects, note in log
            conversation.on('participantDisconnected', function (participant) {
                $scope.$apply(function () {
                    vm.log = "Participant '" + participant.identity + "' disconnected";
                    delete vm.remoteParticipants[participant.sid];
                });
            });

            // When the conversation ends, stop capturing local video
            conversation.on('disconnected', function (conversation) {
                $scope.$apply(function () {
                    vm.log = 'Connected to Twilio. Listening for incoming Invites as "' + conversationsClient.identity + '"';
                });

                vm.clientConnected = false;
                conversation.localMedia.stop();
                conversation.disconnect();
                activeConversation = null;
            });
        };

        function clientConnected() {
            $scope.$apply(function () {
                vm.clientConnected = true;
                vm.log = 'Connected to Twilio. Listening for incoming Invites as "' + conversationsClient.identity + '"';
                $log.log('Connected to Twilio. Listening for incoming Invites as "' + conversationsClient.identity + '"');
            });

            conversationsClient.on('invite', function (invite) {
                $scope.$apply(function () {
                    vm.log = 'Incoming invite from: ' + invite.from;
                    invite.accept().then(conversationStarted);
                });
            });
        }

        function getToken() {
            return tokenService.getToken()
                .then(function (data) {
                    token = data.token;
                    identity = data.identity;
                    return token;
                });
        }
    }
})();