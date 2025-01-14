// src/pages/GuessingPhaseTest.js

import React, {useState} from 'react';
import GuessingPhase from '../components/GuessingPhase';

const GuessingPhaseTest = () => {
    const [timeLeft, setTimeLeft] = useState(30);
    const mockQuestion = {
        text: 'What is the capital of France?',
        range: [0, 100],
    };

    return (
        <div>
            <h2>Guessing Phase Test</h2>
            <GuessingPhase question={mockQuestion.text} timeLeft={timeLeft}/>
        </div>
    );
};

export default GuessingPhaseTest;