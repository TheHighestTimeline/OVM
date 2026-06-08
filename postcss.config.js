import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemHealthPanel = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
    uptime: 2847600, // seconds
    activeConnections: 12,
    totalCalls: 1247,
    errorRate: 0.02
  });

  const [services, setServices] = useState([
    {
      name: 'Translation Engine',
      status: 'healthy',
      uptime: 99.8,
      lastCheck: new Date(),
      responseTime: 45,
      version: '2.1.4'
    },
    {
      name: 'Audio Processing',
      status: 'healthy',
      uptime: 99.9,
      lastCheck: new Date(),
      responseTime: 23,
      version: '1.8.2'
    },
    {
      name: 'VoIP Gateway',
      status: 'warning',
      uptime: 98.5,
      lastCheck: new Date(),
      responseTime: 156,
      version: '3.2.1'
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: 99.95,
      lastCheck: new Date(),
      responseTime: 12,
      version: '14.2'
    },
    {
      name: 'API Server',
      status: 'healthy',
      uptime: 99.7,
      lastCheck: new Date(),
      responseTime: 67,
      version: '4.1.0'
    },
    {
      name: 'Backup Service',
      status: 'error',
      uptime: 95.2,
      lastCheck: new Date(),
      responseTime: 0,
      version: '2.0.3'
    }
  ]);

  const [diagnostics, setDiagnostics] = useState([
    {
      id: 1,
      timestamp: new Date(),
      level: 'info',
      component: 'Translation Engine',
      message: 'Service started successfully',
      details: 'All translation models loaded and ready'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 300000),
      level: 'warning',
      component: 'VoIP Gateway',
      message: 'High response time detected',
      details: 'Average response time: 156ms (threshold: 100ms)'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 600000),
      level: 'error',
      component: 'Backup Service',
      message: 'Backup failed to complete',
      details: 'Connection timeout to backup storage'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 900000),
      level: 'info',
      component: 'Database',
      message: 'Maintenance completed',
      details: 'Index optimization completed successfully'
    }
  ]);

  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(95, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 20)),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 3)),
        uptime: prev.uptime + 5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'info': return 'Info';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'AlertCircle';
      default: return 'Circle';
    }
  };

  const getMetricColor = (value, type) => {
    switch (type) {
      case 'cpu': case'memory': case'disk':
        if (value > 80) return 'text-error';
        if (value > 60) return 'text-warning';
        return 'text-success';
      case 'network':
        if (value > 70) return 'text-warning';
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const runDiagnostics = () => {
    setIsRunningDiagnostics(true);
    
    // Simulate diagnostic process
    setTimeout(() => {
      const newDiagnostic = {
        id: Date.now(),
        timestamp: new Date(),
        level: 'info',
        component: 'System Diagnostics',
        message: 'Full system diagnostic completed',
        details: 'All systems checked - 5 healthy, 1 warning, 1 error'
      };
      
      setDiagnostics(prev => [newDiagnostic, ...prev.slice(0, 9)]);
      setIsRunningDiagnostics(false);
    }, 3000);
  };

  const restartService = (serviceName) => {
    console.log(`Restarting ${serviceName}...`);
    setServices(prev => prev.map(service =>
      service.name === serviceName
        ? { ...service, status: 'healthy', lastCheck: new Date(), responseTime: Math.floor(Math.random() * 50) + 20 }
        : service
    ));
  };

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">System Overview</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Clock" size={16} />
              <span>Uptime: {formatUptime(systemMetrics.uptime)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Activity"
              iconPosition="left"
              onClick={runDiagnostics}
              disabled={isRunningDiagnostics}
            >
              {isRunningDiagnostics ? 'Running...' : 'Run Diagnostics'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">CPU Usage</span>
              <Icon name="Cpu" size={16} className="text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{Math.round(systemMetrics.cpu)}%</div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemMetrics.cpu > 80 ? 'bg-error' : 
                  systemMetrics.cpu > 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${systemMetrics.cpu}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Memory</span>
              <Icon name="HardDrive" size={16} className="text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{Math.round(systemMetrics.memory)}%</div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemMetrics.memory > 80 ? 'bg-error' : 
                  systemMetrics.memory > 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${systemMetrics.memory}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Disk Usage</span>
              <Icon name="Database" size={16} className="text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{Math.round(systemMetrics.disk)}%</div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemMetrics.disk > 80 ? 'bg-error' : 
                  systemMetrics.disk > 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${systemMetrics.disk}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Network</span>
              <Icon name="Wifi" size={16} className="text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{Math.round(systemMetrics.network)}%</div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.network}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{systemMetrics.activeConnections}</div>
            <div className="text-sm text-muted-foreground">Active Connections</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{systemMetrics.totalCalls.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Calls Today</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">{(systemMetrics.errorRate * 100).toFixed(2)}%</div>
            <div className="text-sm text-muted-foreground">Error Rate</div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Service Status</h3>
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground">Service</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Uptime</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Response Time</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Version</th>
                <th className="text-right p-4 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="p-4 text-sm font-medium text-foreground">{service.name}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getStatusIcon(service.status)} 
                        size={16} 
                        className={getStatusColor(service.status)}
                      />
                      <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground">{service.uptime}%</td>
                  <td className="p-4 text-sm text-foreground">
                    {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{service.version}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="RotateCcw"
                        onClick={() => restartService(service.name)}
                        disabled={service.status === 'healthy'}
                        title="Restart Service"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Settings"
                        title="Configure Service"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">System Diagnostics</h3>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
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

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {diagnostics.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
              <Icon 
                name={getLevelIcon(log.level)} 
                size={16} 
                className={`${getLevelColor(log.level)} mt-0.5`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{log.component}</span>
                  <span className="text-xs text-muted-foreground">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-1">{log.message}</p>
                <p className="text-xs text-muted-foreground">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
            fullWidth
          >
            Restart All Services
          </Button>
          <Button
            variant="outline"
            iconName="Database"
            iconPosition="left"
            fullWidth
          >
            Clear Cache
          </Button>
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            fullWidth
          >
            Backup System
          </Button>
          <Button
            variant="outline"
            iconName="Shield"
            iconPosition="left"
            fullWidth
          >
            Security Scan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;