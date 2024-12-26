import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameContext} from '../context/GameContext';
import './Register.css';

const Register = () => {
	const {joinGame, validateGameCode} = useContext(GameContext);

	const [gameCode, setGameCode] = useState('');
	const [playerName, setPlayerName] = useState('');
	const [error, setError] = useState('');
	const [isCodeLocked, setIsCodeLocked] = useState(false);
	const [isGameValid, setIsGameValid] = useState(false);
	const [welcomeMessage, setWelcomeMessage] = useState(false);
	const navigate = useNavigate();

	const handleValidateCode = async () => {
		if (!gameCode.trim()) {
			setError('Spillkode kan ikke være tom.');
			return;
		}

		try {
			const isValid = await validateGameCode(gameCode);
			if (isValid) {
				setError('');
				setIsGameValid(true);
				setIsCodeLocked(true);
			} else {
				setError('Ugyldig spillkode.');
			}
		} catch (err) {
			console.error('Error during game code validation:', err);
			setError('Feil ved validering av spillkode.');
		}
	};

	const handleJoinGame = async () => {
		if (!gameCode.trim()) {
			setError('Spillkode kan ikke være tom.');
			return;
		}

		if (!playerName.trim()) {
			setError('Navn kan ikke være tomt.');
			return;
		}

		try {
			const response = await joinGame(gameCode.trim(), playerName.trim());
			console.log('Backend response in handleJoinGame:', response); // Debug hele backend respons

			// Sikkert tilgang til responsdata
			const player = response?.player; // Debug response.player
			if (!player || !player.name) {
				throw new Error('Invalid response from backend. Missing player information.');
			}

			console.log('Player joining:', player); // Debug spillerinfo
			// Lagre spillerdata
			sessionStorage.setItem('playerName', player.name);

			// Vis velkomstmeldingen
			setWelcomeMessage(true);

			// Etter en kort forsinkelse, naviger til spill-siden
			setTimeout(() => {
				navigate(`/game/${gameCode}`);
			}, 2000); // 2 sekunder
		} catch (err) {
			console.error('Error joining game:', err.response || err.message || err);

			const errorMessage = err.response?.data?.error || 'Feil ved å bli med i spillet.';
			setError(errorMessage);
		}
	};

	return (
		<div className="register-container">
			<h2>Bli med i Spill</h2>

			{!welcomeMessage ? (
				<>
					<input
						type="text"
						placeholder="Spillkode (6 siffer)"
						value={gameCode}
						disabled={isCodeLocked}
						onChange={(e) => setGameCode(e.target.value)}
					/>

					{!isGameValid && <button onClick={handleValidateCode}>Finn Spill</button>}

					{isGameValid && (
						<>
							<input
								type="text"
								placeholder="Ditt navn"
								value={playerName}
								onChange={(e) => setPlayerName(e.target.value)}
							/>
							<button onClick={handleJoinGame}>Bli Med</button>
						</>
					)}

					{error && <p className="error-message">{error}</p>}
				</>
			) : (
				<div className="welcome-message">
					<h3>Velkommen, {playerName}!</h3>
					<p>Du blir omdirigert til spillet...</p>
				</div>
			)}
		</div>
	);
};

export default Register;
