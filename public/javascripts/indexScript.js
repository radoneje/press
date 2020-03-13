new Vue({
    el: '#app',
    data: {
        sect:[{title:"Вопросы", isActive:true, id:1}, {title:"Чат", isActive:false, id:2},{title:"Участники", isActive:false, id:3} ],
        qText:"",
        q:[],
        activeSection:1
    },
    methods: {
        sectActive:function (item) {
            var _this=this;
            this.sect.forEach(function (e) {

                e.isActive=(item.id==e.id);
                if(e.isActive)
                    _this.activeSection=e.id
               // return e;
            })
        },
        qtextChange:function (e) {
            var _this=this;
          if(e.keyCode==13){
              axios.post("/rest/api/quest",{text:_this.qText})
                  .then(function (e) {
                      _this.qText="";
                      _this.q.push(e.data);
                      setTimeout(function () {
                          var objDiv = document.getElementById("qBox");
                          objDiv.scrollTop = objDiv.scrollHeight;
                      },0)
                  })

          }
        }
    },
    mounted:  function () {
        var _this=this;
        connect();
        axios.get("/rest/api/quest")
            .then(function (r) {
                _this.q=r.data;
            })
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