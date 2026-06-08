import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ selectedCalls, onClearSelection, onBulkExport, onBulkArchive, onBulkDelete }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  const exportOptions = [
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'csv', label: 'CSV Spreadsheet' },
    { value: 'txt', label: 'Text Files' },
    { value: 'json', label: 'JSON Data' }
  ];

  const handleBulkAction = (action) => {
    switch (action) {
      case 'export':
        onBulkExport(selectedCalls, exportFormat);
        break;
      case 'archive': setShowConfirmDialog('archive');
        break;
      case 'delete':
        setShowConfirmDialog('delete');
        break;
      default:
        break;
    }
  };

  const confirmAction = () => {
    if (showConfirmDialog === 'archive') {
      onBulkArchive(selectedCalls);
    } else if (showConfirmDialog === 'delete') {
      onBulkDelete(selectedCalls);
    }
    setShowConfirmDialog(null);
  };

  if (selectedCalls.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="CheckSquare" size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {selectedCalls.length} call{selectedCalls.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconPosition="left"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Export Section */}
            <div className="flex items-center space-x-2">
              <Select
                options={exportOptions}
                value={exportFormat}
                onChange={setExportFormat}
                className="w-40"
              />
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={() => handleBulkAction('export')}
              >
                Export
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                iconName="Archive"
                iconPosition="left"
                onClick={() => handleBulkAction('archive')}
              >
                Archive
              </Button>
              <Button
                variant="destructive"
                iconName="Trash2"
                iconPosition="left"
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-6 mt-3 pt-3 border-t border-primary/20">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Total Duration: {Math.floor(selectedCalls.length * 4.5)} minutes</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="FileText" size={14} />
            <span>Estimated Export Size: {(selectedCalls.length * 0.8).toFixed(1)} MB</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Globe" size={14} />
            <span>Languages: Spanish, English</span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-floating w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  showConfirmDialog === 'delete' ? 'bg-error/10' : 'bg-warning/10'
                }`}>
                  <Icon 
                    name={showConfirmDialog === 'delete' ? 'Trash2' : 'Archive'} 
                    size={20} 
                    className={showConfirmDialog === 'delete' ? 'text-error' : 'text-warning'}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {showConfirmDialog === 'delete' ? 'Delete Calls' : 'Archive Calls'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {showConfirmDialog === 'delete' 
                      ? 'This action cannot be undone' :'Calls will be moved to archive'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-foreground">
                  Are you sure you want to {showConfirmDialog} {selectedCalls.length} selected call{selectedCalls.length !== 1 ? 's' : ''}?
                </p>
                {showConfirmDialog === 'delete' && (
                  <p className="text-sm text-error mt-2">
                    ⚠️ This will permanently remove all call records and transcripts.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant={showConfirmDialog === 'delete' ? 'destructive' : 'warning'}
                  iconName={showConfirmDialog === 'delete' ? 'Trash2' : 'Archive'}
                  iconPosition="left"
                  onClick={confirmAction}
                >
                  {showConfirmDialog === 'delete' ? 'Delete' : 'Archive'} Calls
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;