// vassbo-mot-1-backend/models/game.js

class Game {
	constructor(title, gameCode) {
		this.title = title;
		this.gameCode = gameCode;
		this.players = []; // Array of { name: string, score: number }
		this.questions = []; // Array of { text: string, range: [min, max] }
		this.currentQuestionIndex = 0;
		this.status = 'waiting'; // 'waiting', 'started', etc.
		this.guesses = {}; // { [playerName]: guess }
		this.roundActive = false;
		this.roundStartedAt = null;
		this.correctAnswer = null;
	}

	addPlayer(playerName) {
		const normalizedPlayerName = playerName.trim();
		this.players.push({name: normalizedPlayerName, score: 0});
		console.log(`Player '${normalizedPlayerName}' added to game '${this.gameCode}'.`);
	}

	addQuestion(question) {
		this.questions.push(question);
		console.log(`Question '${question.text}' added to game '${this.gameCode}'.`);
	}

	startGame(io) {
		if (this.players.length < 2) {
			throw new Error('Minst to spillere må delta før spillet kan starte.');
		}
		if (this.questions.length < 1) {
			throw new Error('Spillet må ha minst ett spørsmål.');
		}
		this.status = 'started';
		this.roundActive = false;
		this.correctAnswer = null;
		io.to(this.gameCode).emit('updateGame', this);
		console.log(`Game '${this.gameCode}' started.`);
	}

	startRound(io) {
		if (this.status !== 'started') {
			throw new Error('Spillet er ikke startet.');
		}
		if (this.roundActive) {
			throw new Error('En runde er allerede aktiv.');
		}
		if (this.currentQuestionIndex >= this.questions.length) {
			throw new Error('Ingen flere spørsmål tilgjengelig.');
		}
		this.roundActive = true;
		this.roundStartedAt = Date.now();
		this.correctAnswer = null;
		this.guesses = {}; // Reset guesses for the new round
		io.to(this.gameCode).emit('updatePhase', {phase: 2}); // Example phase
		io.to(this.gameCode).emit('updateGame', this);
		console.log(`Round started for game '${this.gameCode}'. Question index: ${this.currentQuestionIndex}`);
	}

	setCorrectAnswer(correctAnswer, io) {
		if (!this.roundActive) {
			throw new Error('Ingen aktiv runde for å sette riktig svar.');
		}
		this.correctAnswer = correctAnswer;
		this.roundActive = false;
		// Calculate scores
		this.players.forEach(player => {
			const playerGuess = this.guesses[player.name];
			if (playerGuess !== undefined) {
				const difference = Math.abs(playerGuess - correctAnswer);
				const points = Math.max(0, 100 - difference); // Example scoring
				player.score += points;
				console.log(`Player '${player.name}' scored ${points} points.`);
			}
		});
		io.to(this.gameCode).emit('updateGame', this);
		console.log(`Correct answer set for game '${this.gameCode}': ${correctAnswer}`);
	}

	submitGuess(playerName, guess, io) {
		const normalizedPlayerName = playerName.trim();
		console.log(`Submitting guess for player: '${normalizedPlayerName}' with guess: ${guess} in game '${this.gameCode}'`);

		const player = this.players.find(p => p.name.toLowerCase() === normalizedPlayerName.toLowerCase());
		if (!player) {
			console.log(`Player '${normalizedPlayerName}' not found in game '${this.gameCode}'.`);
			throw new Error('Spiller ikke funnet.');
		}
		if (this.guesses[normalizedPlayerName] !== undefined) {
			console.log(`Player '${normalizedPlayerName}' has already submitted a guess.`);
			throw new Error('Gjetning allerede sendt.');
		}
		this.guesses[normalizedPlayerName] = guess;
		io.to(this.gameCode).emit('updateGame', this);
		console.log(`Player '${normalizedPlayerName}' submitted guess: ${guess}`);
	}

	updateQuestion(index, updatedQuestion) {
		if (index < 0 || index >= this.questions.length) {
			throw new Error('Ugyldig spørsmålindeks.');
		}
		this.questions[index] = updatedQuestion;
		console.log(`Question at index ${index} updated in game '${this.gameCode}':`, updatedQuestion);
	}

	// Additional methods as needed
}

module.exports = Game;
