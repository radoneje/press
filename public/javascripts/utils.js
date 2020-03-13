function log(text) {
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}
function log_error(text) {
    var time = new Date();
    console.trace("[" + time.toLocaleTimeString() + "] " + text);
}
var myHostname = window.location.hostname;
if (!myHostname) {
    myHostname = "localhost";
}
log("Hostname: " + myHostname);
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
        socket.emit("hello", userId);
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

        socket.on("userConnnect", (userid)=>{
            _this.users.forEach(function (user) {
                if(user.id==userid)
                    user.isActive=true;
            })
        });
        socket.on("userDisconnnect", (userid)=>{
            _this.users.forEach(function (user) {
                if(user.id==userid)
                    user.isActive=false;
            })
        });
        socket.on("chatAdd", (data)=>{
            _this.chat.push(data);
            setTimeout(function () {
                var objDiv = document.getElementById("chatBox");
                objDiv.scrollTop = objDiv.scrollHeight;
            },0)
        });
        socket.on("chatDelete", (data)=>{
            _this.chat=_this.chat.filter(function (e) {return e.id!=data;});
        });
        socket.on("qAdd", (data)=>{
            _this.q.push(data);
        });
        socket.on("qDelete", (data)=>{
            _this.q=_this.q.filter(function (e) {return e.id!=data;});
        });
        socket.on("qStatus", (data)=>{
            _this.q.forEach(function (e) {
                if(e.id==data.id) {
                    e.isReady = data.isReady;
                    console.log("qStatus", e.id, data.isReady)
                }
            })
            _this.q=_this.q.filter(function () {
                return true;
            })
            console.log("qStatus", _this.q)

        });

    })
}
function chattextChange(_this, e) {
    if(e.keyCode==13 && _this.chatText.length>0){
        axios.post("/rest/api/chat",{text:_this.chatText})
            .then(function (e) {
                _this.chatText="";
                // _this.q.push(e.data);
                setTimeout(function () {
                    var objDiv = document.getElementById("chatBox");
                    objDiv.scrollTop = objDiv.scrollHeight;
                },100)
            })
    }
}
function qtextChange(_this,e) {
    if(e.keyCode==13 && _this.qText.length>0){
        axios.post("/rest/api/quest",{text:_this.qText})
            .then(function (e) {
                _this.qText="";
                // _this.q.push(e.data);
                setTimeout(function () {
                    var objDiv = document.getElementById("qBox");
                    objDiv.scrollTop = objDiv.scrollHeight;
                },100)
            })
    }
}