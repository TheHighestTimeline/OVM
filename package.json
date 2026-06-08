import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const SecurityPanel = () => {
  const [securitySettings, setSecuritySettings] = useState({
    encryptionLevel: 'aes256',
    auditLogging: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    ipWhitelist: true,
    dataRetention: 90,
    complianceMode: 'hipaa',
    autoLogout: true,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
      expiryDays: 90
    }
  });

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      timestamp: '2025-07-25T23:15:00Z',
      user: 'jane.doe@lawfirm.com',
      action: 'Login',
      resource: 'System',
      ipAddress: '192.168.1.100',
      status: 'Success',
      details: 'Successful login from desktop application'
    },
    {
      id: 2,
      timestamp: '2025-07-25T23:10:00Z',
      user: 'maria.rodriguez@lawfirm.com',
      action: 'Call Access',
      resource: 'Transcript #1247',
      ipAddress: '192.168.1.105',
      status: 'Success',
      details: 'Accessed call transcript for case #2024-001'
    },
    {
      id: 3,
      timestamp: '2025-07-25T23:05:00Z',
      user: 'system',
      action: 'Data Export',
      resource: 'Weekly Report',
      ipAddress: '192.168.1.1',
      status: 'Success',
      details: 'Automated weekly compliance report generated'
    },
    {
      id: 4,
      timestamp: '2025-07-25T22:58:00Z',
      user: 'unknown',
      action: 'Login Attempt',
      resource: 'System',
      ipAddress: '203.0.113.45',
      status: 'Failed',
      details: 'Failed login attempt - invalid credentials'
    }
  ]);

  const [whitelistedIPs, setWhitelistedIPs] = useState([
    { id: 1, ip: '192.168.1.0/24', description: 'Office Network', enabled: true },
    { id: 2, ip: '10.0.0.0/8', description: 'VPN Network', enabled: true },
    { id: 3, ip: '203.0.113.100', description: 'Remote Office', enabled: false }
  ]);

  const [showAddIPModal, setShowAddIPModal] = useState(false);
  const [newIP, setNewIP] = useState({ ip: '', description: '' });

  const encryptionOptions = [
    { value: 'aes128', label: 'AES-128 (Standard)' },
    { value: 'aes256', label: 'AES-256 (High Security)' },
    { value: 'rsa2048', label: 'RSA-2048 (Legacy Support)' },
    { value: 'ecc', label: 'ECC P-256 (Modern)' }
  ];

  const complianceOptions = [
    { value: 'hipaa', label: 'HIPAA (Healthcare)' },
    { value: 'sox', label: 'SOX (Financial)' },
    { value: 'gdpr', label: 'GDPR (European)' },
    { value: 'ccpa', label: 'CCPA (California)' },
    { value: 'custom', label: 'Custom Compliance' }
  ];

  const retentionOptions = [
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '6 months' },
    { value: 365, label: '1 year' },
    { value: 2555, label: '7 years (Legal)' },
    { value: -1, label: 'Indefinite' }
  ];

  const sessionTimeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 480, label: '8 hours' },
    { value: -1, label: 'Never' }
  ];

  const handleSecuritySettingChange = (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordPolicyChange = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      passwordPolicy: { ...prev.passwordPolicy, [key]: value }
    }));
  };

  const handleAddIP = () => {
    if (newIP.ip && newIP.description) {
      setWhitelistedIPs(prev => [...prev, {
        id: Date.now(),
        ...newIP,
        enabled: true
      }]);
      setNewIP({ ip: '', description: '' });
      setShowAddIPModal(false);
    }
  };

  const handleToggleIP = (id) => {
    setWhitelistedIPs(prev => prev.map(ip =>
      ip.id === id ? { ...ip, enabled: !ip.enabled } : ip
    ));
  };

  const handleDeleteIP = (id) => {
    setWhitelistedIPs(prev => prev.filter(ip => ip.id !== id));
  };

  const exportAuditLogs = () => {
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'text-success';
      case 'Failed': return 'text-error';
      case 'Warning': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Login': return 'LogIn';
      case 'Login Attempt': return 'AlertTriangle';
      case 'Call Access': return 'Phone';
      case 'Data Export': return 'Download';
      case 'Settings Change': return 'Settings';
      default: return 'Activity';
    }
  };

  return (
    <div className="space-y-8">
      {/* Encryption & Security */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Encryption & Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Encryption Level"
            description="Data encryption standard for all communications"
            options={encryptionOptions}
            value={securitySettings.encryptionLevel}
            onChange={(value) => handleSecuritySettingChange('encryptionLevel', value)}
          />
          <Select
            label="Session Timeout"
            description="Automatic logout after inactivity"
            options={sessionTimeoutOptions}
            value={securitySettings.sessionTimeout}
            onChange={(value) => handleSecuritySettingChange('sessionTimeout', parseInt(value))}
          />
        </div>
        <div className="mt-6 space-y-4">
          <Checkbox
            label="Enable Two-Factor Authentication"
            description="Require 2FA for all user logins"
            checked={securitySettings.twoFactorAuth}
            onChange={(e) => handleSecuritySettingChange('twoFactorAuth', e.target.checked)}
          />
          <Checkbox
            label="Enable Audit Logging"
            description="Log all user actions and system events"
            checked={securitySettings.auditLogging}
            onChange={(e) => handleSecuritySettingChange('auditLogging', e.target.checked)}
          />
          <Checkbox
            label="Auto Logout on Idle"
            description="Automatically log out inactive users"
            checked={securitySettings.autoLogout}
            onChange={(e) => handleSecuritySettingChange('autoLogout', e.target.checked)}
          />
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Minimum Length"
            type="number"
            min="8"
            max="32"
            value={securitySettings.passwordPolicy.minLength}
            onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
          />
          <Input
            label="Password Expiry (Days)"
            type="number"
            min="30"
            max="365"
            value={securitySettings.passwordPolicy.expiryDays}
            onChange={(e) => handlePasswordPolicyChange('expiryDays', parseInt(e.target.value))}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            label="Require Uppercase Letters"
            checked={securitySettings.passwordPolicy.requireUppercase}
            onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
          />
          <Checkbox
            label="Require Numbers"
            checked={securitySettings.passwordPolicy.requireNumbers}
            onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
          />
          <Checkbox
            label="Require Special Characters"
            checked={securitySettings.passwordPolicy.requireSymbols}
            onChange={(e) => handlePasswordPolicyChange('requireSymbols', e.target.checked)}
          />
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">IP Address Whitelist</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Control access by IP address ranges
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              label="Enable IP Whitelist"
              checked={securitySettings.ipWhitelist}
              onChange={(e) => handleSecuritySettingChange('ipWhitelist', e.target.checked)}
            />
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={() => setShowAddIPModal(true)}
              disabled={!securitySettings.ipWhitelist}
            >
              Add IP
            </Button>
          </div>
        </div>

        {securitySettings.ipWhitelist && (
          <div className="overflow-hidden border border-border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-foreground">IP Address/Range</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Description</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Status</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {whitelistedIPs.map((ip) => (
                  <tr key={ip.id} className="border-t border-border">
                    <td className="p-3 text-sm font-mono text-foreground">{ip.ip}</td>
                    <td className="p-3 text-sm text-foreground">{ip.description}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ip.enabled ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        {ip.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName={ip.enabled ? 'EyeOff' : 'Eye'}
                          onClick={() => handleToggleIP(ip.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Trash2"
                          onClick={() => handleDeleteIP(ip.id)}
                          className="text-error hover:text-error"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance & Data Retention */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Compliance & Data Retention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Compliance Standard"
            description="Legal compliance framework"
            options={complianceOptions}
            value={securitySettings.complianceMode}
            onChange={(value) => handleSecuritySettingChange('complianceMode', value)}
          />
          <Select
            label="Data Retention Period"
            description="How long to keep call data and transcripts"
            options={retentionOptions}
            value={securitySettings.dataRetention}
            onChange={(value) => handleSecuritySettingChange('dataRetention', parseInt(value))}
          />
        </div>
        <div className="mt-6 bg-muted rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={20} className="text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Current Compliance Status:</p>
              <ul className="space-y-1">
                <li>✓ Data encryption at rest and in transit</li>
                <li>✓ Audit logging enabled for all actions</li>
                <li>✓ Access controls and user permissions</li>
                <li>✓ Regular security assessments</li>
                <li>✓ Incident response procedures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Audit Logs</h3>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={exportAuditLogs}
            >
              Export Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              iconPosition="left"
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-hidden border border-border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Timestamp</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">User</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Action</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Resource</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-t border-border">
                    <td className="p-3 text-sm font-mono text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-foreground">{log.user}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Icon name={getActionIcon(log.action)} size={14} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{log.action}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-foreground">{log.resource}</td>
                    <td className="p-3">
                      <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-mono text-muted-foreground">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add IP Modal */}
      {showAddIPModal && (
        <div className="fixed inset-0 z-modal bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-floating w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Add IP Address</h3>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setShowAddIPModal(false)}
              />
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="IP Address or Range"
                placeholder="192.168.1.100 or 192.168.1.0/24"
                value={newIP.ip}
                onChange={(e) => setNewIP(prev => ({ ...prev, ip: e.target.value }))}
                description="Enter single IP or CIDR notation for ranges"
              />
              <Input
                label="Description"
                placeholder="Office network, VPN, etc."
                value={newIP.description}
                onChange={(e) => setNewIP(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowAddIPModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddIP}
                disabled={!newIP.ip || !newIP.description}
              >
                Add IP Address
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPanel;