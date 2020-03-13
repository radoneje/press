var webcamStream = null;        // MediaStream from webcam

var mediaConstraints = {
    audio: true,            // We want an audio track
    video: {
        aspectRatio: {
            ideal: (16/9)     // 3:2 aspect is preferred
        }
    }
};


async function invite(evt) {
    log("Starting to prepare an invitation");
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        document.getElementById("local_video").srcObject = webcamStream;
    } catch(err) {
        handleGetUserMediaError(err);
        return;
    }
}
 function hangUpCall() {
    console.log(1)
     invite();

}