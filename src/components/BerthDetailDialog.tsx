import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Warehouse, Clock, Ship, CheckCircle, XCircle, Calendar, Wrench } from 'lucide-react';
import { berths } from './mock-data';
import { toast } from 'sonner';

interface BerthDetailDialogProps {
  berthId: number | null;
  open: boolean;
  onClose: () => void;
}

export function BerthDetailDialog({ berthId, open, onClose }: BerthDetailDialogProps) {
  const berth = berths.find(b => b.id === berthId);

  if (!berth) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-gray-600';
      case 'scheduled':
        return 'bg-blue-600';
      case 'available':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Warehouse className="h-6 w-6 text-blue-600" />
            {berth.name}
          </DialogTitle>
          <DialogDescription>
            Berth specifications, current status, schedule, and assigned equipment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(berth.status)}
              <div>
                <p className="font-medium capitalize">{berth.status}</p>
                <p className="text-sm text-gray-500">Position: {berth.position.x}, {berth.position.y}</p>
              </div>
            </div>
            <Badge className={`capitalize text-white ${getStatusColor(berth.status)}`}>
              {berth.status}
            </Badge>
          </div>

          <Separator />

          {/* Berth Specifications */}
          <div>
            <h4 className="mb-3">Berth Specifications</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Length</p>
                  <p className="font-medium">{berth.length || 350} meters</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Depth</p>
                  <p className="font-medium">{berth.depth || 15} meters</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Draft</p>
                  <p className="font-medium">{berth.maxDraft || 14} meters</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Vessel Type</p>
                  <p className="font-medium">{berth.vesselType || 'Container Ships'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max TEU</p>
                  <p className="font-medium">{berth.maxTEU?.toLocaleString() || 8000} TEU</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cranes Available</p>
                  <p className="font-medium">{berth.cranes || 2} STS Cranes</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Current Occupancy */}
          {berth.status === 'occupied' && berth.currentShip && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="mb-3">Current Vessel</h4>
                <div className="flex items-start gap-3">
                  <Ship className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{berth.currentShip}</p>
                    <p className="text-sm text-gray-600 mt-1">Container Ship • IMO: 9234567</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Docked Since</p>
                        <p className="font-medium">Today, 08:00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expected Departure</p>
                        <p className="font-medium">Tomorrow, 16:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Scheduled Occupancy */}
          {berth.status === 'scheduled' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="mb-3 text-blue-900">Scheduled Vessel</h4>
                <div className="flex items-start gap-3">
                  <Ship className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{berth.scheduledShip}</p>
                    <p className="text-sm text-gray-600 mt-1">Container Ship</p>
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Scheduled: {berth.scheduledTime}</span>
                      </div>
                    </div>
                    {berth.aiOptimization && (
                      <div className="mt-3 p-3 bg-white border border-blue-300 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">💡 AI Optimization</p>
                        <p className="text-sm text-blue-800">
                          {berth.aiOptimization}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Available */}
          {berth.status === 'available' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Berth Available</p>
                    <p className="text-sm text-green-700">Ready for immediate docking operations</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Assigned Equipment */}
          <div>
            <h4 className="mb-3">Assigned Equipment</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-900">Crane Alpha</p>
                </div>
                <p className="text-sm text-green-700">Active • 45 moves/hr</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-900">Crane Beta</p>
                </div>
                <p className="text-sm text-green-700">{berth.status === 'available' ? 'Ready' : 'Active'} • 45 moves/hr</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Timeline */}
          <div>
            <h4 className="mb-3">Today's Schedule</h4>
            <div className="space-y-3">
              {berth.schedule && berth.schedule.length > 0 ? (
                berth.schedule.map((item, idx) => {
                  const borderColor = 
                    item.status === 'completed' ? 'border-gray-400' :
                    item.status === 'active' ? 'border-green-600' :
                    item.status === 'optimized' ? 'border-blue-600' :
                    'border-gray-300';
                  
                  const bgColor =
                    item.status === 'completed' ? 'bg-gray-50' :
                    item.status === 'active' ? 'bg-green-50' :
                    item.status === 'optimized' ? 'bg-blue-50' :
                    'bg-gray-50';
                  
                  const textColor =
                    item.status === 'active' ? 'text-green-600' :
                    item.status === 'optimized' ? 'text-blue-600' :
                    'text-gray-500';

                  return (
                    <div key={idx} className={`flex items-start gap-3 p-3 ${bgColor} rounded-lg border-l-4 ${borderColor}`}>
                      <Clock className={`h-4 w-4 ${textColor} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{item.time}</p>
                          <Badge 
                            variant={item.status === 'optimized' ? 'default' : item.status === 'active' ? 'default' : item.status === 'completed' ? 'secondary' : 'outline'} 
                            className={`text-xs ${item.status === 'optimized' ? 'bg-blue-600' : item.status === 'active' ? 'bg-green-600' : ''}`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{item.vessel}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.operation}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                  No scheduled operations
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>
            <Calendar className="h-4 w-4 mr-2" />
            View Full Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
