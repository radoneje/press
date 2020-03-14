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
    methods: {
        handUpClick:function(){
            console.log("handUpClick")
            if(this.handUp)
                this.handUp=false
            else
                this.handUp=true;// this.handUp;
            axios.post("/rest/api/handup",{id:userId,handUp:this.handUp});
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
            qtextChange(_this,e)

        },
        chattextChange:function (e) {
            var _this=this;
            chattextChange(_this, e);

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
                                remoteVideo.style.display="block";
                                YTplayer.mute();
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
        videoId: 'QbhAaWgUvrw',
        host: 'https://www.youtube.com',
        events: {
            // 'onReady': onPlayerReady,
            // 'onStateChange': onPlayerStateChange
        }
    });
}



