// pages/HostSetup.js
import React, {useState} from 'react';

const HostSetup = () => {
	const [gameCode, setGameCode] = useState('');

	const handleGenerateCode = () => {
		// I praksis kan du bruke f.eks. en tilfeldig streng eller UUID
		const newCode = Math.floor(100000 + Math.random() * 900000).toString();
		setGameCode(newCode);
	};

	return (
		<div>
			<h1>Host Setup</h1>
			<p>Klikk for å generere en ny spillkode som spillerne kan bruke for å bli med.</p>
			<button onClick={handleGenerateCode}>Generer kode</button>
			{gameCode && (
				<h2>Din kode: {gameCode}</h2>
			)}
		</div>
	);
};

export default HostSetup;