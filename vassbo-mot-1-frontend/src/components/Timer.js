// vassbo-mot-1-frontend/src/components/Timer.js

import React, {useEffect, useState} from 'react';

const Timer = ({initialTime, onTimeUp}) => {
	const [timeLeft, setTimeLeft] = useState(initialTime);

	useEffect(() => {
		if (timeLeft <= 0) {
			onTimeUp();
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					onTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft, onTimeUp]);

	return (
		<div className="timer">
			<p>Tid igjen: {timeLeft} sekunder</p>
		</div>
	);
};

export default Timer;
