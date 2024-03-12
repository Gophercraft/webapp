// Libraries
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import api from './api';

// Components
import App from './component/App';

// Styles
import './style/app.css';

api.Client.set_web_access_point(
  window.location.protocol + '//' + window.location.host
);

try {
  api.Client.check_credential();
} catch (err) {}

const container = document.getElementById('webapp');
const root = createRoot(container);
root.render(<App />);
