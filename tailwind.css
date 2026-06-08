import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SystemStatus = () => {
  const [systemHealth, setSystemHealth] = useState({
    api: { status: 'operational', latency: 45 },
    translation: { status: 'operational', accuracy: 98.7 },
    voip: { status: 'operational', uptime: 99.9 },
    security: { status: 'operational', lastScan: '2 hours ago' }
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate minor fluctuations in system metrics
      setSystemHealth(prev => ({
        ...prev,
        api: {
          ...prev.api,
          latency: Math.floor(Math.random() * 20) + 35 // 35-55ms
        }
      }));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'outage': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return 'CheckCircle';
      case 'degraded': return 'AlertTriangle';
      case 'outage': return 'XCircle';
      default: return 'Circle';
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
          <Icon name="Activity" size={16} className="mr-2" />
          System Status
        </h3>
        <div className="text-xs text-muted-foreground font-mono">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* API Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon 
              name={getStatusIcon(systemHealth.api.status)} 
              size={12} 
              className={getStatusColor(systemHealth.api.status)}
            />
            <span className="text-xs text-foreground">API</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {systemHealth.api.latency}ms
          </span>
        </div>

        {/* Translation Engine */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon 
              name={getStatusIcon(systemHealth.translation.status)} 
              size={12} 
              className={getStatusColor(systemHealth.translation.status)}
            />
            <span className="text-xs text-foreground">Translation</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {systemHealth.translation.accuracy}%
          </span>
        </div>

        {/* VoIP Integration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon 
              name={getStatusIcon(systemHealth.voip.status)} 
              size={12} 
              className={getStatusColor(systemHealth.voip.status)}
            />
            <span className="text-xs text-foreground">VoIP</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {systemHealth.voip.uptime}%
          </span>
        </div>

        {/* Security */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon 
              name={getStatusIcon(systemHealth.security.status)} 
              size={12} 
              className={getStatusColor(systemHealth.security.status)}
            />
            <span className="text-xs text-foreground">Security</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {systemHealth.security.lastScan}
          </span>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-gentle-pulse"></div>
          <span className="text-xs font-medium text-success">All Systems Operational</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;