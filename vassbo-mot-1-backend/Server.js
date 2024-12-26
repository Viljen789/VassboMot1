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
	origin: 'http://localhost:3000', // Frontend URL
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
app.use('/', gameRoutes);

// Socket.io Events
io.on('connection', (socket) => {
	console.log('En klient er tilkoblet');

	socket.on('joinRoom', (gameCode) => {
		socket.join(gameCode);
		console.log(`Klient har lagt seg til rommet: ${gameCode}`);
	});

	socket.on('disconnect', () => {
		console.log('En klient har koblet fra');
	});
});

// Start the server
server.listen(PORT, () => {
	console.log(`Server kjører på port ${PORT}`);
});