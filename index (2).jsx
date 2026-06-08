import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MessageTakingPanel = ({ 
  isVisible, 
  onClose, 
  onSaveMessage, 
  callerInfo 
}) => {
  const [messageData, setMessageData] = useState({
    callerName: callerInfo?.name || '',
    phoneNumber: callerInfo?.phone || '',
    email: '',
    company: '',
    urgency: 'normal',
    category: 'general',
    message: '',
    callbackRequested: false,
    preferredTime: '',
    notes: ''
  });

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-muted-foreground' },
    { value: 'normal', label: 'Normal', color: 'text-foreground' },
    { value: 'high', label: 'High Priority', color: 'text-warning' },
    { value: 'urgent', label: 'Urgent', color: 'text-error' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'legal', label: 'Legal Consultation' },
    { value: 'appointment', label: 'Appointment Request' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'document', label: 'Document Request' },
    { value: 'complaint', label: 'Complaint' }
  ];

  const handleInputChange = (field, value) => {
    setMessageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSaveMessage(messageData);
    setMessageData({
      callerName: '',
      phoneNumber: '',
      email: '',
      company: '',
      urgency: 'normal',
      category: 'general',
      message: '',
      callbackRequested: false,
      preferredTime: '',
      notes: ''
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-surface border-l border-border shadow-floating z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted">
        <div className="flex items-center space-x-2">
          <Icon name="MessageSquare" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Message Taking</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          iconSize={16}
          onClick={onClose}
        />
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4">
        {/* Caller Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Caller Information
          </h4>
          
          <Input
            label="Caller Name"
            type="text"
            value={messageData.callerName}
            onChange={(e) => handleInputChange('callerName', e.target.value)}
            placeholder="Enter caller's name"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={messageData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="(555) 123-4567"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={messageData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="caller@email.com"
          />

          <Input
            label="Company/Organization"
            type="text"
            value={messageData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Company name (optional)"
          />
        </div>

        {/* Message Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Message Details
          </h4>

          {/* Urgency Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Urgency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('urgency', option.value)}
                  className={`
                    p-2 text-sm rounded-lg border transition-professional
                    ${messageData.urgency === option.value
                      ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background hover:bg-muted'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={messageData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Message</label>
            <textarea
              value={messageData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter the caller's message or inquiry..."
              rows={4}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Callback Request */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="callback"
              checked={messageData.callbackRequested}
              onChange={(e) => handleInputChange('callbackRequested', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="callback" className="text-sm text-foreground">
              Callback requested
            </label>
          </div>

          {/* Preferred Callback Time */}
          {messageData.callbackRequested && (
            <Input
              label="Preferred Callback Time"
              type="text"
              value={messageData.preferredTime}
              onChange={(e) => handleInputChange('preferredTime', e.target.value)}
              placeholder="e.g., Tomorrow morning, After 3 PM"
            />
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Additional Notes</label>
            <textarea
              value={messageData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes or context..."
              rows={3}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-border">
          <Button
            variant="default"
            size="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSave}
            fullWidth
          >
            Save Message
          </Button>
          <Button
            variant="outline"
            size="default"
            iconName="X"
            iconPosition="left"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-2 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Quick Actions
          </h5>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              iconName="Mail"
              iconPosition="left"
              className="justify-start"
            >
              Send Email
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Calendar"
              iconPosition="left"
              className="justify-start"
            >
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTakingPanel;