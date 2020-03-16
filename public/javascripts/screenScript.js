

new Vue({

    el: '#app',
    data: {
        desc:{},
        q:[],
        chat:[],
        users:[],
        pcUser:null,
        pc2:null,
        myVideo:null,
        jpg:[],
        qScreen:[],
    },
    watch:{

    },
    computed: {
        users: function() {
            return this.users;
        },
        q: function(e) {
            return this.q;
        },
        q: function() {
            return this.q;
        },
        chat: function() {
            return this.chat;
        },
    },
    methods: {
        StartShowUploadedVideo:function(data){
            console.log("StartShowUploadedVideo 2", data)

            var videoWr=document.getElementById('screenUpladedVideoWr')
            if(videoWr){
                video.parentNode.removeChild(video)
            }
            var videoWr=document.createElement('div')
            videoWr.id="screenUpladedVideoWr"

            var video=document.createElement('video')
            video.onloadedmetadata=function(){video.play()}
            video.onplaying=function(){videoWr.classList.add("active")}
            video.preload="metadata";
            video.onended=function(){videoWr.parentNode.removeChild(videoWr)}
            video.src='/uploads/'+data;
            video.id="screenUpladedVideo"
            video.classList.add("screenUpladedVideo")
            videoWr.appendChild(video)
            document.body.appendChild(videoWr);
        },
        stopBroadcastToClient:function(){
            //this.startVideo();
            this.pcUser=null;
            this.pc2=null;
            document.getElementById('userVideo').srcObject=null;
            sendToServer({userid:userId/*кому посылаем команду*/ }, "stopVideoChat")
            var videoWr=document.getElementById('screenUpladedVideoWr')
            if(videoWr){
                videoWr.parentNode.removeChild(videoWr)
            }
            document.location.reload(false);
        },
        startBroadcastToClient:function(toUserId){
            this.startVideo(toUserId);
        },
        stopVideo:async function (toUserId) {
            console.log("stopVideo");
            this.pcUser=null;
            this.pc2=null;
            sendToServer({userid:userId/*кому посылаем команду*/ }, "stopVideoChat")
            var videoWr=document.getElementById('screenUpladedVideoWr')
            if(videoWr){
                videoWr.parentNode.removeChild(videoWr)
            }
            document.location.reload(false);
        },

        startVideo:async function (toUserId) {
            var _this=this;
            console.log("startVideo", toUserId);

            const constraints={
                audio: true,
                video:true/* {
                    width: { min: 320, ideal: 640, max: 720 },
                    facingMode: "user",
                    aspectRatio: 1.777777778
                }*/
            }
            var myVideo=document.getElementById('speakerVideo')
            myVideo.srcObject=await navigator.mediaDevices.getUserMedia(constraints)

            var servers = {
                iceServers: [
                    /* urls: 'stun:stun.l.google.com:19302', // Google's public STUN server
                     urls: 'stun:stun1.l.google.com:19302', // Google's public STUN server
                     urls: 'stun:stun2.l.google.com:19302', // Google's public STUN server
                     urls: 'stun:stun3.l.google.com:19302', // Google's public STUN server
                     urls: 'stun:stun4.l.google.com:19302' // Google's public STUN server*/
                    {
                        'urls': 'turn:lambda.rustv.ru:3479?transport=udp',
                        'credential': 'dffdgdfghfgdh',
                        'username':"dfhfdfdg"
                    }
                ]
            };
            const offerOptions = {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            };

            this.pc2 = new RTCPeerConnection(servers);
            this.pcUser = new RTCPeerConnection(servers);
            myVideo.srcObject.getTracks().forEach(track => this.pcUser.addTrack(track, myVideo.srcObject));


            this.pc2.oniceconnectionstatechange=()=>{console.log("oniceconnectionstatechange")}
            this.pcUser.createOffer((desc)=>{
                this.pcUser.setLocalDescription(desc, ()=>{console.log("set local Descr OK")})
               // sendToServer({desc:desc, id:clientId}, "videoOffer")
                sendToServer({userid:toUserId/*кому посылаем команду*/,desc:desc }, "startVideoChat")
            }, (e)=>{console.warn("set local Descr ERR", e)}, offerOptions);





        },
        videoOffer:function (data) {
            console.log("videoOffer", data);
            console.log("ice candidate", this.pc2.onicecandidate)
            if(!this.pc2.onicecandidate)
                this.pc2.onicecandidate=(event)=>{
                    sendToServer({clientid:data.id, candidate:event.candidate}, "icecandidate")
                }
            if(!this.pcUser.onicecandidate)
                this.pcUser.onicecandidate = (event) => {
                    console.log("sent candidate",event )
                    sendToServer({clientid:data.id, candidate:event.candidate}, "icecandidate2")
                }
            if(!this.pc2.ontrack)
                this.pc2.ontrack=(event)=>{
                var video=document.getElementById('userVideo')
                    if (video.srcObject !== event.streams[0]) {
                        video.srcObject = event.streams[0];
                        console.log('ON TRACK received remote stream', event);
                    }
                console.log("ON TRACK!", event.streams)
            }
            this.pc2.setRemoteDescription(data.desc,()=>{console.log("remote descr set")},()=>{console.warn("remote descr err")})
            this.pc2.createAnswer((answ)=>{
                this.pc2.setLocalDescription(answ, ()=>{console.warn("local descr err")});
                sendToServer({clientid:data.id, answ:answ}, "videoAnswer")
                console.log("createAnswer succ", answ);
            }, ()=>{console.warn("remote descr err")});
        },
        videoAnswer:function(data){
            this.pcUser.setRemoteDescription(data.answ,()=>{console.log("remote Descr OK")}, (err)=>{console.warn("remote Descr err", err)})
        },
        videoIce:function (data) {
            console.log("va 4", data)
            this.pc2.addIceCandidate(data.candidate)
                .then(()=>{console.log("candidate  OK")})
                .catch((e)=>{console.warn("candidate  err", e)})
        },
        videoIce2:function (data) {
            console.log("va2 4", data)
            this.pcUser.addIceCandidate(data.candidate)
                .then(()=>{console.log("candidate2  OK")})
                .catch((e)=>{console.warn("candidate2  err", e)})
        }


    },
    mounted: async function () {
      var _this=this;
      var re= await axios.get("/rest/api/descr");
      this.desc=re.data;
        var re= await axios.get("/rest/api/smi");
        this.smi=re.data;

        axios.get("/rest/api/quest")
            .then(function (r) {
                _this.q=r.data;
            })
        axios.get("/rest/api/users")
            .then(function (r) {
                _this.users=r.data;
            })
        connect(_this, true);
        setTimeout(function(){
            sendToServer(1,"isScreen")
        },100)

        const constraints={
            audio: true,
            video: {
                width: { min: 320, ideal: 320, max: 720 },
                facingMode: "user",
                aspectRatio: 1.777777778
            }
        }
        setTimeout(async function(){

        },100)

        setInterval(()=>{
            _this.jpg= this.users.filter(u=>{return  u.jpg});
        },1000)
        setInterval(()=>{
            _this.qScreen=_this.q.slice().reverse()
        },1000)

    }
});
