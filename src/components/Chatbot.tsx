import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MessageCircle, X, Send, Sparkles, AlertTriangle, ExternalLink, Loader2, Mail } from 'lucide-react';
import { chatHistory, alerts } from './mock-data';
import { queryLLM, type EmailSource } from '../services/llmApi';

interface ChatbotProps {
  onNavigate?: (view: string, data?: any) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  showIncidentButton?: boolean;
  dateFilter?: {
    startDate: string;
    endDate: string;
  };
  sources?: EmailSource[];
  isLoading?: boolean;
  isError?: boolean;
}

export function Chatbot({ onNavigate }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory as ChatMessage[]);
  const [inputValue, setInputValue] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const userMessageObj = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message and loading placeholder
    setMessages(prev => [...prev, userMessageObj, {
      role: 'assistant' as const,
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true
    }]);

    setInputValue('');

    try {
      // Call the LLM API
      const response = await queryLLM({ query: userMessage });

      // Format the answer
      let formattedAnswer = response.answer;

      // Check if query is about incidents for the button
      const incidentKeywords = ['incident', 'incidents', 'alert', 'alerts', 'problem', 'problems', 'issue', 'issues', 'critical'];
      const isIncidentQuery = incidentKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

      // Update the loading message with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant' as const,
          content: formattedAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: response.sources,
          showIncidentButton: isIncidentQuery,
          dateFilter: isIncidentQuery ? {
            startDate: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          } : undefined,
          isLoading: false
        };
        return newMessages;
      });
    } catch (error) {
      console.error('❌ Chatbot Error:', error);

      // Get more detailed error message
      let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';

      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
        // Show more specific error in development
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Could not connect to the API. Please check your internet connection or CORS settings.';
        } else if (error.message.includes('API request failed')) {
          errorMessage = `API Error: ${error.message}. Please check the console for details.`;
        }
      }

      // Show error message
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant' as const,
          content: errorMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLoading: false,
          isError: true
        };
        return newMessages;
      });
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] md:text-xs">
            1
          </span>
        )}
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[500px] md:h-[600px] shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-white text-sm md:text-base truncate">HelmStream AI Assistant</h3>
            <p className="text-[10px] md:text-xs text-blue-100 hidden sm:block">Ask me anything about port operations</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-700 h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0"
        >
          <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4" ref={scrollRef}>
        <div className="space-y-3 md:space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 md:p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' && !message.isLoading && (
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                    <Sparkles className="h-3 w-3 text-purple-600 flex-shrink-0" />
                    <span className="text-[10px] md:text-xs text-purple-600">AI Analysis</span>
                  </div>
                )}

                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-xs md:text-sm text-gray-600">Analyzing...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs md:text-sm whitespace-pre-line">{message.content}</p>

                    {/* Display sources if available */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-[10px] md:text-xs font-medium text-gray-600">
                            Sources ({message.sources.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {message.sources.slice(0, 3).map((source, idx) => (
                            <div key={idx} className="text-[10px] md:text-xs bg-white rounded p-2 border border-gray-200">
                              <p className="font-medium text-gray-900 mb-0.5">{source.subject}</p>
                              <p className="text-gray-600">
                                {source.sender} • {source.date}
                              </p>
                              <Badge variant="secondary" className="mt-1 text-[9px] h-4">
                                {source.event_category}
                              </Badge>
                            </div>
                          ))}
                          {message.sources.length > 3 && (
                            <p className="text-[10px] text-gray-500 italic">
                              + {message.sources.length - 3} more sources
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {message.role === 'assistant' && message.showIncidentButton && onNavigate && (
                      <Button
                        onClick={() => {
                          onNavigate('alerts', { dateFilter: message.dateFilter });
                          setIsOpen(false);
                        }}
                        size="sm"
                        className="mt-2 w-full text-xs flex items-center gap-2"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        View All Incidents
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                  </>
                )}

                {!message.isLoading && (
                  <p className={`text-[10px] md:text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : message.isError ? 'text-red-400' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 md:px-4 pb-2 flex gap-1.5 md:gap-2 overflow-x-auto">
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-gray-100 whitespace-nowrap text-[10px] md:text-xs"
          onClick={() => setInputValue("How many incidents in the last ten days?")}
        >
          🚨 Recent Incidents
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-gray-100 whitespace-nowrap text-[10px] md:text-xs"
          onClick={() => setInputValue("What's the impact of the schedule change?")}
        >
          💰 Cost Impact
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-gray-100 whitespace-nowrap text-[10px] md:text-xs"
          onClick={() => setInputValue("Show tomorrow's schedule")}
        >
          📅 Tomorrow's Schedule
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-gray-100 whitespace-nowrap text-[10px] md:text-xs"
          onClick={() => setInputValue("Status of MSC Horizon")}
        >
          🚢 Ship Status
        </Badge>
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about schedules, impacts, ships..."
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 text-xs md:text-sm"
          />
          <Button onClick={handleSend} size="sm" className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10 p-0">
            <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
