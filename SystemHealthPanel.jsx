import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SearchFilters = ({ 
  searchTerm, 
  onSearchChange, 
  dateRange, 
  onDateRangeChange,
  selectedStaff,
  onStaffChange,
  selectedLanguage,
  onLanguageChange,
  accuracyFilter,
  onAccuracyFilterChange,
  onClearFilters,
  onAdvancedSearch 
}) => {
  const staffOptions = [
    { value: '', label: 'All Staff Members' },
    { value: 'jane-doe', label: 'Jane Doe' },
    { value: 'mike-johnson', label: 'Mike Johnson' },
    { value: 'sarah-wilson', label: 'Sarah Wilson' },
    { value: 'david-brown', label: 'David Brown' }
  ];

  const languageOptions = [
    { value: '', label: 'All Languages' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'english', label: 'English' },
    { value: 'french', label: 'French' },
    { value: 'portuguese', label: 'Portuguese' }
  ];

  const accuracyOptions = [
    { value: '', label: 'All Accuracy Levels' },
    { value: '95-100', label: 'Excellent (95-100%)' },
    { value: '85-94', label: 'Good (85-94%)' },
    { value: '70-84', label: 'Fair (70-84%)' },
    { value: '0-69', label: 'Poor (Below 70%)' }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
      {/* Primary Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by caller name, phone number, case number, or transcript content..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          variant="primary"
          iconName="Search"
          iconPosition="left"
          onClick={onAdvancedSearch}
        >
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              placeholder="End date"
            />
          </div>
        </div>

        <div>
          <Select
            label="Staff Member"
            options={staffOptions}
            value={selectedStaff}
            onChange={onStaffChange}
            placeholder="Select staff member"
          />
        </div>

        <div>
          <Select
            label="Language"
            options={languageOptions}
            value={selectedLanguage}
            onChange={onLanguageChange}
            placeholder="Select language"
          />
        </div>

        <div>
          <Select
            label="Translation Accuracy"
            options={accuracyOptions}
            value={accuracyFilter}
            onChange={onAccuracyFilterChange}
            placeholder="Select accuracy range"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
          <div className="text-sm text-muted-foreground">
            Active filters: {[
              searchTerm && 'Search term',
              dateRange.start && 'Date range',
              selectedStaff && 'Staff member',
              selectedLanguage && 'Language',
              accuracyFilter && 'Accuracy'
            ].filter(Boolean).length}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            iconName="Download"
            iconPosition="left"
            size="sm"
          >
            Export Filtered Results
          </Button>
          <Button
            variant="ghost"
            iconName="Settings"
            iconPosition="left"
            size="sm"
          >
            Save Filter Preset
          </Button>
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-professional">
          <Icon name="Clock" size={12} className="mr-1" />
          Today's Calls
        </button>
        <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-professional">
          <Icon name="TrendingUp" size={12} className="mr-1" />
          High Accuracy (&gt;95%)
        </button>
        <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-professional">
          <Icon name="AlertTriangle" size={12} className="mr-1" />
          Needs Review
        </button>
        <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary hover:bg-secondary/20 transition-professional">
          <Icon name="Globe" size={12} className="mr-1" />
          Spanish Calls
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;