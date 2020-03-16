var YTplayer;
new Vue({
    el: '#app',
    data: {
        sect:[{title:"Вопросы", isActive:false, id:1}, {title:"Чат", isActive:true, id:2},{title:"Участники", isActive:false, id:3} ],
        qText:"",
        chatText:"",
        q:[],
        chat:[],
        users:[],
        activeSection:2,
        webCamStream:null,
        handUp:false,

    },
    computed: {
        users: function() {
            return this.users;
        },
        q: function() {
            return this.q;
        },
        chat: function() {
            return this.chat;
        },
    },
    methods: {
        isWebRtc:function(){
            var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            var ya =/YaBrowser/.test(navigator.userAgent) ;
            var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
            var isRTC=typeof(RTCPeerConnection)=="function"
              return  ((isChrome || ya) && !isMobile && isRTC);
        },
        qFileClick:function(){
            var elem= document.createElement("input");
            elem.type="file"
            elem.style.display="none";
            elem.accept="video/*;capture=camcorder";
            elem.onchange=function(){
                console.log(elem.files[0])
                var fd = new FormData();
                fd.append('file', elem.files[0]);
                axios({
                    method: 'post',
                    url: '/fileUpload',
                    data: fd,
                    headers: {'Content-Type': 'multipart/form-data' }
                }).then(function () {
                    setTimeout(function () {
                        var objDiv = document.getElementById("qBox");
                        objDiv.scrollTop = objDiv.scrollHeight;
                    },10)
                });

                elem.parentNode.removeChild(elem)
            }
            document.body.appendChild(elem);

            elem.click();
        },
        handUpClick:function(){
            console.log("handUpClick")
            var _this=this;
            if(this.handUp)
                this.handUp=false
            else
                this.handUp=true;// this.handUp;
            axios.post("/rest/api/handup",{id:userId,handUp:this.handUp});
            if(_this.handUp)
                setTimeout(function () {
                    _this.handUp=false;
                    axios.post("/rest/api/handup",{id:userId,handUp:_this.handUp});
                }, 3*60*1000);
        },
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
            if(this.qText.length>0)
                qtextChange(_this,e)
            else
                document.getElementById('qText').focus()

        },
        qtextSend:function (e) {
            var _this=this;
            if(this.qText.length>0)
                qtextSend(_this)
            else
                document.getElementById('qText').focus()


        },
        chattextSend(_this){
            if(this.chatText.length>0)
            chattextSend(this) ;
            else
                document.getElementById('chatText').focus()
        },
        chattextChange:function (e) {
            var _this=this;
            if(this.chatText.length>0)
            chattextChange(_this, e);
            else
                document.getElementById('chatText').focus()

        },
        chatAddSmile:function () {
            this.chatText+=" :) ";
            document.getElementById("chatText").focus();
        },
        isEsc6:function () {
            try { eval('"use strict";const s=()=>{;;}; s();'); return true}
            catch (e)
            { console.log(e);
            return false
            }
        },
        startRTC:function () {
            var _this=this;
            if(typeof (initCam)=='undefined')
            {
                var s = document.createElement('script');
                s.src = "/javascripts/rtcScript.js";
                s.type = "text/javascript";
                s.async = false;
                s.onload=function (){
                    getStream();
                }// <-- this is important
                document.getElementsByTagName('head')[0].appendChild(s);
            }
            else
                getStream();
            function getStream(){
                initCam(_this)
                    .then(function (stream) {
                        _this.webCamStream=stream;
                        setTimeout(function () {
                            var video=document.getElementById("myVideo")
                                video.srcObject=_this.webCamStream;
                            var remoteVideo=document.getElementById("remoteVideo")
                            startSnap(video, _this);
                            startConf(video,remoteVideo, _this)
                            remoteVideo.addEventListener("playing", function () {
                               // alert(123)
                                remoteVideo.style.display="block";
                                YTplayer.mute();
                                console.log("remoteVideo ON", YTplayer.isMuted())
                                //alert(YTplayer.isMuted)

                            })

                            }, 0)
                    })
            }

        }
    },
    mounted:  function () {
        var _this=this;

        var player;


      //  setTimeout(onYouTubeIframeAPIReady,1000)

        connect(_this);
        axios.get("/rest/api/quest")
            .then(function (r) {
                _this.q=r.data;
            })
        axios.get("/rest/api/chat")
            .then(function (r) {
                _this.chat=r.data;
            })
        axios.get("/rest/api/users")
            .then(function (r) {
                _this.users=r.data;

                console.log(_this.users)
            })
    }

});

function onYouTubeIframeAPIReady() {
    console.log(" onYouTubeIframeAPIReady();")
    YTplayer = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '3PMNjsa5sGA',
        host: 'https://www.youtube.com',
        events: {
            // 'onReady': onPlayerReady,
            // 'onStateChange': onPlayerStateChange
        }
    });
}



