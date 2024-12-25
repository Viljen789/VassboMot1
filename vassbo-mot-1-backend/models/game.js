class Game {
	constructor(title, gameCode) {
		this.title = title;
		this.gameCode = gameCode;
		console.log(`Game created with gameCode: ${this.gameCode}`);
		this.players = [];
		this.questions = [];
		this.currentQuestionIndex = 0;
		this.status = 'created'; // status kan være 'created', 'started', 'ended'
		this.roundActive = false;
		this.correctAnswer = null;
		this.roundStartedAt = null; // Initialize to null
		this.guesses = {}; // Initialiser guesses
	}

	addPlayer(playerName) {
		if (this.players.find(p => p.name === playerName)) {
			throw new Error('Spillernavn er allerede tatt.');
		}
		this.players.push({name: playerName, score: 0});
		console.log(`Spiller ${playerName} lagt til i spill ${this.gameCode}`);
	}

	addQuestion(question) {
		this.questions.push(question);
		console.log(`Spørsmål lagt til i spill ${this.gameCode}: ${question.text}`);
	}

	startGame(io) {
		// Nytt krav: det må være mer enn 0 spillere
		if (this.players.length < 1) {
			throw new Error('Det kreves minst én spiller for å starte spillet.');
		}
		this.status = 'started';
		console.log(`Emitting updateGame to gameCode: ${this.gameCode}`);
		console.log('io inside startGame:', io);
		io.to(this.gameCode).emit('updateGame', this);
	}

	startRound(io) {
		if (this.roundActive) {
			throw new Error('En runde er allerede aktiv.');
		}
		if (this.currentQuestionIndex >= this.questions.length) {
			throw new Error('Ingen flere spørsmål tilgjengelig.');
		}
		this.roundActive = true;
		this.correctAnswer = null;
		this.roundStartedAt = Date.now(); // Sett starttidspunkt

		console.log(`Runde startet for spill ${this.gameCode}:`, {
			roundActive: this.roundActive,
			roundStartedAt: this.roundStartedAt,
		});

		io.to(this.gameCode).emit('updateGame', this);

		setTimeout(() => {
			if (this.roundActive) {
				this.roundActive = false;
				console.log(`Runde avsluttet automatisk for spill ${this.gameCode}`);
				io.to(this.gameCode).emit('roundEnded', {
					gameCode: this.gameCode,
					correctAnswer: null,
					leaderboard: this.getLeaderboard(),
				});
			}
		}, 30000);
	}

	setCorrectAnswer(correctAnswer, io) {
		if (!this.roundActive) {
			throw new Error('Ingen aktiv runde.');
		}
		this.correctAnswer = correctAnswer;
		this.roundActive = false;

		console.log(`Riktig svar satt for spill ${this.gameCode}: ${correctAnswer}`);

		this.players.forEach(player => {
			const guess = this.guesses[player.name];
			if (guess !== undefined) {
				const distance = Math.abs(guess - correctAnswer);
				player.score += Math.max(10 - distance, 0);
				console.log(`Spiller ${player.name} gjetning: ${guess}, poeng: ${player.score}`);
			}
		});

		io.to(this.gameCode).emit('roundEnded', {
			correctAnswer,
			leaderboard: this.getLeaderboard(),
		});

		this.currentQuestionIndex += 1;
		this.guesses = {};
	}

	submitGuess(playerName, guess, io) {
		if (!this.roundActive) {
			throw new Error('Ingen aktiv runde.');
		}
		const player = this.players.find(p => p.name === playerName);
		if (!player) {
			throw new Error('Spiller ikke funnet.');
		}
		this.guesses[playerName] = guess;

		io.to(this.gameCode).emit('playerGuessed', {playerName, guess});
		console.log(`Spiller ${playerName} sendte inn gjetning ${guess} i spill ${this.gameCode}`);
	}

	getLeaderboard() {
		const leaderboard = [...this.players].sort((a, b) => b.score - a.score);
		console.log(`Leaderboard for spill ${this.gameCode}:`, leaderboard);
		return leaderboard;
	}
}

module.exports = Game;
