// vassbo-mot-1-backend/models/Game.js

const fs = require('fs').promises;
const path = require('path');

const GAMES_FILE = path.join(__dirname, '../data/games.json');

class Game {
    constructor(title, gameCode) {
        this.title = title;
        this.gameCode = gameCode;
        this.players = [];
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.status = 'waiting';
        this.phase = 0;
        this.correctAnswer = null;
        this.roundStartedAt = null;
        this.answers = {};
        this.leaderboard = [];
    }

    // Method to create a Game instance from a plain object
    static fromJSON(obj) {
        const game = new Game(obj.title, obj.gameCode);
        game.players = obj.players || [];
        game.questions = obj.questions || [];
        game.currentQuestionIndex = obj.currentQuestionIndex || 0;
        game.status = obj.status || 'waiting';
        game.phase = obj.phase || 0;
        game.correctAnswer = obj.correctAnswer || null;
        game.roundStartedAt = obj.roundStartedAt || null;
        game.answers = obj.answers || {};
        game.leaderboard = obj.leaderboard || [];
        return game;
    }

    static async loadAllGames() {
        try {
            const data = await fs.readFile(GAMES_FILE, 'utf-8');
            const gamesObj = JSON.parse(data);
            const games = {};
            for (const [code, gameData] of Object.entries(gamesObj)) {
                games[code] = Game.fromJSON(gameData);
            }
            return games;
        } catch (err) {
            if (err.code === 'ENOENT') {
                await fs.writeFile(GAMES_FILE, JSON.stringify({}), 'utf-8');
                return {};
            }
            throw err;
        }
    }

    static async saveAllGames(games) {
        try {
            // Convert Game instances to plain objects before saving
            const plainGames = {};
            for (const [code, gameInstance] of Object.entries(games)) {
                plainGames[code] = {
                    title: gameInstance.title,
                    gameCode: gameInstance.gameCode,
                    players: gameInstance.players,
                    questions: gameInstance.questions,
                    currentQuestionIndex: gameInstance.currentQuestionIndex,
                    status: gameInstance.status,
                    phase: gameInstance.phase,
                    correctAnswer: gameInstance.correctAnswer,
                    roundStartedAt: gameInstance.roundStartedAt,
                    answers: gameInstance.answers,
                    leaderboard: gameInstance.leaderboard,
                };
            }
            await fs.writeFile(GAMES_FILE, JSON.stringify(plainGames, null, 2), 'utf-8');
        } catch (err) {
            throw err;
        }
    }

    static async createGame(title, gameCode) {
        const games = await Game.loadAllGames();
        const newGame = new Game(title, gameCode);
        games[gameCode] = newGame;
        await Game.saveAllGames(games);
        return newGame;
    }

    static async loadGame(gameCode) {
        const games = await Game.loadAllGames();
        return games[gameCode] || null;
    }

    static async saveGame(gameCode, game) {
        const games = await Game.loadAllGames();
        games[gameCode] = game;
        await Game.saveAllGames(games);
    }

    addPlayer(playerName) {
        this.players.push({name: playerName, score: 0});
    }

    addQuestion(question) {
        const {text, rangeMin, rangeMax} = question;
        this.questions.push({text, rangeMin, rangeMax});
    }

    startGame(io) {
        this.phase = 1;
        this.status = 'started';
        this.roundStartedAt = Date.now();
        io.to(this.gameCode).emit('updateGame', this);
    }

    startRound(io) {
        this.phase = 2;
        this.roundStartedAt = Date.now();
        this.answers = {}; // Reset answers for new round
        io.to(this.gameCode).emit('updateGame', this);
    }

    setCorrectAnswer(correctAnswer, io) {
        this.correctAnswer = correctAnswer;
        this.phase = 3;
        this.calculateScores();
        io.to(this.gameCode).emit('updateGame', this);
    }

    calculateScores() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const correct = this.correctAnswer;
        const rangeMin = currentQuestion.rangeMin;
        const rangeMax = currentQuestion.rangeMax;
        const maxPoints = 1000; // Maximum achievable points
        const sigma = 0.2; // Controls the steepness of the score drop-off

        for (const player of this.players) {
            const guess = this.answers[player.name];
            if (guess !== undefined) {
                const maxDistance = rangeMax - rangeMin;
                const distance = Math.abs(correct - guess);
                const normalizedDistance = distance / maxDistance;

                // Calculate points using Gaussian formula
                const points = maxPoints * Math.exp(-(normalizedDistance ** 2) / (2 * sigma ** 2));

                // Add the calculated points to the player's score
                player.score += Math.max(0, Math.round(points));
            }
        }
    }


    submitGuess(playerName, guess) {
        if (this.phase !== 2) {
            throw new Error('Not in guessing phase.');
        }

        if (!this.players.find(p => p.name === playerName)) {
            throw new Error('Player not found in game.');
        }

        if (this.answers[playerName] !== undefined) {
            throw new Error('Player has already submitted a guess.');
        }

        this.answers[playerName] = guess;
    }

    setNextPhase() {
        if (this.phase === 3) {
            this.phase = 4;
            // Possibly handle leaderboard or transition to next round
        } else if (this.phase === 1 || this.phase === 2) {
            if (this.currentQuestionIndex + 1 < this.questions.length) {
                this.currentQuestionIndex += 1;
                this.phase = 1;
            } else {
                this.phase = 5;
            }
        } else {
            throw new Error('Invalid phase transition.');
        }
    }

    setPhase(phase) {
        this.phase = phase;
    }

    setLeaderboard(leaderboard) {
        this.leaderboard = leaderboard;
    }
}

module.exports = Game;
