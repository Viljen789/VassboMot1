// vassbo-mot-1-backend/models/game.js

class Game {
	constructor(title, gameCode) {
		this.title = title;
		this.gameCode = gameCode;
		this.players = [];
		this.questions = [];
		this.currentQuestionIndex = 0;
		this.status = 'created'; // status kan være 'created', 'started', 'ended'
		this.roundActive = false;
		this.correctAnswer = null;
		this.guesses = {}; // Initialiser guesses
	}

	autoSubmitGuesses(io) {
		if (!this.roundActive) {
			throw new Error('Ingen aktiv runde. Kan ikke auto-sende gjetninger.');
		}

		this.players.forEach((player) => {
			if (!this.guesses[player.name]) {
				const currentQuestion = this.questions[this.currentQuestionIndex];
				const autoGuess = currentQuestion.range[0]; // Use the minimum value as a default guess
				this.guesses[player.name] = autoGuess;
				console.log(`Auto-submitting guess for player: ${player.name}, guess: ${autoGuess}`);

				// Emit to clients that a guess was auto-submitted
				io.to(this.gameCode).emit('playerGuessed', {playerName: player.name, guess: autoGuess});
			}
		});
	}

	addPlayer(playerName) {
		if (this.players.find((p) => p.name === playerName)) {
			throw new Error('Spillernavn er allerede tatt.');
		}
		this.players.push({name: playerName, score: 0});
		console.log(`[${this.gameCode}] Added player:`, playerName);
		console.log(`[${this.gameCode}] Players now:`, this.players); // Debug all players
	}

	addQuestion(question) {
		this.questions.push(question);
	}

	startGame() {
		if (this.status !== 'created') {
			throw new Error('Spillet kan kun startes fra status "created".');
		}
		if (this.players.length < 2) {
			console.error('Not enough players to start the game:', this.players);
			throw new Error('Minimum 2 spillere kreves for å starte spillet.');
		}
		console.log('Starting the game with players:', this.players);
		this.status = 'started';
	}

	startGame(io) {
		if (!this.isReadyToStart()) {
			throw new Error('Spillet er ikke klart til å starte. Sjekk spillere og spørsmål.');
		}

		console.log('Attempting to start game:', this);

		if (this.status !== 'created') {
			throw new Error('Spillet kan kun startes fra status "created".');
		}
		if (this.players.length < 2) {
			throw new Error('Minimum 2 spillere kreves for å starte spillet.');
		}
		if (this.questions.length < 1) {
			throw new Error('Minimum 1 spørsmål kreves for å starte spillet.');
		}

		this.status = 'started';
		const currentQuestion = this.questions[this.currentQuestionIndex];
		io.to(this.gameCode).emit('startRound', {
			question: currentQuestion.text,
			range: currentQuestion.range,
		});
	}

	isReadyToStart() {
		return this.status === 'created' && this.players.length >= 2 && this.questions.length > 0;
	}


	setCorrectAnswer(correctAnswer, io) {
		if (!this.roundActive) {
			throw new Error('Ingen aktiv runde.');
		}
		this.autoSubmitGuesses(io);
		this.correctAnswer = correctAnswer;
		this.roundActive = false;

		// Beregn poeng basert på svarene
		this.players.forEach(player => {
			const guess = this.guesses[player.name];
			if (guess !== undefined) {
				const currentQuestion = this.questions[this.currentQuestionIndex];
				const [minRange, maxRange] = currentQuestion.range;
				const distance = Math.abs(guess - correctAnswer);
				const normalizedDistance = Math.min(distance / (maxRange - minRange), 1);
				const score = Math.round(100 * Math.pow(1 - normalizedDistance, 2));
				player.score += score;
			}
		});

		// Emit til alle spillere at fasiten er satt og oppdatert leaderboard
		io.to(this.gameCode).emit('roundEnded', {
			correctAnswer,
			leaderboard: this.players.sort((a, b) => b.score - a.score),
		});

		// Increment question index
		this.currentQuestionIndex += 1;
		this.guesses = {}; // Resett gjetninger for neste runde

		// Check if this was the last question
		if (this.currentQuestionIndex >= this.questions.length) {
			// Game has ended, emit final leaderboard
			this.status = 'ended'; // Update the game status to ended
			io.to(this.gameCode).emit('gameEnded', {
				leaderboard: this.players.sort((a, b) => b.score - a.score),
			});
		} else {
			// Emit updated game state for the next round
			io.to(this.gameCode).emit('updateGame', this);
		}
	}

	startRound(io) {
		if (this.status !== 'started') {
			throw new Error('Spillet må være startet for å begynne en runde.');
		}
		if (this.currentQuestionIndex >= this.questions.length) {
			throw new Error('Ingen flere spørsmål tilgjengelig.');
		}
		if (this.roundActive) {
			throw new Error('En runde er allerede aktiv.');
		}

		this.roundActive = true;
		const currentQuestion = this.questions[this.currentQuestionIndex];

		// Record round start time in server-side state
		const roundStartedAt = Date.now();
		this.roundStartedAt = roundStartedAt;

		io.to(this.gameCode).emit('startRound', {
			question: currentQuestion.text,
			range: currentQuestion.range,
			roundStartedAt,
		});

		console.log(`Runde startet for spill: ${this.gameCode}, Spørsmål: ${currentQuestion.text}`);
	}

	submitGuess(playerName, guess, io) {
		const player = this.players.find((p) => p.name === playerName);
		if (!this.roundActive) {
			throw new Error('Ingen aktiv runde. Du kan ikke gjette nå.');
		}
		if (!player) {
			throw new Error('Spiller ikke funnet.');
		}

		if (this.guesses[playerName] !== undefined) {
			throw new Error('Du har allerede sendt inn et svar for denne runden.');
		}

		const currentQuestion = this.questions[this.currentQuestionIndex];
		const [minRange, maxRange] = currentQuestion.range;

		if (guess < minRange || guess > maxRange) {
			throw new Error(`Gjetningen må være innenfor området ${minRange} til ${maxRange}.`);
		}
		console.log('Player data:', this.players);
		console.log('Received guess from:', playerName, 'with value:', guess);

		this.guesses[playerName] = Number(guess);

		// Notify clients that this player has submitted a guess
		io.to(this.gameCode).emit('playerGuessed', {playerName, guess});
		console.log(`Spiller ${playerName} har sendt inn gjetning: ${guess}`);
	}

	updateQuestion(index, updatedQuestion) {
		if (!this.questions[index]) {
			throw new Error('Question does not exist.');
		}
		if (
			!updatedQuestion.text ||
			!Array.isArray(updatedQuestion.range) ||
			updatedQuestion.range.length !== 2 ||
			updatedQuestion.range[0] >= updatedQuestion.range[1]
		) {
			throw new Error('Invalid question data.');
		}
		this.questions[index] = updatedQuestion;
	}
}

module.exports = Game;
