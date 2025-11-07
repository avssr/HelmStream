import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Mail, MessageCircle, Phone, Satellite, CheckCircle2, Radio, MailOpen } from 'lucide-react';
import { messages } from './mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

type ChannelType = 'email' | 'whatsapp' | 'radio' | 'ais' | null;

interface MessagesPanelProps {
  channel?: ChannelType;
}

export function MessagesPanel({ channel = null }: MessagesPanelProps) {
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null);

  // Filter messages by channel
  const filteredMessages = channel 
    ? messages.filter(msg => msg.channel === channel)
    : messages;

  const handleMessageClick = (message: typeof messages[0]) => {
    setSelectedMessage(message);
    setReadMessages(prev => new Set(prev).add(message.id));
  };

  const unreadCount = filteredMessages.filter(msg => !readMessages.has(msg.id)).length;

  // Get channel info
  const channelInfo = {
    email: { 
      icon: Mail, 
      label: 'Email Communications', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Formal vessel and port authority communications'
    },
    whatsapp: { 
      icon: MessageCircle, 
      label: 'WhatsApp Messages', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Quick coordination with pilots, tugs, and operators'
    },
    radio: { 
      icon: Radio, 
      label: 'VHF Radio Traffic', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Official maritime radio communications'
    },
    ais: { 
      icon: Satellite, 
      label: 'AIS Data Feed', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Automatic vessel tracking and position data'
    }
  };

  const currentChannel = channel ? channelInfo[channel] : null;
  const Icon = currentChannel?.icon || MessageCircle;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${currentChannel?.color || 'text-blue-600'}`} />
            <div>
              <h3>{currentChannel?.label || 'All Communications'}</h3>
              {currentChannel && (
                <p className="text-xs text-gray-500 mt-0.5">{currentChannel.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount} New
              </Badge>
            )}
            <Badge variant="secondary">
              {filteredMessages.length} Total
            </Badge>
          </div>
        </div>

        <ScrollArea className="h-[500px]">
        <div className="space-y-3 pr-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No messages in this channel</p>
            </div>
          ) : (
            filteredMessages.map((message) => {
              const MessageIcon = message.channel === 'email' ? Mail : 
                                 message.channel === 'whatsapp' ? MessageCircle :
                                 message.channel === 'radio' ? Radio :
                                 Satellite;

              const priorityColors = {
                high: 'border-l-red-500',
                medium: 'border-l-orange-500',
                low: 'border-l-blue-500'
              };

              const isRead = readMessages.has(message.id);

              // Special rendering for AIS messages
              if (message.channel === 'ais') {
                return (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg border-l-4 border border-gray-200 ${priorityColors[message.priority]} hover:shadow-md transition-all cursor-pointer font-mono ${isRead ? 'opacity-60' : 'shadow-sm'}`}
                  >
                    <div className="flex items-start gap-3">
                      <Satellite className={`h-4 w-4 ${isRead ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 mt-1`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>{message.subject}</p>
                            {!isRead && (
                              <span className="h-2 w-2 bg-orange-500 rounded-full"></span>
                            )}
                          </div>
                          {message.processed && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs mb-2 whitespace-pre-line leading-relaxed line-clamp-2 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-orange-600">Live Data</span>
                          <span className="text-xs text-gray-400">{message.timestamp} UTC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Special rendering for WhatsApp messages
              if (message.channel === 'whatsapp') {
                return (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-3 bg-gradient-to-r from-green-50 to-white rounded-lg border-l-4 border border-gray-200 ${priorityColors[message.priority]} hover:shadow-md transition-all cursor-pointer ${isRead ? 'opacity-60' : 'shadow-sm'}`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageCircle className={`h-4 w-4 ${isRead ? 'text-green-400' : 'text-green-600'} flex-shrink-0 mt-1`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>{message.from}</p>
                            {!isRead && (
                              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                            )}
                          </div>
                          {message.processed && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-sm line-clamp-2 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {message.priority}
                          </Badge>
                          <span className="text-xs text-gray-400">{message.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Special rendering for Radio messages
              if (message.channel === 'radio') {
                return (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg border-l-4 border border-gray-200 ${priorityColors[message.priority]} hover:shadow-md transition-all cursor-pointer ${isRead ? 'opacity-60' : 'shadow-sm'}`}
                  >
                    <div className="flex items-start gap-3">
                      <Radio className={`h-4 w-4 ${isRead ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0 mt-1`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs ${isRead ? 'text-purple-500' : 'text-purple-700'}`}>{message.from}</p>
                            {!isRead && (
                              <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                            )}
                          </div>
                          {message.processed && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-sm mb-2 italic line-clamp-2 ${isRead ? 'text-gray-500' : 'text-gray-900'}`}>"{message.content}"</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {message.priority}
                          </Badge>
                          <span className="text-xs text-gray-400">{message.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Default rendering for Email messages
              return (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`p-3 bg-white rounded-lg border-l-4 border border-gray-200 ${priorityColors[message.priority]} hover:shadow-md transition-all cursor-pointer ${isRead ? 'opacity-60' : 'shadow-sm'}`}
                >
                  <div className="flex items-start gap-3">
                    {isRead ? (
                      <MailOpen className="h-4 w-4 text-blue-400 flex-shrink-0 mt-1" />
                    ) : (
                      <Mail className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>{message.subject}</p>
                          {!isRead && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        {message.processed && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs mb-2 ${isRead ? 'text-gray-400' : 'text-gray-500'}`}>From: {message.from}</p>
                      <p className={`text-sm line-clamp-2 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {message.priority}
                        </Badge>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>

    {/* Message Detail Dialog */}
    <Dialog open={selectedMessage !== null} onOpenChange={(open) => !open && setSelectedMessage(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {selectedMessage && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMessage.channel === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                {selectedMessage.channel === 'whatsapp' && <MessageCircle className="h-5 w-5 text-green-600" />}
                {selectedMessage.channel === 'radio' && <Radio className="h-5 w-5 text-purple-600" />}
                {selectedMessage.channel === 'ais' && <Satellite className="h-5 w-5 text-orange-600" />}
                {selectedMessage.subject}
              </DialogTitle>
              <DialogDescription>
                From: {selectedMessage.from} • {selectedMessage.timestamp}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={selectedMessage.priority === 'high' ? 'destructive' : 'outline'}>
                {selectedMessage.priority}
              </Badge>
              {selectedMessage.processed && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  AI Processed
                </Badge>
              )}
            </div>

            <div className="mt-6">
              <div className={`p-4 rounded-lg ${
                selectedMessage.channel === 'email' ? 'bg-blue-50' :
                selectedMessage.channel === 'whatsapp' ? 'bg-green-50' :
                selectedMessage.channel === 'radio' ? 'bg-purple-50' :
                'bg-orange-50 font-mono'
              }`}>
                <p className={`whitespace-pre-line leading-relaxed ${
                  selectedMessage.channel === 'radio' ? 'italic' : ''
                }`}>
                  {selectedMessage.channel === 'radio' ? `"${selectedMessage.content}"` : selectedMessage.content}
                </p>
              </div>

              {selectedMessage.processed && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-2">
                        This message has been processed by the AI engine and relevant workflow tickets have been generated.
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedMessage.channel === 'email' && 'Automated responses and notifications sent to affected parties.'}
                        {selectedMessage.channel === 'whatsapp' && 'Quick coordination messages acknowledged and logged.'}
                        {selectedMessage.channel === 'radio' && 'Radio transmission logged and operations updated accordingly.'}
                        {selectedMessage.channel === 'ais' && 'Position data integrated into real-time tracking system.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Generate Response
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Forward
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Archive
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
