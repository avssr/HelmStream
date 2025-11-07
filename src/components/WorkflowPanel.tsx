import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Mail, CheckCircle2, Clock, Send, Bot } from 'lucide-react';
import { workflowTickets } from './mock-data';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface WorkflowPanelProps {
  onNavigateToAIWorkflows?: () => void;
}

export function WorkflowPanel({ onNavigateToAIWorkflows }: WorkflowPanelProps) {
  const [selectedTicket, setSelectedTicket] = useState<typeof workflowTickets[0] | null>(null);
  const [readTickets, setReadTickets] = useState<Set<string>>(new Set());

  const handleTicketClick = (ticket: typeof workflowTickets[0]) => {
    setSelectedTicket(ticket);
    setReadTickets(prev => new Set(prev).add(ticket.id));
  };

  const unreadCount = workflowTickets.filter(ticket => !readTickets.has(ticket.id)).length;
  const pendingCount = workflowTickets.filter(t => t.status === 'pending').length;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-green-600" />
            <h3>Automated Workflow Tickets</h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount} New
              </Badge>
            )}
            <Badge variant="secondary">
              {pendingCount} Pending
            </Badge>
            {onNavigateToAIWorkflows && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToAIWorkflows}
                className="gap-2 bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
              >
                <Bot className="h-4 w-4" />
                Edit/View Workflows
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
            {workflowTickets.map((ticket) => {
              const isRead = readTickets.has(ticket.id);
              const statusColors = {
                pending: isRead ? 'bg-yellow-50/60 border-yellow-200/60 text-yellow-700' : 'bg-yellow-50 border-yellow-200 text-yellow-800',
                sent: isRead ? 'bg-green-50/60 border-green-200/60 text-green-700' : 'bg-green-50 border-green-200 text-green-800',
                completed: isRead ? 'bg-gray-50/60 border-gray-200/60 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-800'
              };

              const StatusIcon = ticket.status === 'sent' ? CheckCircle2 : ticket.status === 'pending' ? Clock : Send;

              return (
                <div
                  key={ticket.id}
                  className={`p-3 rounded-lg border ${statusColors[ticket.status]} cursor-pointer hover:shadow-md transition-all ${isRead ? 'opacity-70' : 'shadow-sm'}`}
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="flex items-start gap-3">
                    <Mail className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isRead ? 'opacity-60' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{ticket.subject}</p>
                          {!isRead && (
                            <span className={`h-2 w-2 rounded-full ${
                              ticket.status === 'pending' ? 'bg-yellow-500' : 
                              ticket.status === 'sent' ? 'bg-green-500' : 
                              'bg-gray-500'
                            }`}></span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className={`text-sm mb-2 ${isRead ? 'opacity-70' : 'opacity-80'}`}>To: {ticket.recipient}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <StatusIcon className="h-3 w-3" />
                          <span className="capitalize">{ticket.status}</span>
                          <span>• {ticket.timestamp}</span>
                        </div>
                        <span className={`text-xs ${isRead ? 'opacity-50' : 'opacity-70'}`}>by {ticket.triggeredBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              {selectedTicket?.type.toUpperCase()} to {selectedTicket?.recipient}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={selectedTicket?.priority === 'high' ? 'destructive' : 'secondary'}>
                {selectedTicket?.priority} Priority
              </Badge>
              <Badge variant={selectedTicket?.status === 'sent' ? 'default' : 'outline'}>
                {selectedTicket?.status}
              </Badge>
              <span className="text-sm text-gray-500">{selectedTicket?.timestamp}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm mb-2">Message Content:</p>
              <p className="text-sm text-gray-700">{selectedTicket?.content}</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Triggered by:</span> {selectedTicket?.triggeredBy}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
              {selectedTicket?.status === 'pending' && (
                <Button>Send Now</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
