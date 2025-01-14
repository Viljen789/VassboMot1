// vassbo-mot-1-backend/Server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import cors
const gameRoutes = require('./routes/gameRoutes'); // Adjust path if necessary

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow requests from this origin
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Middleware
app.use(cors({ // Use cors middleware
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Use the gameRoutes for /api
app.use('/api', gameRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (gameCode) => {
        socket.join(gameCode);
        console.log(`Socket joined room: ${gameCode}`);
    });

    // Handle other socket events as needed

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
