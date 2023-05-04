const startButton = document.getElementById('startButton');
const video = document.getElementById('video');
video.muted = true;
const socket = io('http://localhost:3000');
token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhYmRlbGtyaW1Aa3JlZXphbGlkLmNvbSIsImlhdCI6MTY4MzA5Mzg1NywiZXhwIjoxNjg1Njg1ODU3fQ.Lg8ZsuG_BRxjyLZXT2dKtrfqGZy_TURyybGbf6wf-G4";

socket.emit('startMeeting', { token: token, meetingId:'6451f268280176c1a9e604fe'}, (response) => {
    if (response.error) {
      // Handle the error
      console.error(response.error);
    } else {
      // Get the meeting ID from the response and log it to the console
      //const meetingId = response.meetingId;
      console.log(`Meeting started with ID ${response}`,response); 
    }
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    if (stream.getTracks().length > 0) {
      console.log("here");
      console.log(stream);
      // Display the camera stream in the video element
      video.srcObject = stream;
      //socket.emit('stream', {   meetingId:meetingId , stream : stream });
      

   
      //socket.emit('stream', {  meetingId:meetingId , data:stream });
    }
  }).catch(error => {
    console.error('Failed to access camera:', error);
  });


async function startStreaming() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm; codecs=vp8,opus' });


  mediaRecorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      const buffer = await event.data.arrayBuffer();
      socket.emit('stream', {meetingId : '6451f268280176c1a9e604fe',stream : buffer});
    }
  };

  mediaRecorder.start(1000); // capture video and audio every second

  const videoElement = document.getElementById('video-player');
  const mediaSource = new MediaSource();
  videoElement.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener('sourceopen', () => {
    const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs=vp8,opus');

    socket.on('stream', async (data) => {
      const buffer = await data.stream;
      sourceBuffer.appendBuffer(buffer);
      videoElement.play();
    });
  });

  socket.on('userDisconnected' , (obj)=>{
    console.log(obj.socketId);
    videoElement.src = null;
  });

  socket.on('askQuestion', function(obj) {
    const button = document.createElement('button');
    button.innerText = 'Allow question';
    button.dataset.socketId = obj.socketId;
    document.body.appendChild(button);
  
    button.addEventListener('click', function() {
      const socketId = button.dataset.socketId;
      console.log("sending askquestion event");
      socket.emit('permissionAccepted', {socketId : socketId});
      button.style.display = 'none';
    });
  });

  socket.on('audio', async function(obj) {
    console.log("i'm receiving this audio" , obj);
    const audioBlob = new Blob([obj.audio], { type: 'audio/webm; codecs=opus' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
  });
  
}

startStreaming();


