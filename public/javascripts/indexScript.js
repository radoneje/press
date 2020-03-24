
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
                            var videoEventHandler=function(){
                                remoteVideo.style.display="block";

                                var videoEl = document.getElementById('video')
                                if(videoEl)
                                    videoEl.muted=true;
                                //console.log("remoteVideo ON", YTplayer.isMuted())
                                socket.emit("mayShowScreen", {id: userId});
                                remoteVideo.removeEventListener("playing",videoEventHandler,true)
                            }
                            remoteVideo.addEventListener("playing", videoEventHandler)

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
        startVideo();
    }

});

function startVideo() {
    var video = document.getElementById('video');
    var html=GetFlashPlayer();
    var parent=video.parentNode; // some E DOM instance
    var videoObj=document.createElement('div'); //element which should be first in E
    videoObj.innerHTML="html";
    eElement.insertBefore(videoObj, parent.firstChild);
    parent.removeChild(video)
return;
    if (Hls.isSupported()) {

        var hls = new Hls();
        console.log("init HLS")
        hls.loadSource(video.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log("MANIFEST_PARSED")
            var banner=document.querySelector(".videoPlayBannner");
            banner.style.display="flex";
            banner.onclick=function () {
                console.log("PLAY")
                video.play();
                banner.style.display="none";
            }
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        // try to recover network error
                        console.log("fatal network error encountered, try to recover");
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log("fatal media error encountered, try to recover");
                        hls.recoverMediaError();
                        break;
                    default:
                        // cannot recover
                        hls.destroy();
                        break;
                }
            }
        });
    }
    // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
    // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element through the `src` property.
    // This is using the built-in support of the plain video element, without using hls.js.
    // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
    // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        //video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
        video.addEventListener('loadedmetadata', function() {
            video.play();
        });
    }
}
function GetFlashPlayer(){
    return('<object width="1020" height="574" id="slon" data="https://www.aloha.cdnvideo.ru/aloha/slon/SlonPlayer_new.swf" type="application/x-shockwave-flash">'+
        '<script type="text/javascript">'+
        'if (typeof window.external.msActiveXFilteringEnabled != "undefined"'+
        ' && window.external.msActiveXFilteringEnabled() == true) {'+
        'document.write(\'<div style="width:1020px;height:574px">Для просмотра отключите фильтрацию ActiveX внастройках браузера и перезагрузите эту страницу</div>\');}<\/script>' +
        '<param name="movie" value="https://www.aloha.cdnvideo.ru/aloha/slon/SlonPlayer_new.swf" />'+
        '<param name="allowfullscreen" value="true" />'+
        '<param name="allowscriptaccess" value="always" />'+
        '<param name="flashvars" value='+
        '"config='+
        '{ \'playlist\':'+
        '{\'autoPlay\' : \'false\' '+
        ', \'startPoster\':\'/images/bg_01.png\' '+                                        ',\'clip\' :  '+
        '{\'live\': \'true\'  '+
        ',\'progressLine\':\'false\' '+
        ',\'url\': \'rtmp://aurora.cdnvideo.ru/aurora/aurora1.sdp\' '+
        '}'+
        '}'+
        '};"'+
        '/>'+
        '</object>');
}
/*function onYouTubeIframeAPIReady() {
    console.log(" onYouTubeIframeAPIReady();")
    YTplayer = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: 'WKXb0XVQMr4',
        host: 'https://www.youtube.com',
        events: {
             'onReady': onPlayerReady,
            // 'onStateChange': onPlayerStateChange
        },
        showinfo:0
    });

}
function onPlayerReady(event) {
    YTplayer.playVideo();

}*/



