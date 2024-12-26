import React from 'react';

const GuessingPhase = ({question, timeLeft, game}) => {
	return (
		<div>
			<h3>Fase 2: 30 sek gjetting</h3>
			<p><strong>Spørsmål:</strong> {question}</p>
			<p>Tid igjen: {timeLeft} sekunder</p>
			<p>Spillere sender inn svar nå ...</p>
			<ul>
				{game?.players.map((player) => (
					<li key={player.name}>
						{player.name}: {game.guesses[player.name] ? 'Gjetning sendt' : 'Venter ...'}
					</li>
				))}
			</ul>
		</div>
	);
};

export default GuessingPhase;