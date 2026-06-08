import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import TrustIndicators from './components/TrustIndicators';
import SystemStatus from './components/SystemStatus';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const session = JSON.parse(userSession);
        // Verify session is still valid (not expired)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 8) { // 8-hour session timeout
          navigate('/');
          return;
        } else {
          // Session expired, clear it
          localStorage.removeItem('userSession');
        }
      } catch (error) {
        // Invalid session data, clear it
        localStorage.removeItem('userSession');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.1),transparent_50%)]"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VL</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">VoiceLink Translator</h1>
                  <p className="text-xs text-muted-foreground">Professional Legal Communication Platform</p>
                </div>
              </div>
              
              {/* System Status Indicator */}
              <div className="hidden md:flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-gentle-pulse"></div>
                <span>System Operational</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Login Area */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Login Form */}
              <div className="order-2 lg:order-1">
                <LoginForm />
              </div>

              {/* Right Column - Trust Indicators & System Status */}
              <div className="order-1 lg:order-2 space-y-8">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Secure Legal Communication
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Real-time voice translation for law firms.\n
                    Bridge language barriers with professional-grade security.
                  </p>
                </div>

                <TrustIndicators />
                
                <div className="lg:max-w-md">
                  <SystemStatus />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 border-t border-border bg-surface/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} VoiceLink Translator. All rights reserved.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Designed for legal professionals. HIPAA & SOC 2 compliant.
                </p>
              </div>
              
              <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-professional">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-foreground transition-professional">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-foreground transition-professional">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;