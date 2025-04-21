import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_AUTH_TOKEN,
  sendDefaultPii: true,
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
