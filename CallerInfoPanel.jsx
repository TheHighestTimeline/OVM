import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  const [connectionStatus, setConnectionStatus] = useState('connected'); // connected, warning, error
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);

  // Hide header during active call interface
  if (location.pathname === '/active-call-interface') {
    return null;
  }

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: 'Home',
      tooltip: 'System overview and call initiation'
    },
    {
      label: 'Call History',
      path: '/call-history-transcripts',
      icon: 'Clock',
      tooltip: 'Historical transcripts and call records'
    },
    {
      label: 'Settings',
      path: '/settings-configuration',
      icon: 'Settings',
      tooltip: 'System configuration and preferences'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleEmergencyAction = (action) => {
    console.log(`Emergency action: ${action}`);
    setShowEmergencyPanel(false);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'Wifi';
      case 'warning': return 'WifiOff';
      case 'error': return 'AlertTriangle';
      default: return 'Wifi';
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-navigation bg-surface border-b border-border shadow-professional">
        <div className="flex items-center justify-between h-15 px-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Mic" size={20} color="white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground">VoiceLink</h1>
                <span className="text-xs text-muted-foreground font-mono">Translator</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path === '/' && location.pathname === '/dashboard');
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                      transition-professional focus-ring
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                    title={item.tooltip}
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* System Health Monitor */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-gentle-pulse"></div>
                <span className="font-mono">API: 45ms</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <span className="font-mono">Audio: 98%</span>
            </div>

            {/* Call Status Indicator */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={getConnectionStatusIcon()} 
                  size={16} 
                  className={getConnectionStatusColor()}
                />
                <span className="text-sm font-medium text-foreground">
                  {isCallActive ? 'Active Call' : 'Ready'}
                </span>
              </div>
              {isCallActive && (
                <>
                  <div className="w-px h-4 bg-border"></div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {callDuration}
                  </span>
                </>
              )}
            </div>

            {/* User Context Display */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-secondary-foreground">JD</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Jane Doe</span>
                  <span className="text-xs text-muted-foreground">Receptionist</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconName="LogOut"
                iconSize={14}
                onClick={() => navigate('/login')}
                className="text-muted-foreground hover:text-foreground"
              >
                Logout
              </Button>
            </div>

            {/* Emergency Actions Panel Toggle */}
            {isCallActive && (
              <Button
                variant="outline"
                size="sm"
                iconName="AlertTriangle"
                iconSize={16}
                onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}
                className="text-warning border-warning hover:bg-warning hover:text-warning-foreground"
              >
                Emergency
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Emergency Actions Panel */}
      {showEmergencyPanel && (
        <div className="fixed top-16 right-6 z-emergency bg-surface border border-border rounded-lg shadow-floating p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Emergency Actions</h3>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconSize={14}
              onClick={() => setShowEmergencyPanel(false)}
            />
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              iconName="PhoneForwarded"
              iconPosition="left"
              onClick={() => handleEmergencyAction('transfer')}
            >
              Transfer Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              iconName="UserPlus"
              iconPosition="left"
              onClick={() => handleEmergencyAction('supervisor')}
            >
              Call Supervisor
            </Button>
            <Button
              variant="destructive"
              size="sm"
              fullWidth
              iconName="PhoneOff"
              iconPosition="left"
              onClick={() => handleEmergencyAction('disconnect')}
            >
              Emergency Disconnect
            </Button>
          </div>
        </div>
      )}

      {/* Content Offset */}
      <div className="h-15"></div>
    </>
  );
};

export default Header;