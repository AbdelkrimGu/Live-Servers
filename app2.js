const startButton = document.getElementById('startButton');
const askQuestionBtn = document.getElementById("askQuestionBtn");
//const video = document.getElementById('video');
//video.muted = true;
const socket = io('http://localhost:3000');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhLmd1ZW5hbm91QGVzaS1zYmEuZHoiLCJpYXQiOjE2ODMwOTgzNTcsImV4cCI6MTY4NTY5MDM1N30.w6zojvO2KTrH5BhwRgkFFzpbTjn9bFumUXhWrCMXfuY';

socket.emit('joinMeeting', {token : token , meetingId:'6451f268280176c1a9e604fe' }, (response) => {
    if (response.error) {
      // Handle the error
      console.error(response.error);
    } else {
      // Get the meeting ID from the response and log it to the console
      //const meetingId = response.meetingId;
      console.log(`Meeting started with ID ${response}`,response);
    }
});


socket.on('stream', ({ socketId, stream }) => { 
    console.log("socket id2 :"+socketId , stream); 
    //const mediaStream = new MediaStream([videoTrack, audioTrack]);
    //console.log("receiving :",stream);
    // Create a new video element for the stream
    const videoElement = document.createElement('video');
    videoElement.srcObject = video;
    videoElement.autoplay = true;
    videoElement.muted = socketId === socket.id; // Mute the local user's video
    videoContainer.appendChild(videoElement);
});
/*const mediaConstraints = { video: true, audio: true };
const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
const mediaTrack = mediaStream.getTracks()[0];
mediaTrack.ondataavailable = (event) => {
    console.log('Media track data available.');
    socket.emit('stream', { meetingId : meetingId, stream: event.data });
};*/





async function startStreaming() {
  /*await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
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
  });*/

  /*const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm; codecs=vp8,opus' });


  mediaRecorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      const buffer = await event.data.arrayBuffer();
      await socket.emit('stream', {meetingId : '6451f268280176c1a9e604fe',stream : buffer});
    }
  };

  mediaRecorder.start(1000); // capture video and audio every second

  const videoElement = document.getElementById('video-player');
  const mediaSource = new MediaSource();
  videoElement.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener('sourceopen', () => {
    console.log(12);
    const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs=vp8,opus');

    socket.on('stream', async (data) => {
      const buffer = await data.stream;
      sourceBuffer.appendBuffer(buffer);
      videoElement.play();
    });
  });*/
  socket.on('userDisconnected' , (obj)=>{
    console.log(obj.socketId);
    videoElement.src = URL.createObjectURL(mediaSource);
  });

  askQuestionBtn.addEventListener('click', async function() {
    console.log("sending askquestion event");
    await socket.emit('askQuestion', {meetingId : '6451f268280176c1a9e604fe'});
  });

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

  socket.on('permissionAccepted', async function() {
    console.log("receiveing permession for askquestion event");
    /*navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
  
        mediaRecorder.addEventListener("dataavailable", function(event) {
          audioChunks.push(event.data);
        });
  
        mediaRecorder.addEventListener("stop", async function() {
          const audioBlob = new Blob(audioChunks);
          console.log("sending audio");
          await socket.emit('audio', {meetingId : '6451f268280176c1a9e604fe', audio : audioBlob});
          audioChunks.length = 0;
        });
        mediaRecorder.start();
      })
      .catch(function(err) {
        console.error('Error accessing microphone:', err);
      });*/

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm; codecs=opus' });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const buffer = await event.data.arrayBuffer();
          await socket.emit('audio', { meetingId: '6451f268280176c1a9e604fe', audio: buffer });
        }
      };

      mediaRecorder.start(1000);

  });

  socket.on('audio', function(obj) {
    const audioBlob = new Blob([obj.audio], { type: 'audio/webm; codecs=opus' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  });
  
}

startStreaming();


