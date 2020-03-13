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
var app=new Vue({
    el: '#app',
    data: {
        videos:[]
    },
    methods: {

    },
    mounted:  function () {
        var _this=this;
        connect(_this);
    }

});



  function connect(_this){
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
                  case "video-offer":  // Invitation and offer to chat
                      handleVideoOfferMsg(msg, _this);
                      log("handleVideoOfferMsg")
                      break;
                  case "new-ice-candidate" :
                      handleNewICECandidateMsg(msg, _this);
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

    /*  myPeerConnection.onicecandidate = handleICECandidateEvent;
     myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
       myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
       myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
      myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
      myPeerConnection.ontrack = */
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
function handleICEConnectionStateChangeEvent(myPeerConnection) {
    log("*** ICE connection state changed to " + myPeerConnection.iceConnectionState);

    switch(myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
        case "disconnected":
            closeVideo();
            break;
    }
}
function handleICEGatheringStateChangeEvent(myPeerConnection) {
    log("*** ICE gathering state changed to: " ,myPeerConnection.iceGatheringState);
}
function handleSignalingStateChangeEvent(myPeerConnection) {
    log("*** WebRTC signaling state changed to: " , myPeerConnection.signalingState);
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
function handleTrackEvent(event,receiverPeerConnection, msg) {
    console.log("*** Track event", event, msg);
    setTimeout(function () {
        document.getElementById("video_"+msg.id).srcObject = event.streams[0];
    },500)

   // document.getElementById("hangup-button").disabled = false;
}
function handleVideoOfferMsg(msg, _this) {

    log("Received video chat offer from " + targetUsername);
    var receiverPeerConnection = new RTCPeerConnection({
        iceServers: [     // Information about ICE servers - Use your own!
            {
                urls: "turn:" + myHostname,  // A TURN server
                username: "webrtc",
                credential: "turnserver"
            }
        ]
    });
    // Set up event handlers for the ICE negotiation process.

    receiverPeerConnection.onicecandidate = handleICECandidateEvent;
    receiverPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent(receiverPeerConnection);
    receiverPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent(receiverPeerConnection);
    receiverPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent(receiverPeerConnection);
    receiverPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    receiverPeerConnection.ontrack = function (event) {
       handleTrackEvent(event,receiverPeerConnection, msg );
    };

    var desc = new RTCSessionDescription(msg.sdp);
    receiverPeerConnection.setRemoteDescription(desc)
        .then(function () {
            receiverPeerConnection.createAnswer()
                .then(function (answ) {
                    receiverPeerConnection.setLocalDescription(answ)
                    if(_this.videos.filter(function (e) {
                      return  e.id==msg.id
                    }).length==0)
                        _this.videos.push({userName:msg.name, id:msg.id,receiverPeerConnection:receiverPeerConnection })
                    sendToServer({
                        name: "myUsername",
                        target: "targetUsername",
                        type: "video-answer",
                        sdp: receiverPeerConnection.localDescription
                    });
                    log("send video ansver", receiverPeerConnection.sdp)
                })
        })

}

function handleNewICECandidateMsg(msg, _this) {

    var video=_this.videos.filter(function (e) {
        return e.id==msg.id
    });
if(video.length>0)
{
    console.log("new ice candidate ", msg.candidate)
    var candidate = new RTCIceCandidate(msg.candidate);
    video[0].receiverPeerConnection.addIceCandidate(candidate)
        .then(function () {
            console.log("new ice candidate add", video[0])
        })
}

}
