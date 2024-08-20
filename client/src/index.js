import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ScreenBlocker from './components/ScreenBlocker';
import { BrowserRouter } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ScreenBlocker />
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
