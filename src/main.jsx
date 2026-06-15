import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import ApprovalPage from './ApprovalPage.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY — add it to .env');
}

const path         = window.location.pathname;
const approveMatch = path.match(/^\/approve\/([\w-]+)\/?$/);

if (approveMatch) {
  // Public approval page — no Clerk required
  const token = approveMatch[1];
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ApprovalPage token={token} />
    </StrictMode>
  );
} else {
  // Protected dashboard
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </StrictMode>
  );
}
