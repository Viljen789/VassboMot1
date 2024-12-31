// src/components/PlayerGameViewWrapper.js

import React, {useEffect} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import PlayerGameView from './PlayerGameView';

const PlayerGameViewWrapper = () => {
	const {gameCode} = useParams();
	const location = useLocation();
	const {playerName} = location.state || {};

	useEffect(() => {
		console.log(`PlayerGameViewWrapper - gameCode: ${gameCode}, playerName: ${playerName}`);
	}, [gameCode, playerName]);

	return <PlayerGameView gameCode={gameCode} playerName={playerName}/>;
};

export default PlayerGameViewWrapper;
