// vassbo-mot-1-backend/Server.js

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000', // Sett til frontend URL
		methods: ['GET', 'POST']
	}
});

app.use(cors({
	origin: 'http://localhost:3000', // Sett til frontend URL
}));
app.use(bodyParser.json());

const games = {};

// Helper function to generate a 6-digit code
const generateGameCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Endpoint to create a new game
app.post('/create-game', (req, res) => {
	const {title} = req.body;
	console.log('Received create-game request with title:', title);
	let gameCode = generateGameCode();

	// Sørg for at koden er unik
	while (games[gameCode]) {
		console.log('Generated gameCode already exists:', gameCode);
		gameCode = generateGameCode();
	}

	games[gameCode] = {
		title,
		gameCode,
		players: [],
		questions: [],
		status: 'created', // statuses: created, in-progress, ended
		currentQuestionIndex: 0,
		scores: {}
	};

	console.log('Game created with gameCode:', gameCode);

	res.json(games[gameCode]);

	// Emit til alle tilkoblede klienter
	io.emit('updateGame', games[gameCode]);
});

// Endpoint for spillere å bli med i et spill
app.post('/join-game', (req, res) => {
	const {gameCode, playerName} = req.body;
	console.log('Received join-game request:', {gameCode, playerName});

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	// Sjekk om spilleren allerede er med
	if (game.players.find(p => p.name === playerName)) {
		console.log('Player name already exists in game:', playerName);
		return res.status(400).json({error: 'Navn allerede i bruk i dette spillet.'});
	}

	const newPlayer = {name: playerName, score: 0};
	game.players.push(newPlayer);
	game.scores[playerName] = 0;

	console.log('Player added:', playerName, 'to game:', gameCode);

	res.json({message: 'Spiller lagt til.', player: newPlayer});

	// Emit til alle tilkoblede klienter
	io.emit('updateGame', game);
});

// Endpoint for admin å legge til spørsmål
app.post('/add-question', (req, res) => {
	const {gameCode, question} = req.body;
	console.log('Received add-question request for gameCode:', gameCode, 'Question:', question);

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	game.questions.push(question);
	console.log('Question added to game:', gameCode, 'Question:', question);

	res.json({message: 'Spørsmål lagt til.', questions: game.questions});

	// Emit til alle tilkoblede klienter
	io.emit('updateGame', game);
});

// Endpoint for admin å starte spillet
app.post('/start-game', (req, res) => {
	const {gameCode} = req.body;
	console.log('Received start-game request for gameCode:', gameCode);

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	if (game.players.length < 2) {
		console.log('Not enough players to start game:', gameCode);
		return res.status(400).json({error: 'Må ha minst 2 spillere for å starte spillet.'});
	}

	if (game.questions.length < 1) {
		console.log('Not enough questions to start game:', gameCode);
		return res.status(400).json({error: 'Må ha minst 1 spørsmål for å starte spillet.'});
	}

	game.status = 'in-progress';
	console.log('Game started:', gameCode);

	res.json({message: 'Spill startet.', game});

	// Emit til alle tilkoblede klienter
	io.emit('updateGame', game);
});

// Server.js (fortsatt fra din eksisterende kode)

// Endpoint for å validere spillkoden
app.get('/validateGameCode/:gameCode', (req, res) => {
	const {gameCode} = req.params;
	console.log('Received validateGameCode request for:', gameCode);

	const game = games[gameCode];
	if (game) {
		res.json({isValid: true});
	} else {
		res.json({isValid: false});
	}
});

// Sørg for at alle relevante endepunkter emitter 'updateGame' hendelser
// Eksempel for eksisterende endepunkter:

app.post('/join-game', (req, res) => {
	const {gameCode, playerName} = req.body;
	console.log('Received join-game request:', {gameCode, playerName});

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	// Sjekk om spilleren allerede er med
	if (game.players.find(p => p.name === playerName)) {
		console.log('Player name already exists in game:', playerName);
		return res.status(400).json({error: 'Navn allerede i bruk i dette spillet.'});
	}

	const newPlayer = {name: playerName, score: 0};
	game.players.push(newPlayer);
	game.scores[playerName] = 0;

	console.log('Player added:', playerName, 'to game:', gameCode);

	res.json({message: 'Spiller lagt til.', player: newPlayer});

	// Emit til alle tilkoblede klienter
	io.emit('updateGame', game);
});


// Endpoint for å validere spillkoden
app.get('/validateGameCode/:gameCode', (req, res) => {
	const {gameCode} = req.params;
	console.log('Received validateGameCode request for:', gameCode);

	const game = games[gameCode];
	if (game) {
		res.json({isValid: true});
	} else {
		res.json({isValid: false});
	}
});

app.post('/submit-guess', (req, res) => {
	const {gameCode, playerName, guess} = req.body;
	console.log('Received submit-guess request:', {gameCode, playerName, guess});

	const game = games[gameCode];
	if (!game) {
		console.log('Game not found:', gameCode);
		return res.status(404).json({error: 'Spill ikke funnet.'});
	}

	if (game.status !== 'in-progress') {
		console.log('Game is not in-progress:', gameCode);
		return res.status(400).json({error: 'Spillet er ikke i gang.'});
	}

	const player = game.players.find(p => p.name === playerName);
	if (!player) {
		console.log('Player not found in game:', playerName, 'Game:', gameCode);
		return res.status(404).json({error: 'Spiller ikke funnet i spillet.'});
	}

	const currentQuestion = game.questions[game.currentQuestionIndex];
	if (!currentQuestion) {
		console.log('No current question in game:', gameCode);
		return res.status(400).json({error: 'Ingen gjeldende spørsmål.'});
	}

	// Lagre gjetningen (kan utvides til å lagre per spiller og per spørsmål)
	player.currentGuess = guess;
	console.log('Player guess recorded:', playerName, 'Guess:', guess);

	res.json({message: 'Gjetning mottatt.'});

	// Emit til alle tilkoblede klienter
	io.emit('updateGame', game);
});

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
