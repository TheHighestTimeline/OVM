// OVM Clients — standalone dashboard entry point.
// Wraps the Social (Clients) view with Clerk auth + a minimal toast system.
import { useState, useCallback, useEffect } from 'react';
import { useUser, useClerk, SignIn } from '@clerk/clerk-react';
import Social from './views/Social.jsx';

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: '#1f232e', color: '#f0ede8',
      padding: '10px 20px', borderRadius: 10, fontSize: 13,
      fontFamily: "'Geist', system-ui, sans-serif",
      border: '1px solid #3a4050', boxShadow: '0 8px 32px rgba(0,0,0,.5)',
      animation: 'fadeUp .2s ease-out',
      pointerEvents: 'none',
    }}>
      {msg}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────
function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
      background: '#0e1014', color: '#f0ede8',
      fontFamily: "'Geist', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.6 }}>◐</div>
        <div style={{ fontSize: 12, color: '#6b7180', letterSpacing: '.12em', fontFamily: "'Geist Mono', monospace" }}>
          LOADING…
        </div>
      </div>
    </div>
  );
}

// ── Sign-in page ──────────────────────────────────────────────────────────────
function SignInPage() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
      background: '#0e1014',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, color: '#d96b3a', marginBottom: 8 }}>◐</div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: '#f0ede8', fontWeight: 500 }}>
            OVM Clients
          </div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#6b7180', letterSpacing: '.12em', marginTop: 4 }}>
            ONEVIBE MEDIA
          </div>
        </div>
        <SignIn routing="hash" />
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => setToast(msg), []);

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <SignInPage />;

  // Build a user object matching the Social component's expected shape
  const userObj = {
    id:       user.id,
    email:    user.primaryEmailAddress?.emailAddress || '',
    fullName: user.fullName || user.firstName || 'User',
    isAdmin:  (user.publicMetadata?.roles || []).includes('admin') ||
              user.publicMetadata?.role === 'admin',
    roles:    user.publicMetadata?.roles || [],
    role:     user.publicMetadata?.role  || '',
  };

  return (
    <>
      <Social user={userObj} showToast={showToast} />
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}
