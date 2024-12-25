// src/components/StartGamePhase.js
import React, {useState} from 'react';

const StartGamePhase = ({handleStartGame, error, successMessage}) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		setIsLoading(true);
		await handleStartGame();
		setIsLoading(false);
	};

	return (
		<div>
			<h3>Fase 0: Start spillet</h3>
			<button onClick={handleClick} disabled={isLoading}>
				{isLoading ? 'Starter...' : 'Start Spillet'}
			</button>
			{error && <p className="error-message">{error}</p>}
			{successMessage && <p className="success-message">{successMessage}</p>}
		</div>
	);
};

export default StartGamePhase;
