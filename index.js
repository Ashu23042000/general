const socket = io();
let offer;
let answer;
let peerConnection;
let me;
let idToCall;
let localStream;
let isAudio = true;
let isVideo = true;

const selfView = document.getElementById("selfView");
const remoteView = document.getElementById("remoteView");
const otherId = document.getElementById("otherId");
const myId = document.getElementById("myId");

function getUserId() {
    idToCall = otherId.value;
    console.log(idToCall);
};

socket.once("me", id => {
    me = id;
    myId.innerText = me;
    console.log(me);
});

peerConnection = new RTCPeerConnection({
    iceServers: [
        {
            url: ["stun:stun.stunprotocol.org", "stun.12connect.com:3478"]
        }
    ]
});


function sendData(data) {
    data.to = idToCall;
    data.from = me;
    // console.log(data);
    socket.emit("send", data);
};

socket.on("send", handleSignalingData);

function successFull() {
    console.log("Successfull");
}


function Rejected() {
    console.log("Rejected");
}

async function handleSignalingData(data) {
    switch (data.type) {
        case "answer":
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            break;

        case "offer":
            // await peerConnection.setRemoteDescription(data.offer);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            recieveCall(data);
            break;

        case "candidate":
            if (data.candidate) {
                // console.log(data.candidate);
                await peerConnection.addIceCandidate(data.candidate, successFull, Rejected);
            }
            break;
    }
}

async function start() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    selfView.srcObject = localStream;


    const dataChannel = peerConnection.createDataChannel("myDataChannel");

    dataChannel.onopen = () => {
        console.log("Channel Opened");
    }

    console.log(localStream);
    peerConnection.addStream(localStream);

    // peerConnection.onaddstream = (e) => {
    //     console.log(e.stream);
    //     remoteView.srcObject = e.stream;
    // };

    // peerConnection.onicecandidate = (e) => {

    //     if (e.candidate == null) {
    //         return;
    //     }

    //     sendData({
    //         type: "candidate",
    //         candidate: e.candidate
    //     });
    // };

    createAndSendOffer();
}

async function createAndSendOffer() {
    offer = await peerConnection.createOffer();

    sendData({
        type: "offer",
        offer
    });

    await peerConnection.setLocalDescription(offer);
};

async function recieveCall(data) {
    idToCall = data.from;

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    selfView.srcObject = localStream;


    // peerConnection = new RTCPeerConnection({
    //     iceServers: [
    //         {
    //             url: ["stun:stun.stunprotocol.org", "stun.12connect.com:3478"]
    //         }
    //     ]
    // });


    peerConnection.ondatachannel = (e) => {
        let dataChannel = e.channel;
        dataChannel.onopen = () => {
            console.log("Channel Opened");
        }
    }

    // await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

    peerConnection.addStream(localStream);

    // peerConnection.onaddstream = (e) => {
    //     console.log(e.stream);
    //     remoteView.srcObject = e.stream;
    // };

    createAndSendAnswer();

    peerConnection.onicecandidate = (e) => {

        if (e.candidate == null) {
            return;
        }
        sendData({
            type: "candidate",
            candidate: e.candidate
        });

    };


}


peerConnection.onaddstream = (e) => {
    console.log(e.stream);
    remoteView.srcObject = e.stream;
};

peerConnection.onicecandidate = (e) => {

    if (e.candidate == null) {
        return;
    }

    sendData({
        type: "candidate",
        candidate: e.candidate
    });
};

async function createAndSendAnswer() {

    answer = await peerConnection.createAnswer();

    sendData({
        type: "answer",
        answer
    });

    await peerConnection.setLocalDescription(answer);
}


function muteAudio() {
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
};

function muteVideo() {
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
};