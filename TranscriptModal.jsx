import React from 'react';
import Icon from '../../../components/AppIcon';

const CallerInfoPanel = ({ 
  callerInfo, 
  callDuration, 
  connectionQuality, 
  isRecording 
}) => {
  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Wifi';
      case 'good': return 'Wifi';
      case 'fair': return 'WifiOff';
      case 'poor': return 'AlertTriangle';
      default: return 'Wifi';
    }
  };

  return (
    <div className="bg-surface border-b border-border p-6">
      <div className="flex items-center justify-between">
        {/* Caller Information */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={24} color="white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-foreground">
              {callerInfo.name}
            </h2>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <span>{callerInfo.phone}</span>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <span>{callerInfo.location}</span>
            </div>
          </div>
        </div>

        {/* Call Status & Controls */}
        <div className="flex items-center space-x-6">
          {/* Connection Quality */}
          <div className="flex items-center space-x-2">
            <Icon 
              name={getConnectionIcon()} 
              size={16} 
              className={getConnectionColor()}
            />
            <span className={`text-sm font-medium ${getConnectionColor()}`}>
              {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
            </span>
          </div>

          {/* Call Duration */}
          <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-sm font-mono font-medium text-foreground">
              {callDuration}
            </span>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-2 bg-error/10 text-error px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-error rounded-full animate-gentle-pulse"></div>
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}

          {/* Language Indicator */}
          <div className="flex items-center space-x-2 bg-accent/10 text-accent px-3 py-2 rounded-lg">
            <Icon name="Languages" size={16} />
            <span className="text-sm font-medium">ES → EN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallerInfoPanel;