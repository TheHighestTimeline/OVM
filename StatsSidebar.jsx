import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AudioControls = ({ 
  isMuted, 
  onMuteToggle, 
  inputVolume, 
  outputVolume, 
  onVolumeChange, 
  onEmergencyTransfer,
  onEndCall,
  isTransferring 
}) => {
  return (
    <div className="bg-surface border-t border-border p-6">
      <div className="flex items-center justify-between">
        {/* Primary Audio Controls */}
        <div className="flex items-center space-x-6">
          {/* Mute Toggle */}
          <Button
            variant={isMuted ? "destructive" : "default"}
            size="lg"
            iconName={isMuted ? "MicOff" : "Mic"}
            iconSize={24}
            onClick={onMuteToggle}
            className="w-16 h-16 rounded-full"
          >
            {isMuted ? "Unmute" : "Mute"}
          </Button>

          {/* Volume Controls */}
          <div className="flex items-center space-x-8">
            {/* Input Volume */}
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="MicIcon" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Input</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="VolumeX" size={16} className="text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={inputVolume}
                  onChange={(e) => onVolumeChange('input', e.target.value)}
                  className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <Icon name="Volume2" size={16} className="text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground w-8">
                  {inputVolume}%
                </span>
              </div>
            </div>

            {/* Output Volume */}
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="Volume2" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Output</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="VolumeX" size={16} className="text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={outputVolume}
                  onChange={(e) => onVolumeChange('output', e.target.value)}
                  className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <Icon name="Volume2" size={16} className="text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground w-8">
                  {outputVolume}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Controls */}
        <div className="flex items-center space-x-4">
          {/* Speech Pace Control */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium text-foreground">Speech Pace</span>
            <div className="flex items-center space-x-2">
              <Icon name="Rewind" size={16} className="text-muted-foreground" />
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                defaultValue="1"
                className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
              <Icon name="FastForward" size={16} className="text-muted-foreground" />
            </div>
          </div>

          {/* Language Switch */}
          <Button
            variant="outline"
            size="default"
            iconName="ArrowLeftRight"
            iconPosition="left"
            className="flex-col h-16 w-20"
          >
            <span className="text-xs">Switch</span>
            <span className="text-xs">Language</span>
          </Button>
        </div>

        {/* Emergency & Call Controls */}
        <div className="flex items-center space-x-4">
          {/* Emergency Transfer */}
          <Button
            variant="warning"
            size="lg"
            iconName="PhoneForwarded"
            iconPosition="left"
            loading={isTransferring}
            onClick={onEmergencyTransfer}
            className="h-16"
          >
            Emergency Transfer
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            iconName="PhoneOff"
            iconPosition="left"
            onClick={onEndCall}
            className="h-16"
          >
            End Call
          </Button>
        </div>
      </div>

      {/* Audio Status Indicators */}
      <div className="flex items-center justify-center space-x-8 mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-success rounded-full animate-gentle-pulse"></div>
          <span className="text-muted-foreground">Audio Input: Active</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-primary rounded-full animate-gentle-pulse"></div>
          <span className="text-muted-foreground">Translation: Real-time</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-accent rounded-full animate-gentle-pulse"></div>
          <span className="text-muted-foreground">Connection: Stable</span>
        </div>
      </div>
    </div>
  );
};

export default AudioControls;