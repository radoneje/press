let pc1;
let pcSpk;
async function   initCam (_this){
    const constraints={
        audio: true,
        video: {
            width: { min: 320, ideal: 640, max: 720 },
            facingMode: "user",
            aspectRatio: 1.777777778
        }
    }
    var stream=await navigator.mediaDevices.getUserMedia(constraints)
    return stream;
}
function takeASnap(vid){
    var canvas=document.getElementById('snapCanvas');

    if(!canvas) {
        //console.log("init canvas")

        canvas = document.createElement('canvas'); // create a canvas
        canvas.id='snapCanvas';
        canvas.width = vid.videoWidth; // set its size to the one of the video
        canvas.height = vid.videoHeight;
    }
    const ctx = canvas.getContext('2d'); // get its context
    ctx.drawImage(vid, 0,0); // the video
    return new Promise((res, rej)=>{
        canvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
        console.log()
       // canvas.parentNode.removeChild(canvas);
    });
}
function startSnap(video, _this) {
    setTimeout(async ()=>{
        var jpg=await takeASnap(video)
        if(jpg) {
            var reader = new FileReader();
            reader.readAsDataURL(jpg);
            reader.onloadend = function() {
                var base64data = reader.result;
                socket.emit("videoSnapshot", {id: userId, jpg: base64data});
            }
        }
        startSnap(video, _this);
    }, 1000)

}

const configuration = {
    iceServers: [
        /* urls: 'stun:stun.l.google.com:19302', // Google's public STUN server
         urls: 'stun:stun1.l.google.com:19302', // Google's public STUN server
         urls: 'stun:stun2.l.google.com:19302', // Google's public STUN server
         urls: 'stun:stun3.l.google.com:19302', // Google's public STUN server
         urls: 'stun:stun4.l.google.com:19302' // Google's public STUN server*/
        {
            'urls': 'turn:re.rustv.ru:3478?transport=udp',
            'credential': 'dffdgdfghfgdh',
            'username':"dfhfdfdg"
        },
        {
            'urls': 'turn:lambda.rustv.ru:3478?transport=udp',
            'credential': 'dffdgdfghfgdh',
            'username':"dfhfdfdg"
        }
    ]
};
function startConf(myVideo, remoteVideo) {

   /* let pc1;
    let pc2;
    const offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };
    console.log("startConf", myVideo.srcObject);

    const servers = configuration;
    pc1 = new RTCPeerConnection(servers);
    console.log('Created local peer connection object pc1');
    pc1.onicecandidate = e => onIceCandidate(pc1, e);
    pc2 = new RTCPeerConnection(servers);
    console.log('Created remote peer connection object pc2');
    pc2.onicecandidate = e => onIceCandidate(pc2, e);
    pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e);
    pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
    pc2.ontrack = gotRemoteStream;
    myVideo.srcObject.getTracks().forEach(track => pc1.addTrack(track, myVideo.srcObject));
    console.log('Added local stream to pc1');

    console.log('pc1 createOffer start');
    pc1.createOffer(onCreateOfferSuccess, onCreateSessionDescriptionError, offerOptions);

    function onCreateOfferSuccess(desc) {
        console.log(`Offer from pc1${desc.sdp}`);
        console.log('pc1 setLocalDescription start');
        pc1.setLocalDescription(desc, () => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
        console.log('pc2 setRemoteDescription start');
        pc2.setRemoteDescription(desc, () => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
        console.log('pc2 createAnswer start');
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        pc2.createAnswer(onCreateAnswerSuccess, onCreateSessionDescriptionError);
    }


    function onIceCandidate(pc, event) {
        getOtherPc(pc).addIceCandidate(event.candidate)
            .then(
                () => onAddIceCandidateSuccess(pc),
                err => onAddIceCandidateError(pc, err)
            );
        console.log(`${getName(pc)} ICE candidate:${event.candidate ? event.candidate.candidate : '(null)'}`);
    }

    function onAddIceCandidateSuccess(pc) {
        console.log(`${getName(pc)} addIceCandidate success`);
    }

    function onAddIceCandidateError(pc, error) {
        console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
    }

    function getOtherPc(pc) {
        return (pc === pc1) ? pc2 : pc1;
    }

    function getName(pc) {
        return (pc === pc1) ? 'pc1' : 'pc2';
    }

    function onIceStateChange(pc, event) {
        if (pc) {
            console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
            console.log('ICE state change event: ', event);
        }
    }

    function gotRemoteStream(event) {
        if (remoteVideo.srcObject !== event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
            console.log('pc2 received remote stream', event);
        }
    }

    function onCreateSessionDescriptionError(error) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }

    function onSetSessionDescriptionError(error) {
        console.log(`Failed to set session description: ${error.toString()}`);
    }
    function onCreateAnswerSuccess(desc) {
        console.log(`Answer from pc2:
${desc.sdp}`);
        console.log('pc2 setLocalDescription start');
        pc2.setLocalDescription(desc, () => onSetLocalSuccess(pc2), onSetSessionDescriptionError);
        console.log('pc1 setRemoteDescription start');
        pc1.setRemoteDescription(desc, () => onSetRemoteSuccess(pc1), onSetSessionDescriptionError);
    }
    function onSetLocalSuccess(pc) {
        console.log(`${getName(pc)} setLocalDescription complete`);
    }

    function onSetRemoteSuccess(pc) {
        console.log(`${getName(pc)} setRemoteDescription complete`);
    }*/
}
function stopBroadcast(_this, data, video) {
    console.log("stop broadcasdt")
    if(remoteVideo.srcObject)
        document.location.reload(false);
    remoteVideo.srcObject=null;
    remoteVideo.style.display="none"
    YTplayer.unMute()
    pcSpk=null;

}
function startBroadcast(_this, data, video){
    if(_this.handUp)
    {
        _this.handUp=false;
        axios.post("/rest/api/handup",{id:userId,handUp:_this.handUp});
    }
    console.log("start Br")
    const offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };
    const servers = configuration;

    pc1 = new RTCPeerConnection(servers);
    pcSpk = new RTCPeerConnection(servers);
    video.srcObject.getTracks().forEach(track => pc1.addTrack(track, video.srcObject));
    pc1.onicecandidate = (event) => {
        sendToServer({clientid:data.id, candidate:event.candidate}, "icecandidate")
        }

    pc1.createOffer((desc)=>{
        pc1.setLocalDescription(desc, ()=>{console.log("set Descr OK")})
        sendToServer({desc:desc, id:data.id}, "videoOffer")
    }, err, offerOptions);
    ////////////////////
    pcSpk.setRemoteDescription(data.desc,()=>{console.log("remote descr set")},()=>{console.warn("remote descr err")});
    pcSpk.createAnswer((answ)=>{
        pcSpk.setLocalDescription(answ, ()=>{console.warn("local descr err")});
        sendToServer({clientid:data.id, answ:answ}, "videoAnswer")
        console.log("createAnswer succ", answ);
    }, ()=>{console.warn("remote descr err")});
    pcSpk.onicecandidate = (event) => {
        console.log("sent candidate",event )
        sendToServer({clientid:data.id, candidate:event.candidate}, "icecandidate2")
    }
    pcSpk.ontrack=function(event){

            if (remoteVideo.srcObject !== event.streams[0]) {
                remoteVideo.srcObject = event.streams[0];
                setTimeout(()=>{
                    remoteVideo.play();
                    console.warn('PLAY')
                },500)


                remoteVideo.addEventListener("playing", function () {


                })
                console.log('ON TRACK received remote stream', event);
            }
            console.log("ON TRACK!", event.streams)
        }
}
function videoAnswer(data) {
    pc1.setRemoteDescription(data.answ,()=>{console.log("remote Descr OK")}, (err)=>{console.warn("remote Descr err", err)})
}
function  videoIce(data) {
    pc1.addIceCandidate(data.candidate)
        .then(()=>{console.log("candidate  OK")})
        .catch((e)=>{console.warn("candidate  err", e)})
}
function  videoIce2(data) {
    console.log("videoIce2");
    pcSpk.addIceCandidate(data.candidate)
        .then(()=>{console.log("candidate2  OK")})
        .catch((e)=>{console.warn("candidate2  err", e)})
}

function err(e) {

    console.warn("Error", e)
}