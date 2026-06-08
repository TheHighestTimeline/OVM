import React, { useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const TranslationDisplay = ({ 
  conversations, 
  isTranslating, 
  translationConfidence,
  onCorrection 
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="flex-1 bg-background">
      {/* Translation Header */}
      <div className="flex items-center justify-between p-4 bg-muted border-b border-border">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Live Translation</h3>
          {isTranslating && (
            <div className="flex items-center space-x-2 text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-gentle-pulse"></div>
              <span className="text-sm font-medium">Translating...</span>
            </div>
          )}
        </div>
        
        {translationConfidence && (
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={16} className="text-muted-foreground" />
            <span className={`text-sm font-medium ${getConfidenceColor(translationConfidence)}`}>
              {translationConfidence}% confidence
            </span>
          </div>
        )}
      </div>

      {/* Conversation Area */}
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 space-y-4"
      >
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              Ready for Translation
            </h4>
            <p className="text-muted-foreground">
              Start speaking to see live translations appear here
            </p>
          </div>
        ) : (
          conversations.map((conversation, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              {/* Spanish (Original) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Volume2" size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Spanish (Original)
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-mono">
                    {conversation.timestamp}
                  </span>
                </div>
                <p className="text-blue-900 leading-relaxed">
                  {conversation.spanish}
                </p>
                {conversation.isLive && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>

              {/* English (Translation) */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Languages" size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      English (Translation)
                    </span>
                  </div>
                  <button
                    onClick={() => onCorrection(index)}
                    className="text-xs text-green-600 hover:text-green-800 flex items-center space-x-1"
                  >
                    <Icon name="Edit3" size={12} />
                    <span>Correct</span>
                  </button>
                </div>
                <p className="text-green-900 leading-relaxed">
                  {conversation.english}
                </p>
                {conversation.confidence && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-full bg-green-200 rounded-full h-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${conversation.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      {conversation.confidence}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border p-4 bg-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
              <Icon name="Download" size={16} />
              <span>Export Transcript</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
              <Icon name="Copy" size={16} />
              <span>Copy All</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={14} />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDisplay;