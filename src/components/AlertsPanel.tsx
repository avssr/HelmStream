import { Alert } from './ui/alert';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { AlertTriangle, AlertCircle, Info, Sparkles, ExternalLink, XIcon, Filter, X } from 'lucide-react';
import { alerts } from './mock-data';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogPortal } from './ui/dialog';

interface AlertsPanelProps {
  filterStartDate?: string;
  filterEndDate?: string;
}

export function AlertsPanel({ filterStartDate, filterEndDate }: AlertsPanelProps = {}) {
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState(filterStartDate || '');
  const [endDate, setEndDate] = useState(filterEndDate || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (filterStartDate || filterEndDate) {
      setStartDate(filterStartDate || '');
      setEndDate(filterEndDate || '');
      setShowFilters(true);
    }
  }, [filterStartDate, filterEndDate]);

  const handleAlertClick = (alert: typeof alerts[0]) => {
    setSelectedAlert(alert);
    setReadAlerts(prev => new Set(prev).add(alert.id));
  };

  const parseAlertDate = (timestamp: string): Date => {
    // Handle formats like "Nov 7, 13:47" or "Oct 30, 14:30"
    const match = timestamp.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)(?:,\s+(\d+:\d+))?/);
    if (match) {
      const months: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const month = months[match[1]];
      const day = parseInt(match[2]);
      const year = 2024; // Assuming 2024
      return new Date(year, month, day);
    }
    return new Date(); // fallback to today
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!startDate && !endDate) return true;
    
    const alertDate = parseAlertDate(alert.timestamp);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return alertDate >= start && alertDate <= end;
    } else if (start) {
      return alertDate >= start;
    } else if (end) {
      return alertDate <= end;
    }
    return true;
  });

  const unreadCount = filteredAlerts.filter(alert => !readAlerts.has(alert.id)).length;

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3>AI-Powered Insights</h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount} New
              </Badge>
            )}
            <Badge variant="secondary">
              {filteredAlerts.length} {filteredAlerts.length !== alerts.length && `of ${alerts.length}`} Total
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm">Filter by Date Range</p>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-6 text-xs gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
            {(filterStartDate || filterEndDate) && (startDate === filterStartDate && endDate === filterEndDate) && (
              <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-800">Filter applied from AI chatbot</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm"
                  max="2024-11-07"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm"
                  max="2024-11-07"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <p className="text-xs text-gray-600 mt-2">
                Showing incidents from {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'start'} to {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'end'}
              </p>
            )}
          </div>
        )}

        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No incidents found for the selected date range.</p>
              <Button
                variant="link"
                onClick={handleClearFilters}
                className="mt-2"
              >
                Clear filters to see all incidents
              </Button>
            </div>
          ) : (
          filteredAlerts.map((alert) => {
            const Icon = alert.type === 'critical' ? AlertTriangle : alert.type === 'warning' ? AlertCircle : Info;
            const isRead = readAlerts.has(alert.id);
            const colorClasses = {
              critical: isRead ? 'bg-red-50/60 border-red-200/60 text-red-700' : 'bg-red-50 border-red-200 text-red-800',
              warning: isRead ? 'bg-orange-50/60 border-orange-200/60 text-orange-700' : 'bg-orange-50 border-orange-200 text-orange-800',
              info: isRead ? 'bg-blue-50/60 border-blue-200/60 text-blue-700' : 'bg-blue-50 border-blue-200 text-blue-800'
            };

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${colorClasses[alert.type]} cursor-pointer hover:shadow-md transition-all ${isRead ? 'opacity-70' : 'shadow-sm'}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isRead ? 'opacity-60' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{alert.title}</p>
                        {!isRead && (
                          <span className={`h-2 w-2 rounded-full ${
                            alert.type === 'critical' ? 'bg-red-500' : 
                            alert.type === 'warning' ? 'bg-orange-500' : 
                            'bg-blue-500'
                          }`}></span>
                        )}
                      </div>
                      <span className="text-xs whitespace-nowrap">{alert.timestamp}</span>
                    </div>
                    <p className={`text-sm mb-2 ${isRead ? 'opacity-70' : 'opacity-90'}`}>{alert.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {alert.relatedEntities.map((entity) => (
                        <Badge key={entity} variant="outline" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="h-3 w-3" />
                      <span className="line-clamp-1">{alert.aiInsight.substring(0, 60)}...</span>
                      <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
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

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)} modal>
        <DialogPortal>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setSelectedAlert(null)} />
          <div className="fixed top-[50%] left-[50%] z-[60] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-white p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-lg leading-none font-semibold flex items-center gap-2">
                {selectedAlert?.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                {selectedAlert?.type === 'warning' && <AlertCircle className="h-5 w-5 text-orange-600" />}
                {selectedAlert?.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                {selectedAlert?.title}
              </h2>
              <p className="text-sm text-gray-600">{selectedAlert?.description}</p>
            </div>

            <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">Related Entities:</p>
              <div className="flex flex-wrap gap-2">
                {selectedAlert?.relatedEntities.map((entity) => (
                  <Badge key={entity} variant="secondary">
                    {entity}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-purple-900">AI Analysis</p>
              </div>
              <p className="text-sm text-purple-800">{selectedAlert?.aiInsight}</p>
            </div>

            {selectedAlert?.suggestedAction && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm mb-2">Suggested Action:</p>
                <p className="text-green-800">{selectedAlert.suggestedAction}</p>
              </div>
            )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Dismiss
                </Button>
                <Button>Acknowledge & Execute</Button>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </>
  );
}
