import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TranscriptModal = ({ call, isOpen, onClose, onExport }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('both');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 20;

  if (!isOpen || !call) return null;

  const mockTranscript = [
    {
      id: 1,
      timestamp: '14:32:15',
      speaker: 'Caller',
      language: 'spanish',
      originalText: `Hola, buenos días. Necesito hablar con un abogado sobre mi caso de inmigración. Tengo algunas preguntas urgentes sobre mi solicitud de visa.`,
      translatedText: `Hello, good morning. I need to speak with a lawyer about my immigration case. I have some urgent questions about my visa application.`,
      confidence: 96
    },
    {
      id: 2,
      timestamp: '14:32:45',
      speaker: 'Jane Doe',
      language: 'english',
      originalText: `Good morning! I understand you need to speak with an immigration attorney. Let me connect you with Attorney Martinez who specializes in visa applications. May I have your name and case number?`,
      translatedText: `¡Buenos días! Entiendo que necesita hablar con un abogado de inmigración. Permítame conectarlo con el Abogado Martínez que se especializa en solicitudes de visa. ¿Puedo tener su nombre y número de caso?`,
      confidence: 98
    },
    {
      id: 3,
      timestamp: '14:33:20',
      speaker: 'Caller',
      language: 'spanish',
      originalText: `Mi nombre es Carlos Mendoza y mi número de caso es INM-2024-7891. Estoy preocupado porque recibí una carta del USCIS pidiendo documentos adicionales y no entiendo qué necesito enviar.`,
      translatedText: `My name is Carlos Mendoza and my case number is INM-2024-7891. I'm worried because I received a letter from USCIS asking for additional documents and I don't understand what I need to send.`,
      confidence: 94
    },
    {
      id: 4,
      timestamp: '14:34:10',
      speaker: 'Jane Doe',
      language: 'english',
      originalText: `Thank you, Mr. Mendoza. I have your case information here. The USCIS request for additional evidence is common in visa applications. Attorney Martinez will be able to review the specific documents they're requesting and guide you through the response process. He's available for a consultation this afternoon at 3 PM. Would that work for you?`,
      translatedText: `Gracias, Sr. Mendoza. Tengo aquí la información de su caso. La solicitud del USCIS de evidencia adicional es común en las solicitudes de visa. El Abogado Martínez podrá revisar los documentos específicos que están solicitando y guiarlo a través del proceso de respuesta. Está disponible para una consulta esta tarde a las 3 PM. ¿Le funcionaría eso?`,
      confidence: 97
    },
    {
      id: 5,
      timestamp: '14:35:00',
      speaker: 'Caller',
      language: 'spanish',
      originalText: `Sí, perfecto. Las 3 PM me funciona muy bien. ¿Necesito traer algún documento específico para la consulta? También quería preguntar sobre los honorarios del abogado.`,
      translatedText: `Yes, perfect. 3 PM works very well for me. Do I need to bring any specific documents for the consultation? I also wanted to ask about the attorney's fees.`,
      confidence: 95
    },
    {
      id: 6,
      timestamp: '14:35:45',speaker: 'Jane Doe',language: 'english',
      originalText: `Excellent! Please bring the USCIS letter you received, your passport, any previous immigration documents, and a copy of your original visa application. Regarding fees, Attorney Martinez offers a free initial consultation, and if you decide to proceed, he'll discuss payment options including payment plans. I'm scheduling you for 3 PM today. You'll receive a confirmation email with our office address and parking information.`,
      translatedText: `¡Excelente! Por favor traiga la carta del USCIS que recibió, su pasaporte, cualquier documento de inmigración anterior, y una copia de su solicitud de visa original. Con respecto a los honorarios, el Abogado Martínez ofrece una consulta inicial gratuita, y si decide proceder, discutirá opciones de pago incluyendo planes de pago. Lo estoy programando para las 3 PM de hoy. Recibirá un correo electrónico de confirmación con la dirección de nuestra oficina e información de estacionamiento.`,
      confidence: 99
    }
  ];

  const filteredTranscript = mockTranscript.filter(message => {
    const matchesSearch = searchTerm === '' || 
      message.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.translatedText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = selectedLanguage === 'both' || 
      (selectedLanguage === 'original' && message.speaker === 'Caller') ||
      (selectedLanguage === 'translated' && message.speaker !== 'Caller');
    
    return matchesSearch && matchesLanguage;
  });

  const totalPages = Math.ceil(filteredTranscript.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const paginatedTranscript = filteredTranscript.slice(startIndex, startIndex + messagesPerPage);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 95) return 'text-success';
    if (confidence >= 85) return 'text-warning';
    return 'text-error';
  };

  const handleExport = (format) => {
    onExport(call, format);
  };

  return (
    <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-floating w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Call Transcript</h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                <span>{call.callerName}</span>
                <span>•</span>
                <span>{call.date} at {call.time}</span>
                <span>•</span>
                <span>Duration: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>
                <span>•</span>
                <span className={getConfidenceColor(call.accuracy)}>
                  {call.accuracy}% accuracy
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
            <Button
              variant="ghost"
              iconName="X"
              iconSize={20}
              onClick={onClose}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">View:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1 text-sm border border-border rounded bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="both">Both Languages</option>
                <option value="original">Original Only</option>
                <option value="translated">Translation Only</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Search" size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 text-sm border border-border rounded bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {filteredTranscript.length} messages
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                iconName="ChevronLeft"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              />
              <span className="text-sm text-foreground px-2">
                {currentPage} of {totalPages}
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
        </div>

        {/* Transcript Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {paginatedTranscript.map((message) => (
              <div key={message.id} className="border border-border rounded-lg p-4 bg-surface">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.speaker === 'Caller' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <Icon 
                        name={message.speaker === 'Caller' ? 'User' : 'Headphones'} 
                        size={16} 
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {message.speaker}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getConfidenceColor(message.confidence)}`}>
                      {message.confidence}% confidence
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Copy"
                        iconSize={12}
                        onClick={() => navigator.clipboard.writeText(message.originalText)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Volume2"
                        iconSize={12}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(selectedLanguage === 'both' || selectedLanguage === 'original') && (
                    <div className="bg-muted/30 rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="Globe" size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {message.language === 'spanish' ? 'Spanish (Original)' : 'English (Original)'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {message.originalText}
                      </p>
                    </div>
                  )}

                  {(selectedLanguage === 'both' || selectedLanguage === 'translated') && (
                    <div className="bg-accent/10 rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="Languages" size={14} className="text-accent" />
                        <span className="text-xs font-medium text-accent uppercase">
                          {message.language === 'spanish' ? 'English (Translation)' : 'Spanish (Translation)'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {message.translatedText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={14} />
              <span>Call Duration: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="MessageSquare" size={14} />
              <span>{mockTranscript.length} total messages</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Globe" size={14} />
              <span>Languages: {call.languages.join(', ')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="FileText"
              iconPosition="left"
              onClick={() => handleExport('txt')}
            >
              Export TXT
            </Button>
            <Button
              variant="outline"
              iconName="Table"
              iconPosition="left"
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptModal;