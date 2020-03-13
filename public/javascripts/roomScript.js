var webcamStream = null;        // MediaStream from webcam
var targetUsername = null;      // To store username of other peer
var myPeerConnection = null;    // RTCPeerConnection
var transceiver = null;         // RTCRtpTransceiver
var webcamStream = null;        // MediaStream from webcam
var sendToServer=null;
var mediaConstraints = {
    audio: true,            // We want an audio track
    video: {
        aspectRatio: {
            ideal: (16/9)     // 3:2 aspect is preferred
        }
    }
};
new Vue({
    el: '#app',
    data: {
        myVideoIsStarted:false
    },
    methods: {
        startVideo:function () {
            var _this=this;
          initMyVideo(function (webcamStream) {
               if(webcamStream!=null) {
                   _this.myVideoIsStarted = true;
                   setTimeout(function () {
                      document.getElementById("local_video").srcObject = webcamStream;
                       createPeerConnection();
                       webcamStream.getTracks().forEach(
                           transceiver = track => myPeerConnection.addTransceiver(track, {streams: [webcamStream]})

                       );
                   },0)
               }

           });
        },
        stopVideo:function () {
            this.myVideoIsStarted=false;
            closeVideo();

        }
    },
    mounted:  function () {
        connect();
    }

});


 function initMyVideo(clbk) {
    try {
         navigator.mediaDevices.getUserMedia(mediaConstraints)
             .then(function (webcamStream) {
                 clbk(webcamStream);
             })
             .catch(function (err) {
                 clbk(null)
                 log_error(err)
             })

        return true;
    } catch(err) {
        clbk(null)
        log_error(err)
        return false;
    }
}
  function connect(){
      var serverUrl;
      var scheme = "http";
      if (document.location.protocol === "https:") {
          scheme += "s";
      }
      serverUrl = document.location.protocol + "//" + myHostname;
      log(`Connecting to server: ${serverUrl}`);
      var socket = io('http://localhost');
      socket.on('connect', function() {
          log("connection.onopen")
          sendToServer=function (data, type) {
              socket.emit(type||"roomVideoMessage", data);
          }
          socket.on("roomVideoMessage", (msg)=>{
              switch(msg.type) {
                  case "video-answer":  // Invitation and offer to chat
                      //handleVideoAnswerMsg(msg);
                      log("handleVideoAnswerMsg")
                      var desc = new RTCSessionDescription(msg.sdp);
                      myPeerConnection.setLocalDescription({type: "rollback"})
                         .then(function(){
                              myPeerConnection.setRemoteDescription(desc)
                                  .then(function () {
                                      log("setRemoteDescription set")
                                  })
                          })

                      break;
              }

          })
      })
  }
  function createPeerConnection() {
      log("Setting up a connection...");
      myPeerConnection = new RTCPeerConnection({
          iceServers: [     // Information about ICE servers - Use your own!
              {
                  urls: "turn:" + myHostname,  // A TURN server
                  username: "webrtc",
                  credential: "turnserver"
              }
          ]
      });
      // Set up event handlers for the ICE negotiation process.

      myPeerConnection.onicecandidate = handleICECandidateEvent;
     myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
       myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
       myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
      myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
      myPeerConnection.ontrack = handleTrackEvent;
  }
function handleICECandidateEvent(event) {
    if (event.candidate) {
        sendToServer({
            type: "new-ice-candidate",
            target: targetUsername,
            candidate: event.candidate
        });
    }
}
function closeVideo(){
    if (myPeerConnection) {
        log("--> Closing the peer connection");

        // Disconnect all our event listeners; we don't want stray events
        // to interfere with the hangup while it's ongoing.

        myPeerConnection.ontrack = null;
        myPeerConnection.onnicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onicegatheringstatechange = null;
        myPeerConnection.onnotificationneeded = null;

        // Stop all transceivers on the connection

        myPeerConnection.getTransceivers().forEach(function(transceiver) {
            transceiver.stop();
        });
    }
     webcamStream = null;
    myPeerConnection.close();
    myPeerConnection = null;

}
function handleICEConnectionStateChangeEvent(event) {
    log("*** ICE connection state changed to " + myPeerConnection.iceConnectionState);

    switch(myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
        case "disconnected":
            closeVideo();
            break;
    }
}
function handleICEGatheringStateChangeEvent(event) {
    log("*** ICE gathering state changed to: " + myPeerConnection.iceGatheringState);
}
function handleSignalingStateChangeEvent(event) {
    log("*** WebRTC signaling state changed to: " + myPeerConnection.signalingState);
    switch(myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();
            break;
    }
}
function handleNegotiationNeededEvent() {
    log("*** Negotiation needed");

    try {
        log("---> Creating offer");
          myPeerConnection.createOffer()
            .then(function (offer) {
                if (myPeerConnection.signalingState != "stable") {
                    log("     -- The connection isn't stable yet; postponing...")
                    return;
                }
                log("---> Setting local description to the offer");
                myPeerConnection.setLocalDescription(offer)
                    .then(function () {
                        log("---> Sending the offer to the remote peer");
                        sendToServer({
                            name: "myUsername",
                            target: "targetUsername",
                            type: "video-offer",
                            sdp: myPeerConnection.localDescription
                        });
                    })

            });
    } catch(err) {
        log("*** The following error occurred while handling the negotiationneeded event:");
        log_error(err);
    };
}
function handleTrackEvent(event) {
    log("*** Track event");
    //document.getElementById("received_video").srcObject = event.streams[0];
   // document.getElementById("hangup-button").disabled = false;
}
