// vassbo-mot-1-backend/server.js

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000', // Frontend URL
		methods: ['GET', 'POST']
	}
});

app.use(cors({
	origin: 'http://localhost:3000', // Frontend URL
}));
app.use(bodyParser.json());

// Gjør Socket.io tilgjengelig i kontrollerne
app.set('io', io);

// Importer og bruk spillrutene
const gameRoutes = require('./routes/gameRoutes');
app.use('/', gameRoutes);

// Socket.io hendelser
io.on('connection', (socket) => {
	console.log('En klient er tilkoblet');

	socket.on('disconnect', () => {
		console.log('En klient har koblet fra');
	});
});

// Start serveren
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`Server kjører på port ${PORT}`);
});
