// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {GameProvider} from "./context/GameContext";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <GameProvider>
            <DevSupport ComponentPreviews={ComponentPreviews}
                        useInitialHook={useInitial}
            >
                <App/>
            </DevSupport>
        </GameProvider>
    </React.StrictMode>
);
