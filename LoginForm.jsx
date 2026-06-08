import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TranslationCorrection = ({ 
  isVisible, 
  originalText, 
  translatedText, 
  onSave, 
  onCancel 
}) => {
  const [correctedText, setCorrectedText] = useState(translatedText);
  const [feedback, setFeedback] = useState('');

  const handleSave = () => {
    onSave({
      original: originalText,
      corrected: correctedText,
      feedback: feedback
    });
    setFeedback('');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-floating w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Edit3" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Correct Translation
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconSize={16}
            onClick={onCancel}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Original Spanish Text
            </label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900">{originalText}</p>
            </div>
          </div>

          {/* Current Translation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Current Translation
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700">{translatedText}</p>
            </div>
          </div>

          {/* Corrected Translation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Corrected Translation
            </label>
            <textarea
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter the corrected translation..."
            />
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={2}
              placeholder="Provide feedback to improve future translations..."
            />
          </div>

          {/* Suggested Improvements */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Common Translation Issues
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <span className="text-muted-foreground">Context missing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <span className="text-muted-foreground">Legal terminology</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <span className="text-muted-foreground">Cultural nuance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <span className="text-muted-foreground">Formal/informal tone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-4 border-t border-border">
          <Button
            variant="outline"
            size="default"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSave}
          >
            Save Correction
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TranslationCorrection;