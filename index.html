import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AudioQualityPanel = () => {
  const [audioSettings, setAudioSettings] = useState({
    inputDevice: 'default',
    outputDevice: 'default',
    sampleRate: 44100,
    bitRate: 128,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    bandwidthOptimization: 'auto',
    bufferSize: 1024,
    microphoneGain: 75,
    speakerVolume: 80
  });

  const [audioDevices, setAudioDevices] = useState({
    input: [
      { value: 'default', label: 'Default Microphone' },
      { value: 'usb-mic-1', label: 'USB Microphone (Logitech)' },
      { value: 'headset-1', label: 'Bluetooth Headset' }
    ],
    output: [
      { value: 'default', label: 'Default Speakers' },
      { value: 'headphones-1', label: 'Wired Headphones' },
      { value: 'bluetooth-1', label: 'Bluetooth Speakers' }
    ]
  });

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [audioLevels, setAudioLevels] = useState({
    input: 0,
    output: 0,
    background: 0
  });

  const [testResults, setTestResults] = useState({
    latency: 45,
    quality: 'excellent',
    stability: 98
  });

  const sampleRateOptions = [
    { value: 22050, label: '22.05 kHz (Low)' },
    { value: 44100, label: '44.1 kHz (Standard)' },
    { value: 48000, label: '48 kHz (High)' },
    { value: 96000, label: '96 kHz (Ultra)' }
  ];

  const bitRateOptions = [
    { value: 64, label: '64 kbps (Low)' },
    { value: 128, label: '128 kbps (Standard)' },
    { value: 192, label: '192 kbps (High)' },
    { value: 320, label: '320 kbps (Ultra)' }
  ];

  const bandwidthOptions = [
    { value: 'auto', label: 'Auto (Recommended)' },
    { value: 'low', label: 'Low Bandwidth' },
    { value: 'medium', label: 'Medium Bandwidth' },
    { value: 'high', label: 'High Bandwidth' }
  ];

  const bufferSizeOptions = [
    { value: 256, label: '256 samples (Low Latency)' },
    { value: 512, label: '512 samples (Balanced)' },
    { value: 1024, label: '1024 samples (Stable)' },
    { value: 2048, label: '2048 samples (High Stability)' }
  ];

  useEffect(() => {
    // Simulate audio level monitoring
    const interval = setInterval(() => {
      setAudioLevels({
        input: Math.random() * 100,
        output: Math.random() * 80,
        background: Math.random() * 20
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSettingChange = (key, value) => {
    setAudioSettings(prev => ({ ...prev, [key]: value }));
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationStep(0);
    
    // Simulate calibration process
    const steps = [
      'Detecting audio devices...',
      'Testing microphone levels...',
      'Calibrating speaker output...',
      'Measuring background noise...',
      'Optimizing settings...'
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      setCalibrationStep(currentStep);
      
      if (currentStep >= steps.length) {
        clearInterval(stepInterval);
        setTimeout(() => {
          setIsCalibrating(false);
          setTestResults({
            latency: Math.floor(Math.random() * 20) + 30,
            quality: ['good', 'excellent', 'excellent'][Math.floor(Math.random() * 3)],
            stability: Math.floor(Math.random() * 10) + 90
          });
        }, 1000);
      }
    }, 1500);
  };

  const runAudioTest = () => {
    console.log('Running audio test...');
    // Simulate audio test
    setTimeout(() => {
      setTestResults({
        latency: Math.floor(Math.random() * 30) + 25,
        quality: ['good', 'excellent'][Math.floor(Math.random() * 2)],
        stability: Math.floor(Math.random() * 15) + 85
      });
    }, 2000);
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-warning';
      case 'poor': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const calibrationSteps = [
    'Detecting audio devices...',
    'Testing microphone levels...',
    'Calibrating speaker output...',
    'Measuring background noise...',
    'Optimizing settings...'
  ];

  return (
    <div className="space-y-8">
      {/* Device Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Audio Devices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Input Device (Microphone)"
            options={audioDevices.input}
            value={audioSettings.inputDevice}
            onChange={(value) => handleSettingChange('inputDevice', value)}
          />
          <Select
            label="Output Device (Speakers)"
            options={audioDevices.output}
            value={audioSettings.outputDevice}
            onChange={(value) => handleSettingChange('outputDevice', value)}
          />
        </div>
        <div className="mt-6 flex items-center space-x-4">
          <Button
            variant="outline"
            iconName="Settings"
            iconPosition="left"
            onClick={startCalibration}
            disabled={isCalibrating}
          >
            {isCalibrating ? 'Calibrating...' : 'Auto Calibrate'}
          </Button>
          <Button
            variant="outline"
            iconName="TestTube"
            iconPosition="left"
            onClick={runAudioTest}
          >
            Test Audio
          </Button>
        </div>
      </div>

      {/* Audio Levels Monitor */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Real-time Audio Levels</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Microphone Input</span>
              <span className="text-xs text-muted-foreground">{Math.round(audioLevels.input)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-100 ${
                  audioLevels.input > 80 ? 'bg-error' : 
                  audioLevels.input > 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${audioLevels.input}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Speaker Output</span>
              <span className="text-xs text-muted-foreground">{Math.round(audioLevels.output)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-100"
                style={{ width: `${audioLevels.output}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Background Noise</span>
              <span className="text-xs text-muted-foreground">{Math.round(audioLevels.background)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-100 ${
                  audioLevels.background > 30 ? 'bg-error' : 
                  audioLevels.background > 15 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${audioLevels.background}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Audio Quality Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Sample Rate"
            description="Higher rates provide better quality but use more bandwidth"
            options={sampleRateOptions}
            value={audioSettings.sampleRate}
            onChange={(value) => handleSettingChange('sampleRate', parseInt(value))}
          />
          <Select
            label="Bit Rate"
            description="Audio compression quality"
            options={bitRateOptions}
            value={audioSettings.bitRate}
            onChange={(value) => handleSettingChange('bitRate', parseInt(value))}
          />
          <Select
            label="Bandwidth Optimization"
            description="Optimize for network conditions"
            options={bandwidthOptions}
            value={audioSettings.bandwidthOptimization}
            onChange={(value) => handleSettingChange('bandwidthOptimization', value)}
          />
          <Select
            label="Buffer Size"
            description="Balance between latency and stability"
            options={bufferSizeOptions}
            value={audioSettings.bufferSize}
            onChange={(value) => handleSettingChange('bufferSize', parseInt(value))}
          />
        </div>
      </div>

      {/* Volume Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Volume Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Microphone Gain (%)"
              type="range"
              min="0"
              max="100"
              value={audioSettings.microphoneGain}
              onChange={(e) => handleSettingChange('microphoneGain', parseInt(e.target.value))}
              description={`Current: ${audioSettings.microphoneGain}%`}
            />
          </div>
          <div>
            <Input
              label="Speaker Volume (%)"
              type="range"
              min="0"
              max="100"
              value={audioSettings.speakerVolume}
              onChange={(e) => handleSettingChange('speakerVolume', parseInt(e.target.value))}
              description={`Current: ${audioSettings.speakerVolume}%`}
            />
          </div>
        </div>
      </div>

      {/* Audio Processing */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Audio Processing</h3>
        <div className="space-y-4">
          <Checkbox
            label="Noise Reduction"
            description="Automatically reduce background noise"
            checked={audioSettings.noiseReduction}
            onChange={(e) => handleSettingChange('noiseReduction', e.target.checked)}
          />
          <Checkbox
            label="Echo Cancellation"
            description="Prevent audio feedback and echo"
            checked={audioSettings.echoCancellation}
            onChange={(e) => handleSettingChange('echoCancellation', e.target.checked)}
          />
          <Checkbox
            label="Auto Gain Control"
            description="Automatically adjust microphone sensitivity"
            checked={audioSettings.autoGainControl}
            onChange={(e) => handleSettingChange('autoGainControl', e.target.checked)}
          />
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Audio Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{testResults.latency}ms</div>
            <div className="text-sm text-muted-foreground">Latency</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${getQualityColor(testResults.quality)}`}>
              {testResults.quality.charAt(0).toUpperCase() + testResults.quality.slice(1)}
            </div>
            <div className="text-sm text-muted-foreground">Quality</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{testResults.stability}%</div>
            <div className="text-sm text-muted-foreground">Stability</div>
          </div>
        </div>
      </div>

      {/* Calibration Modal */}
      {isCalibrating && (
        <div className="fixed inset-0 z-modal bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-floating w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-6">
                <Icon name="Settings" size={48} className="text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Audio Calibration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we optimize your audio settings
                </p>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-foreground">
                  {calibrationSteps[calibrationStep] || 'Completing calibration...'}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(calibrationStep / calibrationSteps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Step {Math.min(calibrationStep + 1, calibrationSteps.length)} of {calibrationSteps.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioQualityPanel;