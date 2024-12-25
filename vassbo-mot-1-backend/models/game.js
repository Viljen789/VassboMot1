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
	}

	addPlayer(playerName) {
		if (this.players.find(p => p.name === playerName)) {
			throw new Error('Spillernavn er allerede tatt.');
		}
		this.players.push({name: playerName, score: 0});
	}

	addQuestion(question) {
		this.questions.push(question);
	}

	startGame() {
		if (this.status !== 'created') {
			throw new Error('Spillet kan kun startes fra status "created".');
		}
		if (this.players.length < 2) {
			throw new Error('Minimum 2 spillere kreves for å starte spillet.');
		}
		this.status = 'started';
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
		io.to(this.gameCode).emit('startRound', {
			question: this.questions[this.currentQuestionIndex].text,
			useSlider: this.questions[this.currentQuestionIndex].useSlider,
			range: this.questions[this.currentQuestionIndex].range,
		});
	}

	setCorrectAnswer(correctAnswer, io) {
		if (!this.roundActive) {
			throw new Error('Ingen aktiv runde.');
		}
		this.correctAnswer = correctAnswer;
		this.roundActive = false;

		// Beregn poeng basert på svarene
		this.players.forEach(player => {
			const guess = this.guesses[player.name];
			if (guess !== undefined) {
				const distance = Math.abs(guess - correctAnswer);
				// Poengberegning: jo nærmere, jo flere poeng
				player.score += Math.max(10 - distance, 0); // Eksempel: maks 10 poeng, min 0
			}
		});

		// Emit til alle spillere at fasiten er satt og oppdatert leaderboard
		io.to(this.gameCode).emit('roundEnded', {
			correctAnswer,
			leaderboard: this.players.sort((a, b) => b.score - a.score),
		});

		// Forbered for neste spørsmål
		this.currentQuestionIndex += 1;
		this.guesses = {}; // Resett gjetninger for neste runde
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

		// Emit til spilleren at deres gjetning er mottatt
		io.to(this.gameCode).emit('playerGuessed', {playerName, guess});
	}
}

module.exports = Game;
