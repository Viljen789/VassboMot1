// src/components/Timer.js
import React, {useEffect, useState} from 'react';

const Timer = ({deadline, onTimeUp}) => {
	const calculateTimeLeft = () => {
		const difference = deadline - Date.now();
		return difference > 0 ? Math.round(difference / 1000) : 0;
	};

	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

	useEffect(() => {
		if (timeLeft <= 0) {
			onTimeUp();
			return;
		}

		const timer = setInterval(() => {
			const newTimeLeft = calculateTimeLeft();
			setTimeLeft(newTimeLeft);

			if (newTimeLeft <= 0) {
				clearInterval(timer);
				onTimeUp();
			}
		}, 1000);

		// Rydd opp interval om komponenten unmountes
		return () => clearInterval(timer);
	}, [deadline, onTimeUp, timeLeft]);

	return (
		<div className="timer">
			<p>Tid igjen: {timeLeft} sekunder</p>
		</div>
	);
};

export default Timer;
