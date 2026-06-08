import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const NotificationPanel = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    soundAlerts: true,
    browserNotifications: true,
    smsNotifications: false,
    slackIntegration: true,
    teamsIntegration: false,
    webhookUrl: '',
    quietHours: {
      enabled: true,
      startTime: '18:00',
      endTime: '08:00'
    }
  });

  const [emailSettings, setEmailSettings] = useState({
    incomingCalls: true,
    callCompleted: true,
    transcriptReady: true,
    systemAlerts: true,
    weeklyReports: true,
    errorNotifications: true,
    maintenanceUpdates: false
  });

  const [desktopSettings, setDesktopSettings] = useState({
    incomingCalls: true,
    urgentAlerts: true,
    systemStatus: false,
    callReminders: true,
    position: 'top-right',
    duration: 5000,
    sound: 'default'
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    slack: {
      enabled: true,
      webhook: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      channel: '#voicelink-alerts',
      username: 'VoiceLink Bot'
    },
    teams: {
      enabled: false,
      webhook: '',
      channel: 'VoiceLink Notifications'
    },
    email: {
      smtpServer: 'smtp.lawfirm.com',
      port: 587,
      username: 'voicelink@lawfirm.com',
      fromName: 'VoiceLink System'
    }
  });

  const positionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' }
  ];

  const soundOptions = [
    { value: 'default', label: 'Default' },
    { value: 'chime', label: 'Chime' },
    { value: 'bell', label: 'Bell' },
    { value: 'alert', label: 'Alert' },
    { value: 'none', label: 'No Sound' }
  ];

  const durationOptions = [
    { value: 3000, label: '3 seconds' },
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' },
    { value: 0, label: 'Until dismissed' }
  ];

  const handleNotificationSettingChange = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEmailSettingChange = (key, value) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDesktopSettingChange = (key, value) => {
    setDesktopSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleQuietHoursChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }));
  };

  const handleIntegrationChange = (platform, key, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      [platform]: { ...prev[platform], [key]: value }
    }));
  };

  const testNotification = (type) => {
    console.log(`Testing ${type} notification`);
    // Mock notification test
    if (type === 'desktop' && 'Notification' in window) {
      new Notification('VoiceLink Test', {
        body: 'This is a test notification from VoiceLink Translator',
        icon: '/favicon.ico'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        testNotification('desktop');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* General Notification Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">General Notification Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              label="Email Notifications"
              description="Receive notifications via email"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
            />
            <Checkbox
              label="Desktop Notifications"
              description="Show browser notifications"
              checked={notificationSettings.desktopNotifications}
              onChange={(e) => handleNotificationSettingChange('desktopNotifications', e.target.checked)}
            />
            <Checkbox
              label="Sound Alerts"
              description="Play sound for important alerts"
              checked={notificationSettings.soundAlerts}
              onChange={(e) => handleNotificationSettingChange('soundAlerts', e.target.checked)}
            />
            <Checkbox
              label="SMS Notifications"
              description="Receive critical alerts via SMS"
              checked={notificationSettings.smsNotifications}
              onChange={(e) => handleNotificationSettingChange('smsNotifications', e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Email Notification Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Email Notifications</h3>
          <Button
            variant="outline"
            size="sm"
            iconName="Mail"
            iconPosition="left"
            onClick={() => testNotification('email')}
            disabled={!notificationSettings.emailNotifications}
          >
            Test Email
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            label="Incoming Calls"
            description="New call notifications"
            checked={emailSettings.incomingCalls}
            onChange={(e) => handleEmailSettingChange('incomingCalls', e.target.checked)}
            disabled={!notificationSettings.emailNotifications}
          />
          <Checkbox
            label="Call Completed"
            description="Call completion notifications"
            checked={emailSettings.callCompleted}
            onChange={(e) => handleEmailSettingChange('callCompleted', e.target.checked)}
            disabled={!notificationSettings.emailNotifications}
          />
          <Checkbox
            label="Transcript Ready"
            description="When transcripts are processed"
            checked={emailSettings.transcriptReady}
            onChange={(e) => handleEmailSettingChange('transcriptReady', e.target.checked)}
            disabled={!notificationSettings.emailNotifications}
          />
          <Checkbox
            label="System Alerts"
            description="System status and errors"
            checked={emailSettings.systemAlerts}
            onChange={(e) => handleEmailSettingChange('systemAlerts', e.target.checked)}
            disabled={!notificationSettings.emailNotifications}
          />
          <Checkbox
            label="Weekly Reports"
            description="Weekly usage summaries"
            checked={emailSettings.weeklyReports}
            onChange={(e) => handleEmailSettingChange('weeklyReports', e.target.checked)}
            disabled={!notificationSettings.emailNotifications}
          />
          <Checkbox
            label="Error Notifications"
            description="Critical system errors"
            checked={emailSettings.errorNotifications}
            onChange={(e) => handleEmailSettingChange('errorNotifications', e.target.checked)}
            disabled={!notificationSettings.emailNotifications}
          />
        </div>
      </div>

      {/* Desktop Notification Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Desktop Notifications</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Bell"
              iconPosition="left"
              onClick={requestNotificationPermission}
            >
              Enable Permissions
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="TestTube"
              iconPosition="left"
              onClick={() => testNotification('desktop')}
              disabled={!notificationSettings.desktopNotifications}
            >
              Test
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <Checkbox
              label="Incoming Calls"
              description="Show notifications for new calls"
              checked={desktopSettings.incomingCalls}
              onChange={(e) => handleDesktopSettingChange('incomingCalls', e.target.checked)}
              disabled={!notificationSettings.desktopNotifications}
            />
            <Checkbox
              label="Urgent Alerts"
              description="High priority system alerts"
              checked={desktopSettings.urgentAlerts}
              onChange={(e) => handleDesktopSettingChange('urgentAlerts', e.target.checked)}
              disabled={!notificationSettings.desktopNotifications}
            />
            <Checkbox
              label="System Status"
              description="Connection and system updates"
              checked={desktopSettings.systemStatus}
              onChange={(e) => handleDesktopSettingChange('systemStatus', e.target.checked)}
              disabled={!notificationSettings.desktopNotifications}
            />
            <Checkbox
              label="Call Reminders"
              description="Scheduled call reminders"
              checked={desktopSettings.callReminders}
              onChange={(e) => handleDesktopSettingChange('callReminders', e.target.checked)}
              disabled={!notificationSettings.desktopNotifications}
            />
          </div>
          
          <div className="space-y-4">
            <Select
              label="Notification Position"
              options={positionOptions}
              value={desktopSettings.position}
              onChange={(value) => handleDesktopSettingChange('position', value)}
              disabled={!notificationSettings.desktopNotifications}
            />
            <Select
              label="Display Duration"
              options={durationOptions}
              value={desktopSettings.duration}
              onChange={(value) => handleDesktopSettingChange('duration', parseInt(value))}
              disabled={!notificationSettings.desktopNotifications}
            />
            <Select
              label="Notification Sound"
              options={soundOptions}
              value={desktopSettings.sound}
              onChange={(value) => handleDesktopSettingChange('sound', value)}
              disabled={!notificationSettings.desktopNotifications}
            />
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quiet Hours</h3>
        <div className="space-y-4">
          <Checkbox
            label="Enable Quiet Hours"
            description="Suppress non-critical notifications during specified hours"
            checked={notificationSettings.quietHours.enabled}
            onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
          />
          {notificationSettings.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <Input
                label="Start Time"
                type="time"
                value={notificationSettings.quietHours.startTime}
                onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
              />
              <Input
                label="End Time"
                type="time"
                value={notificationSettings.quietHours.endTime}
                onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Integration Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Third-party Integrations</h3>
        
        {/* Slack Integration */}
        <div className="mb-6 p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="MessageSquare" size={16} className="text-primary-foreground" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">Slack Integration</h4>
                <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
              </div>
            </div>
            <Checkbox
              checked={integrationSettings.slack.enabled}
              onChange={(e) => handleIntegrationChange('slack', 'enabled', e.target.checked)}
            />
          </div>
          {integrationSettings.slack.enabled && (
            <div className="space-y-4">
              <Input
                label="Webhook URL"
                placeholder="https://hooks.slack.com/services/..."
                value={integrationSettings.slack.webhook}
                onChange={(e) => handleIntegrationChange('slack', 'webhook', e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Channel"
                  placeholder="#voicelink-alerts"
                  value={integrationSettings.slack.channel}
                  onChange={(e) => handleIntegrationChange('slack', 'channel', e.target.value)}
                />
                <Input
                  label="Bot Username"
                  placeholder="VoiceLink Bot"
                  value={integrationSettings.slack.username}
                  onChange={(e) => handleIntegrationChange('slack', 'username', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Microsoft Teams Integration */}
        <div className="mb-6 p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Icon name="Users" size={16} className="text-secondary-foreground" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">Microsoft Teams</h4>
                <p className="text-sm text-muted-foreground">Send notifications to Teams channels</p>
              </div>
            </div>
            <Checkbox
              checked={integrationSettings.teams.enabled}
              onChange={(e) => handleIntegrationChange('teams', 'enabled', e.target.checked)}
            />
          </div>
          {integrationSettings.teams.enabled && (
            <div className="space-y-4">
              <Input
                label="Webhook URL"
                placeholder="https://outlook.office.com/webhook/..."
                value={integrationSettings.teams.webhook}
                onChange={(e) => handleIntegrationChange('teams', 'webhook', e.target.value)}
              />
              <Input
                label="Channel Name"
                placeholder="VoiceLink Notifications"
                value={integrationSettings.teams.channel}
                onChange={(e) => handleIntegrationChange('teams', 'channel', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Custom Webhook */}
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Icon name="Webhook" size={16} className="text-accent-foreground" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground">Custom Webhook</h4>
              <p className="text-sm text-muted-foreground">Send notifications to custom endpoints</p>
            </div>
          </div>
          <Input
            label="Webhook URL"
            placeholder="https://your-endpoint.com/webhook"
            value={notificationSettings.webhookUrl}
            onChange={(e) => handleNotificationSettingChange('webhookUrl', e.target.value)}
            description="JSON payload will be sent via POST request"
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;