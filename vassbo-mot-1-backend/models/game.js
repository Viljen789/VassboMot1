// Assuming Game is a class in '../models/game.js'

class Game {
	constructor(title, gameCode) {
		this.title = title;
		this.gameCode = gameCode;
		this.players = [];
		this.questions = [];
		this.currentQuestionIndex = 0;
		this.status = 'waiting'; // 'waiting', 'started', etc.
		this.roundActive = false;
		this.correctAnswer = null;
		this.roundStartedAt = null;
		this.answers = {}; // Add this line to track player guesses
	}

	addPlayer(playerName) {
		this.players.push({name: playerName, score: 0});
	}

	addQuestion(question) {
		this.questions.push(question);
	}

	startGame(io) {
		this.status = 'started';
		this.currentQuestionIndex = 0;
		this.startRound(io);
		io.to(this.gameCode).emit('updateGame', this);
	}

	startRound(io) {
		this.roundActive = true;
		this.correctAnswer = null;
		this.roundStartedAt = Date.now();
		this.answers = {}; // Reset answers for the new round
		io.to(this.gameCode).emit('updateGame', this);
	}

	submitGuess(playerName, guess, io) {
		if (!this.roundActive) {
			throw new Error('Runde er ikke aktiv.');
		}
		if (this.answers[playerName] !== undefined) {
			throw new Error('Du har allerede sendt inn et svar.');
		}
		this.answers[playerName] = guess;
		io.to(this.gameCode).emit('updateGame', this);
	}

	setCorrectAnswer(correctAnswer, io) {
		if (!this.roundActive) {
			throw new Error('Runde er ikke aktiv.');
		}
		this.correctAnswer = correctAnswer;
		this.roundActive = false;
		// Calculate scores based on guesses and correct answer
		this.calculateScores();
		io.to(this.gameCode).emit('updateGame', this);
	}

	calculateScores() {
		this.players.forEach(player => {
			const guess = this.answers[player.name];
			if (guess !== undefined) {
				player.newScore = Math.max(0, 100 - Math.abs(this.correctAnswer - guess) * 10);
				player.score += player.newScore;
			}
		});
	}

	// Add other necessary methods...
}

module.exports = Game;
