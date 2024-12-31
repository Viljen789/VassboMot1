// src/components/Leaderboard.js

import React from 'react';
import '../components/Leaderboard.css'; // Import the CSS file

const Leaderboard = ({game, onNextQuestion, isFinal = false}) => {
	const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

	return (
		<div className="leaderboard">
			<h3>{isFinal ? "Sluttresultat: Leaderboard" : "Fase 4: Leaderboard"}</h3>
			<p>{isFinal ? "Endelige poengsummer:" : "Se hvem som fikk flest poeng for dette spørsmålet."}</p>
			<ul>
				{sortedPlayers.map((player, index) => (
					<li key={index}>
						<span>{index + 1}. {player.name}</span>
						<span>{player.score} poeng</span>
					</li>
				))}
			</ul>
			{!isFinal && <button onClick={onNextQuestion}>Neste spørsmål</button>}
		</div>
	);
};
export default Leaderboard;
