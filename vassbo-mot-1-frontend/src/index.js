// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {GameProvider} from "./context/GameContext";

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
	<React.StrictMode>
		<GameProvider>
			<App/>
		</GameProvider>
	</React.StrictMode>
);
