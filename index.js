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

// enable CORS for socket connections


const activeMeetings = new Set();




io.on('error', (error) => {
    console.error('Socket error:', error.message);
});

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('startMeeting', ({ token, meetingId }, callback) => {
    axios.get('http://localhost:8050/api/courses/start/' + meetingId, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      // handle success
      console.log(response.data);
      activeMeetings.add(meetingId);

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
    const hasMeeting = activeMeetings.has(meetingId);

    // i should verify if it's a student first
    if (!hasMeeting) {
        //Check if the student is allowed to attend the meeting !!!!!!!!
      return callback({ error: 'Meeting not found' });
    }

    axios.get('http://localhost:8050/api/courses/join/' + meetingId, {
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
    console.log("here",stream);
    //io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    /*if (Object.keys(stream).length !== 0) {
        // Broadcast the stream to all sockets in the meeting room
        io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    }*/
    socket.broadcast.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream: stream });
    
  });
  socket.on('message', ({ meetingId, message ,sender}) => {
    console.log("here",message);
    //io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    /*if (Object.keys(stream).length !== 0) {
        // Broadcast the stream to all sockets in the meeting room
        io.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, stream:stream });
    }*/
    socket.broadcast.to(`meeting-${meetingId}`).emit('stream', { socketId: socket.id, message: message ,sender: sender });
    
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
