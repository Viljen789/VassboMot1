// vassbo-mot-1-backend/server.js

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

// Definer PORT før bruk
const PORT = process.env.PORT || 3001;
const io = socketIo(server);

// Middleware
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

	// Lytt etter at klienten legger til seg i et rom
	socket.on('joinRoom', (gameCode) => {
		socket.join(gameCode);
		console.log(`Klient har lagt seg til rommet: ${gameCode}`);
	});

	socket.on('disconnect', () => {
		console.log('En klient har koblet fra');
	});
});
// Backend route for starting the game
app.post('/api/game/start', (req, res) => {
	console.log(req.body); // Log incoming request body
});
app.post('/api/game/start', (req, res) => {
	const {gameCode} = req.body;
	console.log(`Received request to start game with code: ${gameCode}`);

	const game = games[gameCode];
	if (!game) {
		console.error(`Game with code ${gameCode} not found.`);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	try {
		game.startGame(req.app.get('io')); // Call the Game class's startGame method
		console.log(`Game with code ${gameCode} successfully started.`);
		res.json({message: 'Spillet er startet.', game});
	} catch (err) {
		console.error(`Error in starting game for code ${gameCode}:`, err.message);
		res.status(400).json({error: err.message});
	}
});
// Start serveren
server.listen(PORT, () => {
	console.log(`Server kjører på port ${PORT}`);
});
