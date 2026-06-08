import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsSidebar = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Calls',
      value: stats.totalCalls,
      change: '+12%',
      changeType: 'positive',
      icon: 'Phone',
      description: 'This month'
    },
    {
      title: 'Average Accuracy',
      value: `${stats.averageAccuracy}%`,
      change: '+2.3%',
      changeType: 'positive',
      icon: 'Target',
      description: 'Translation quality'
    },
    {
      title: 'Total Duration',
      value: stats.totalDuration,
      change: '+8%',
      changeType: 'positive',
      icon: 'Clock',
      description: 'Call time this month'
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff,
      change: '0%',
      changeType: 'neutral',
      icon: 'Users',
      description: 'Handling calls'
    }
  ];

  const languageBreakdown = [
    { language: 'Spanish', count: 156, percentage: 78, color: 'bg-primary' },
    { language: 'English', count: 32, percentage: 16, color: 'bg-secondary' },
    { language: 'French', count: 8, percentage: 4, color: 'bg-accent' },
    { language: 'Portuguese', count: 4, percentage: 2, color: 'bg-warning' }
  ];

  const topCallers = [
    { name: 'Carlos Mendoza', calls: 8, accuracy: 96, phone: '+1 (555) 123-4567' },
    { name: 'Maria Rodriguez', calls: 6, accuracy: 94, phone: '+1 (555) 234-5678' },
    { name: 'Juan Martinez', calls: 5, accuracy: 98, phone: '+1 (555) 345-6789' },
    { name: 'Ana Gonzalez', calls: 4, accuracy: 92, phone: '+1 (555) 456-7890' }
  ];

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return 'text-success';
    if (accuracy >= 85) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="w-80 bg-surface border-l border-border p-6 space-y-6 overflow-y-auto">
      {/* Summary Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Summary Statistics</h3>
        <div className="space-y-4">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={stat.icon} size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{stat.title}</span>
                </div>
                <span className={`text-xs font-medium ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
              <span className="text-xs text-muted-foreground">{stat.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Language Breakdown</h3>
        <div className="space-y-3">
          {languageBreakdown.map((lang, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{lang.language}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{lang.count} calls</span>
                  <span className="text-sm font-medium text-foreground">{lang.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${lang.color} transition-all duration-300`}
                  style={{ width: `${lang.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Callers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Frequent Callers</h3>
        <div className="space-y-3">
          {topCallers.map((caller, index) => (
            <div key={index} className="bg-muted/30 border border-border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{caller.name}</span>
                    <span className={`text-xs font-medium ${getAccuracyColor(caller.accuracy)}`}>
                      {caller.accuracy}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{caller.phone}</div>
                    <div>{caller.calls} calls this month</div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">#{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Performance Trends</h3>
        <div className="space-y-3">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="text-sm font-medium text-foreground">Translation Quality</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Excellent (&gt;95%)</span>
                <span className="text-success font-medium">68%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Good (85-95%)</span>
                <span className="text-warning font-medium">24%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Needs Review (&lt;85%)</span>
                <span className="text-error font-medium">8%</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Clock" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Response Times</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Average Response</span>
                <span className="text-foreground font-medium">2.3s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fastest Response</span>
                <span className="text-success font-medium">0.8s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Peak Hours</span>
                <span className="text-foreground font-medium">2-4 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-3 text-left bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-professional">
            <Icon name="Download" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Export Monthly Report</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-professional">
            <Icon name="BarChart3" size={16} className="text-secondary" />
            <span className="text-sm text-foreground">View Analytics Dashboard</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-professional">
            <Icon name="Settings" size={16} className="text-muted-foreground" />
            <span className="text-sm text-foreground">Configure Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsSidebar;