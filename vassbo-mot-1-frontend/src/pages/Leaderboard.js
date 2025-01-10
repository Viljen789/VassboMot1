// src/components/Leaderboard.js

import React from 'react';
import '../components/Leaderboard.css';

const Leaderboard = ({game, onNextQuestion, isFinal = false}) => {
	const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

	return (
		<div className="leaderboard">
			<h3>{isFinal ? "Sluttresultat: Leaderboard" : "Fase 4: Leaderboard"}</h3>
			<ul>
				{sortedPlayers.map((player, index) => (
					<li key={index}>
						{player.name}: {player.score}
					</li>
				))}
			</ul>
			{!isFinal && (
				<button onClick={onNextQuestion}>Neste spørsmål</button>
			)}
		</div>
	);
};

export default Leaderboard;