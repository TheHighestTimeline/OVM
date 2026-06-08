import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const TranslationSettingsPanel = () => {
  const [settings, setSettings] = useState({
    primaryLanguage: 'en',
    secondaryLanguage: 'es',
    accuracyThreshold: 85,
    enableRealTimeCorrection: true,
    enableContextualTranslation: true,
    enableLegalTerminology: true,
    customDictionaryEnabled: true,
    autoDetectLanguage: false,
    confidenceDisplay: true
  });

  const [customTerms, setCustomTerms] = useState([
    { id: 1, english: 'Power of Attorney', spanish: 'Poder Notarial', category: 'Legal Documents' },
    { id: 2, english: 'Deposition', spanish: 'Declaración Jurada', category: 'Court Proceedings' },
    { id: 3, english: 'Retainer Agreement', spanish: 'Acuerdo de Honorarios', category: 'Contracts' },
    { id: 4, english: 'Statute of Limitations', spanish: 'Prescripción Legal', category: 'Legal Concepts' },
    { id: 5, english: 'Plaintiff', spanish: 'Demandante', category: 'Court Parties' }
  ]);

  const [showAddTermModal, setShowAddTermModal] = useState(false);
  const [newTerm, setNewTerm] = useState({ english: '', spanish: '', category: '' });

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish (Español)' },
    { value: 'fr', label: 'French (Français)' },
    { value: 'de', label: 'German (Deutsch)' },
    { value: 'pt', label: 'Portuguese (Português)' }
  ];

  const categoryOptions = [
    { value: 'Legal Documents', label: 'Legal Documents' },
    { value: 'Court Proceedings', label: 'Court Proceedings' },
    { value: 'Contracts', label: 'Contracts' },
    { value: 'Legal Concepts', label: 'Legal Concepts' },
    { value: 'Court Parties', label: 'Court Parties' },
    { value: 'General', label: 'General' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAddTerm = () => {
    if (newTerm.english && newTerm.spanish && newTerm.category) {
      setCustomTerms(prev => [...prev, {
        id: Date.now(),
        ...newTerm
      }]);
      setNewTerm({ english: '', spanish: '', category: '' });
      setShowAddTermModal(false);
    }
  };

  const handleDeleteTerm = (id) => {
    setCustomTerms(prev => prev.filter(term => term.id !== id));
  };

  const handleExportDictionary = () => {
    const dataStr = JSON.stringify(customTerms, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'legal-dictionary.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-8">
      {/* Language Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Language Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Primary Language"
            description="Main language for the interface"
            options={languageOptions}
            value={settings.primaryLanguage}
            onChange={(value) => handleSettingChange('primaryLanguage', value)}
          />
          <Select
            label="Secondary Language"
            description="Target translation language"
            options={languageOptions}
            value={settings.secondaryLanguage}
            onChange={(value) => handleSettingChange('secondaryLanguage', value)}
          />
        </div>
        <div className="mt-6">
          <Checkbox
            label="Enable automatic language detection"
            description="Automatically detect caller's language"
            checked={settings.autoDetectLanguage}
            onChange={(e) => handleSettingChange('autoDetectLanguage', e.target.checked)}
          />
        </div>
      </div>

      {/* Translation Quality */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Translation Quality</h3>
        <div className="space-y-6">
          <div>
            <Input
              label="Accuracy Threshold (%)"
              type="number"
              min="50"
              max="100"
              value={settings.accuracyThreshold}
              onChange={(e) => handleSettingChange('accuracyThreshold', parseInt(e.target.value))}
              description="Minimum confidence level for translations"
            />
            <div className="mt-2 bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Low Quality</span>
                <span>High Quality</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 mt-1">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${settings.accuracyThreshold}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Checkbox
              label="Enable real-time correction"
              description="Automatically correct translation errors during conversation"
              checked={settings.enableRealTimeCorrection}
              onChange={(e) => handleSettingChange('enableRealTimeCorrection', e.target.checked)}
            />
            <Checkbox
              label="Enable contextual translation"
              description="Use conversation context to improve translation accuracy"
              checked={settings.enableContextualTranslation}
              onChange={(e) => handleSettingChange('enableContextualTranslation', e.target.checked)}
            />
            <Checkbox
              label="Enable legal terminology mode"
              description="Prioritize legal terms and phrases in translations"
              checked={settings.enableLegalTerminology}
              onChange={(e) => handleSettingChange('enableLegalTerminology', e.target.checked)}
            />
            <Checkbox
              label="Show confidence scores"
              description="Display translation confidence levels to users"
              checked={settings.confidenceDisplay}
              onChange={(e) => handleSettingChange('confidenceDisplay', e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Custom Dictionary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Custom Legal Dictionary</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage specialized legal terms for accurate translations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={handleExportDictionary}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Upload"
              iconPosition="left"
            >
              Import
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={() => setShowAddTermModal(true)}
            >
              Add Term
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Checkbox
            label="Enable custom dictionary"
            description="Use custom legal terms during translation"
            checked={settings.customDictionaryEnabled}
            onChange={(e) => handleSettingChange('customDictionaryEnabled', e.target.checked)}
          />
        </div>

        <div className="overflow-hidden border border-border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-foreground">English Term</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Spanish Translation</th>
                  <th className="text-left p-3 text-sm font-medium text-foreground">Category</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customTerms.map((term) => (
                  <tr key={term.id} className="border-t border-border">
                    <td className="p-3 text-sm text-foreground font-medium">{term.english}</td>
                    <td className="p-3 text-sm text-foreground">{term.spanish}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {term.category}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Edit"
                          onClick={() => console.log('Edit term:', term.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Trash2"
                          onClick={() => handleDeleteTerm(term.id)}
                          className="text-error hover:text-error"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Term Modal */}
      {showAddTermModal && (
        <div className="fixed inset-0 z-modal bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-floating w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Add Legal Term</h3>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setShowAddTermModal(false)}
              />
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="English Term"
                placeholder="Enter English legal term"
                value={newTerm.english}
                onChange={(e) => setNewTerm(prev => ({ ...prev, english: e.target.value }))}
              />
              <Input
                label="Spanish Translation"
                placeholder="Enter Spanish translation"
                value={newTerm.spanish}
                onChange={(e) => setNewTerm(prev => ({ ...prev, spanish: e.target.value }))}
              />
              <Select
                label="Category"
                placeholder="Select category"
                options={categoryOptions}
                value={newTerm.category}
                onChange={(value) => setNewTerm(prev => ({ ...prev, category: value }))}
              />
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowAddTermModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddTerm}
                disabled={!newTerm.english || !newTerm.spanish || !newTerm.category}
              >
                Add Term
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationSettingsPanel;