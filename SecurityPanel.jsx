import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CallHistoryTable = ({ 
  calls, 
  selectedCalls, 
  onSelectCall, 
  onSelectAll, 
  onViewTranscript, 
  onExpandRow,
  expandedRows,
  sortConfig,
  onSort 
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'ArrowUpDown';
    return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getAccuracyColor = (score) => {
    if (score >= 95) return 'text-success';
    if (score >= 85) return 'text-warning';
    return 'text-error';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedCalls.length === calls.length && calls.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-professional"
                >
                  <span>Date & Time</span>
                  <Icon name={getSortIcon('date')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('caller')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-professional"
                >
                  <span>Caller Information</span>
                  <Icon name={getSortIcon('caller')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('duration')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-professional"
                >
                  <span>Duration</span>
                  <Icon name={getSortIcon('duration')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('accuracy')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-professional"
                >
                  <span>Accuracy</span>
                  <Icon name={getSortIcon('accuracy')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Staff Member</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {calls.map((call) => (
              <React.Fragment key={call.id}>
                <tr className="hover:bg-muted/50 transition-professional">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCalls.includes(call.id)}
                      onChange={() => onSelectCall(call.id)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {call.date}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {call.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {call.callerName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {call.phoneNumber}
                      </span>
                      {call.caseNumber && (
                        <span className="text-xs text-primary font-mono">
                          Case: {call.caseNumber}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-foreground">
                      {formatDuration(call.duration)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getAccuracyColor(call.accuracy)}`}>
                        {call.accuracy}%
                      </span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            call.accuracy >= 95 ? 'bg-success' :
                            call.accuracy >= 85 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${call.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-secondary-foreground">
                          {call.staffMember.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-foreground">{call.staffMember}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName={expandedRows.includes(call.id) ? 'ChevronUp' : 'ChevronDown'}
                        iconSize={14}
                        onClick={() => onExpandRow(call.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expandedRows.includes(call.id) ? 'Collapse' : 'Expand'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="FileText"
                        iconSize={14}
                        onClick={() => onViewTranscript(call)}
                      >
                        Transcript
                      </Button>
                    </div>
                  </td>
                </tr>
                {expandedRows.includes(call.id) && (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 bg-muted/30">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground mb-2">Call Summary</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {call.summary}
                            </p>
                          </div>
                          <div className="ml-6 flex flex-col space-y-2">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Icon name="Globe" size={12} />
                              <span>Languages: {call.languages.join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Icon name="MessageSquare" size={12} />
                              <span>{call.messageCount} messages exchanged</span>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-border pt-3">
                          <h5 className="text-xs font-medium text-foreground mb-2">Quick Transcript Preview</h5>
                          <div className="bg-surface border border-border rounded p-3 max-h-32 overflow-y-auto">
                            <div className="space-y-2 text-xs">
                              {call.transcriptPreview.map((message, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="font-medium text-primary min-w-0">
                                    {message.speaker}:
                                  </span>
                                  <span className="text-muted-foreground">{message.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="divide-y divide-border">
          {calls.map((call) => (
            <div key={call.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCalls.includes(call.id)}
                    onChange={() => onSelectCall(call.id)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {call.callerName}
                      </span>
                      <span className={`text-xs font-medium ${getAccuracyColor(call.accuracy)}`}>
                        {call.accuracy}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{call.date} at {call.time}</div>
                      <div>{call.phoneNumber}</div>
                      <div>Duration: {formatDuration(call.duration)}</div>
                      <div>Staff: {call.staffMember}</div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="FileText"
                  iconSize={14}
                  onClick={() => onViewTranscript(call)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallHistoryTable;