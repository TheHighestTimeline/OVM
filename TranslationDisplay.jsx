import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "./styles/tailwind.css";
import App from "./App";

// Global error handler to suppress ResizeObserver loop warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress ResizeObserver loop completed warning
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    return;
  }
  // Log all other errors normally
  originalConsoleError.apply(console, args);
};

// Also handle uncaught errors
window.addEventListener('error', (event) => {
  if (
    event.message &&
    event.message.includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);