const startButton = document.getElementById('startButton');
const video = document.getElementById('video');
video.muted = true;
const socket = io('http://localhost:3000');

socket.emit('startMeeting', { teacherId: '123', meetingId:'77'}, (response) => {
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

/*socket.on('stream', ({ socketId, stream }) => {
    console.log("socket id2 :"+socketId , stream);
    //const mediaStream = new MediaStream([videoTrack, audioTrack]);
    //console.log("receiving :",stream);
    // Create a new video element for the stream
    /*const videoElement = document.createElement('video');
    videoElement.srcObject = video;
    videoElement.autoplay = true;
    videoElement.muted = socketId === socket.id; // Mute the local user's video
    videoContainer.appendChild(videoElement);
});*/
/*const mediaConstraints = { video: true, audio: true };
const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
const mediaTrack = mediaStream.getTracks()[0];
mediaTrack.ondataavailable = (event) => {
    console.log('Media track data available.');
    socket.emit('stream', { meetingId : meetingId, stream: event.data });
};*/





async function startStreaming() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm; codecs=vp8,opus' });


  mediaRecorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      const buffer = await event.data.arrayBuffer();
      socket.emit('stream', {meetingId : '77',stream : buffer});
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
  
}

startStreaming();


