import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import SearchFilters from './components/SearchFilters';
import CallHistoryTable from './components/CallHistoryTable';
import TranscriptModal from './components/TranscriptModal';
import StatsSidebar from './components/StatsSidebar';
import BulkActions from './components/BulkActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const CallHistoryTranscripts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [accuracyFilter, setAccuracyFilter] = useState('');
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [callsPerPage] = useState(20);

  // Mock call history data
  const mockCalls = [
    {
      id: 1,
      date: '07/25/2025',
      time: '14:32',
      callerName: 'Carlos Mendoza',
      phoneNumber: '+1 (555) 123-4567',
      caseNumber: 'INM-2024-7891',
      duration: 420,
      accuracy: 96,
      staffMember: 'Jane Doe',
      languages: ['Spanish', 'English'],
      messageCount: 12,
      summary: `Client called regarding USCIS request for additional evidence on visa application. Provided guidance on required documents and scheduled consultation with Attorney Martinez for 3 PM today. Client expressed concerns about document requirements and attorney fees, which were addressed professionally.`,
      transcriptPreview: [
        { speaker: 'Caller', text: 'Hola, necesito hablar con un abogado sobre mi caso de inmigración...' },
        { speaker: 'Jane Doe', text: 'Good morning! I understand you need to speak with an immigration attorney...' },
        { speaker: 'Caller', text: 'Mi número de caso es INM-2024-7891. Estoy preocupado porque...' }
      ]
    },
    {
      id: 2,
      date: '07/25/2025',
      time: '11:15',
      callerName: 'Maria Rodriguez',
      phoneNumber: '+1 (555) 234-5678',
      caseNumber: 'FAM-2024-3456',
      duration: 285,
      accuracy: 94,
      staffMember: 'Mike Johnson',
      languages: ['Spanish', 'English'],
      messageCount: 8,
      summary: `Family law consultation regarding divorce proceedings. Client needed clarification on property division and child custody arrangements. Scheduled appointment with Attorney Williams for next Tuesday at 10 AM.`,
      transcriptPreview: [
        { speaker: 'Caller', text: 'Buenos días, necesito ayuda con mi divorcio...' },
        { speaker: 'Mike Johnson', text: 'Good morning, I can help you with family law matters...' },
        { speaker: 'Caller', text: 'Tengo preguntas sobre la custodia de mis hijos...' }
      ]
    },
    {
      id: 3,
      date: '07/25/2025',
      time: '09:45',
      callerName: 'Juan Martinez',
      phoneNumber: '+1 (555) 345-6789',
      caseNumber: 'PER-2024-9876',
      duration: 195,
      accuracy: 98,
      staffMember: 'Sarah Wilson',
      languages: ['Spanish', 'English'],
      messageCount: 6,
      summary: `Personal injury case follow-up. Client provided updates on medical treatment and requested status update on insurance negotiations. Confirmed next appointment and provided case timeline.`,
      transcriptPreview: [
        { speaker: 'Caller', text: 'Hola, quiero saber sobre mi caso de lesiones personales...' },
        { speaker: 'Sarah Wilson', text: 'Hello Mr. Martinez, I have your case information here...' },
        { speaker: 'Caller', text: 'Mi médico dice que necesito más terapia física...' }
      ]
    },
    {
      id: 4,
      date: '07/24/2025',
      time: '16:20',
      callerName: 'Ana Gonzalez',
      phoneNumber: '+1 (555) 456-7890',
      caseNumber: 'BUS-2024-5432',
      duration: 340,
      accuracy: 92,
      staffMember: 'David Brown',
      languages: ['Spanish', 'English'],
      messageCount: 10,
      summary: `Business law consultation for new restaurant opening. Discussed licensing requirements, employment law compliance, and contract reviews. Scheduled comprehensive consultation for permit assistance.`,
      transcriptPreview: [
        { speaker: 'Caller', text: 'Necesito ayuda legal para abrir mi restaurante...' },
        { speaker: 'David Brown', text: 'I can help you with business formation and licensing...' },
        { speaker: 'Caller', text: '¿Qué permisos necesito para servir alcohol?' }
      ]
    },
    {
      id: 5,
      date: '07/24/2025',
      time: '13:55',
      callerName: 'Roberto Silva',
      phoneNumber: '+1 (555) 567-8901',
      caseNumber: 'EST-2024-1234',
      duration: 480,
      accuracy: 89,
      staffMember: 'Jane Doe',
      languages: ['Spanish', 'English'],
      messageCount: 15,
      summary: `Estate planning consultation for elderly client. Discussed will preparation, power of attorney documents, and healthcare directives. Client requested bilingual documentation and scheduled in-person meeting.`,
      transcriptPreview: [
        { speaker: 'Caller', text: 'Quiero hacer mi testamento y otros documentos importantes...' },
        { speaker: 'Jane Doe', text: 'I can help you with comprehensive estate planning...' },
        { speaker: 'Caller', text: 'Necesito que los documentos estén en español también...' }
      ]
    }
  ];

  // Mock statistics
  const mockStats = {
    totalCalls: 247,
    averageAccuracy: 94.2,
    totalDuration: '18h 32m',
    activeStaff: 4
  };

  // Filter and sort calls
  const filteredCalls = mockCalls.filter(call => {
    const matchesSearch = searchTerm === '' || 
      call.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phoneNumber.includes(searchTerm) ||
      call.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateRange = (!dateRange.start || call.date >= dateRange.start) &&
      (!dateRange.end || call.date <= dateRange.end);

    const matchesStaff = !selectedStaff || call.staffMember.toLowerCase().replace(' ', '-') === selectedStaff;

    const matchesLanguage = !selectedLanguage || 
      call.languages.some(lang => lang.toLowerCase() === selectedLanguage);

    const matchesAccuracy = !accuracyFilter || 
      (accuracyFilter === '95-100' && call.accuracy >= 95) ||
      (accuracyFilter === '85-94' && call.accuracy >= 85 && call.accuracy < 95) ||
      (accuracyFilter === '70-84' && call.accuracy >= 70 && call.accuracy < 85) ||
      (accuracyFilter === '0-69' && call.accuracy < 70);

    return matchesSearch && matchesDateRange && matchesStaff && matchesLanguage && matchesAccuracy;
  });

  const sortedCalls = [...filteredCalls].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'date') {
      aValue = new Date(a.date + ' ' + a.time);
      bValue = new Date(b.date + ' ' + b.time);
    } else if (sortConfig.key === 'caller') {
      aValue = a.callerName;
      bValue = b.callerName;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCalls.length / callsPerPage);
  const startIndex = (currentPage - 1) * callsPerPage;
  const paginatedCalls = sortedCalls.slice(startIndex, startIndex + callsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectCall = (callId) => {
    setSelectedCalls(prev => 
      prev.includes(callId) 
        ? prev.filter(id => id !== callId)
        : [...prev, callId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCalls(prev => 
      prev.length === paginatedCalls.length 
        ? [] 
        : paginatedCalls.map(call => call.id)
    );
  };

  const handleExpandRow = (callId) => {
    setExpandedRows(prev => 
      prev.includes(callId)
        ? prev.filter(id => id !== callId)
        : [...prev, callId]
    );
  };

  const handleViewTranscript = (call) => {
    setSelectedCall(call);
    setShowTranscriptModal(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setSelectedStaff('');
    setSelectedLanguage('');
    setAccuracyFilter('');
  };

  const handleAdvancedSearch = () => {
    // Advanced search logic would go here
    console.log('Advanced search triggered');
  };

  const handleBulkExport = (callIds, format) => {
    console.log(`Exporting ${callIds.length} calls in ${format} format`);
    // Export logic would go here
  };

  const handleBulkArchive = (callIds) => {
    console.log(`Archiving ${callIds.length} calls`);
    setSelectedCalls([]);
  };

  const handleBulkDelete = (callIds) => {
    console.log(`Deleting ${callIds.length} calls`);
    setSelectedCalls([]);
  };

  const handleExportTranscript = (call, format) => {
    console.log(`Exporting transcript for call ${call.id} in ${format} format`);
  };

  return (
    <>
      <Helmet>
        <title>Call History & Transcripts - VoiceLink Translator</title>
        <meta name="description" content="Access comprehensive call history with search, filtering, and export capabilities for legal documentation needs." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Call History & Transcripts</h1>
                <p className="text-muted-foreground mt-1">
                  Access and manage all call records with comprehensive search and export capabilities
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="RefreshCw"
                  iconPosition="left"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export All
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <SearchFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedStaff={selectedStaff}
              onStaffChange={setSelectedStaff}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              accuracyFilter={accuracyFilter}
              onAccuracyFilterChange={setAccuracyFilter}
              onClearFilters={handleClearFilters}
              onAdvancedSearch={handleAdvancedSearch}
            />

            {/* Bulk Actions */}
            <BulkActions
              selectedCalls={selectedCalls}
              onClearSelection={() => setSelectedCalls([])}
              onBulkExport={handleBulkExport}
              onBulkArchive={handleBulkArchive}
              onBulkDelete={handleBulkDelete}
            />

            {/* Results Summary */}
            <div className="flex items-center justify-between bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Search" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + callsPerPage, sortedCalls.length)} of {sortedCalls.length} calls
                  </span>
                </div>
                {(searchTerm || dateRange.start || selectedStaff || selectedLanguage || accuracyFilter) && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Filter" size={16} className="text-primary" />
                    <span className="text-sm text-primary">Filters applied</span>
                  </div>
                )}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ChevronLeft"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                />
                <span className="text-sm text-foreground px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ChevronRight"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                />
              </div>
            </div>

            {/* Call History Table */}
            <CallHistoryTable
              calls={paginatedCalls}
              selectedCalls={selectedCalls}
              onSelectCall={handleSelectCall}
              onSelectAll={handleSelectAll}
              onViewTranscript={handleViewTranscript}
              onExpandRow={handleExpandRow}
              expandedRows={expandedRows}
              sortConfig={sortConfig}
              onSort={handleSort}
            />

            {/* Empty State */}
            {sortedCalls.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Search" size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No calls found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  iconName="RotateCcw"
                  iconPosition="left"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Statistics Sidebar */}
          <StatsSidebar stats={mockStats} />
        </div>

        {/* Transcript Modal */}
        <TranscriptModal
          call={selectedCall}
          isOpen={showTranscriptModal}
          onClose={() => {
            setShowTranscriptModal(false);
            setSelectedCall(null);
          }}
          onExport={handleExportTranscript}
        />
      </div>
    </>
  );
};

export default CallHistoryTranscripts;