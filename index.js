const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const JwtVerifier = require("./functions/JwtVerifier");
const axios = require('axios');



const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: '*'
    }
});




const PORT = process.env.PORT || 3000;
const ngrokurl = " https://3f0f-41-101-206-187.ngrok-free.app";
// const url = "http://localhost:8050"

// enable CORS for socket connections


const activeMeetings = {};
const questionSockets = {};




io.on('error', (error) => {
    console.error('Socket error:', error.message);
});

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('startMeeting', ({ token, meetingId }, callback) => {
    axios.get(ngrokurl+'/api/courses/start/' + meetingId, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      // handle success
      console.log(response.data);
      activeMeetings[meetingId] = socket;

      // Join the teacher to the meeting room
      socket.join(`meeting-${meetingId}`);

      // Add the teacher's socket to the list of sockets for the meeting
      //activeMeetings[meetingId].sockets.push(socket);
      callback({ b: true });
    })
    .catch(error => {
      // handle error
      console.log(error);
      callback({ b: false });
    });

  });

  socket.on('joinMeeting', ({ token , meetingId }, callback) => {
    console.log("object:"+meetingId);
    // Get the meeting details from the list of active meetings
    const hasMeeting = meetingId in activeMeetings;

    // i should verify if it's a student first
    if (!hasMeeting) {
        //Check if the student is allowed to attend the meeting !!!!!!!!
      return callback({ error: 'Meeting not found' });
    }

    axios.get(ngrokurl+'/api/courses/join/' + meetingId, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      // handle success
      console.log(response.data);
      // Save the meeting ID to the socket object
      socket.meetingId = meetingId;

      // Join the socket to the meeting room
      socket.join(`meeting-${meetingId}`);

      // Add the socket to the list of sockets for the meeting
      //meeting.sockets.push(socket);

      // Send a callback with the meeting details
      callback({ b: true });
    })
    .catch(error => {
      // handle error
      console.log(error);
      callback({ b: false });
    });


    
  });

  socket.on('stream', ({ meetingId, stream }) => {
    console.log("here stream",stream);
    //io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    /*if (Object.keys(stream).length !== 0) {
        // Broadcast the stream to all sockets in the meeting room
        io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    }*/
    socket.broadcast.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream: stream });
    
  });

  socket.on('audio', ({ meetingId, audio }) => {
    console.log("here audio",audio);
    //io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    /*if (Object.keys(stream).length !== 0) {
        // Broadcast the stream to all sockets in the meeting room
        io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    }*/
    socket.broadcast.to(`meeting-${meetingId}`).emit('audio', {  audio: audio });
    
  });

  socket.on('askQuestion', ({meetingId}) => {
    const teacherSocket = activeMeetings[meetingId];
    if (teacherSocket) {
      questionSockets[socket.id] = socket;
      teacherSocket.emit('askQuestion' , {socketId : socket.id});
    }
  });


  socket.on('permissionAccepted', ({socketId}) => {
    const studentSocket = questionSockets[socketId];
    console.log(studentSocket);
    if (studentSocket) {
      delete questionSockets[socketId];
      studentSocket.emit('permissionAccepted');
    }
  });

  

  socket.on('message', ({ meetingId, message ,sender}) => {
    console.log("here",message);
    socket.broadcast.to(`meeting-${meetingId}`).emit('message', { socketId: socket.id, message: message ,sender: sender });
    
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    // Get the meeting ID from the socket object
    const meetingId = socket.meetingId;

    // If the socket was not part of a meeting, do nothing
    if (!meetingId) return;

    socket.broadcast.to(`meeting-${meetingId}`).emit('userDisconnected', { socketId: socket.id, meetingId });
    console.log(`Socket ${socket.id} left meeting ${meetingId}`);
    socket.leave(`meeting-${meetingId}`);
    

  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
