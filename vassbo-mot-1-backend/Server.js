// vassbo-mot-1-backend/server.js

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
	origin: '*', // Consider restricting this in production
}));
app.use(bodyParser.json());

// Setup Socket.io
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000', // Frontend URL
		methods: ['GET', 'POST'],
	},
});
app.set('io', io);

// Import and use game routes
const gameRoutes = require('./routes/gameRoutes');
app.use('/api', gameRoutes);

// Socket.io Events
io.on('connection', (socket) => {
	console.log('A client connected');

	socket.on('joinRoom', (gameCode) => {
		socket.join(gameCode);
		console.log(`Client joined room: ${gameCode}`);
	});

	socket.on('disconnect', () => {
		console.log('A client disconnected');
	});
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on port ${PORT}`);
});
