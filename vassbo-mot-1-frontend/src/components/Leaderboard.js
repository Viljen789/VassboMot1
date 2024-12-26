// vassbo-mot-1-frontend/src/components/Leaderboard.js

import React from 'react';

const Leaderboard = ({game, onNextQuestion, isFinal = false}) => {
	const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

	return (
		<div>
			<h3>{isFinal ? "Sluttresultat: Leaderboard" : "Fase 4: Leaderboard"}</h3>
			<p>{isFinal ? "Endelige poengsummer:" : "Se hvem som fikk flest poeng for dette spørsmålet."}</p>
			<ul>
				{sortedPlayers.map((player, index) => (
					<li key={index}>
						{player.name}: {player.score} poeng
					</li>
				))}
			</ul>
			{!isFinal && <button onClick={onNextQuestion}>Neste spørsmål</button>}
		</div>
	);
};
export default Leaderboard;
