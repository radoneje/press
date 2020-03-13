
new Vue({
    el: '#app',
    data: {

    },
    methods: {

    },
    mounted:  function () {
        connect();
    }

});



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

