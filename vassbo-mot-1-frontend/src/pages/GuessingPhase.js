// src/components/GuessingPhase.js

import React from 'react';
import '../components/GuessingPhase.css'; // Import the CSS file

const GuessingPhase = ({question, timeLeft, game}) => {
	return (
		<div className="guessing-phase">
			<h3>Fase 2: 30 sek gjetting</h3>
			<p><strong>Spørsmål:</strong> {question}</p>
			<div className="timer-container">
				<p>Tid igjen: <span className="time-left">{timeLeft}</span> sekunder</p>
				<div className="timer-bar">
					<div className="timer-fill" style={{width: `${(timeLeft / 30) * 100}%`}}></div>
				</div>
			</div>
			<p>Spillere sender inn svar nå ...</p>
			<ul className="players-list">
				{game?.players.map((player) => (
					<li key={player.name} className="player-item">
						<span className="player-name">{player.name}</span>:
						<span className={`player-status ${game.answers[player.name] ? 'sent' : 'waiting'}`}>
              {game.answers[player.name] ? 'Gjetning sendt' : 'Venter ...'}
            </span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default GuessingPhase;
