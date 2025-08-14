import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.scss';

const container = document.getElementById('root');
if (!container) {
	throw new Error('Root element with id "root" not found');
}

createRoot(container).render(
	React.createElement(
		React.StrictMode,
		null,
		React.createElement(App)
	)
);
