import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Ship, Anchor, Clock, MapPin, AlertTriangle, Radio, Package, DollarSign } from 'lucide-react';
import { ships } from './mock-data';
import { toast } from 'sonner';

interface ShipDetailDialogProps {
  shipId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ShipDetailDialog({ shipId, open, onClose }: ShipDetailDialogProps) {
  const ship = ships.find(s => s.id === shipId);

  if (!ship) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delayed':
        return 'destructive';
      case 'approaching':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Ship className="h-6 w-6 text-blue-600" />
            {ship.name}
          </DialogTitle>
          <DialogDescription>
            Detailed vessel information, status, and communications for {ship.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{ship.flag}</span>
              <div>
                <p className="text-sm text-gray-500">{ship.type}</p>
                <p className="text-sm text-gray-500">IMO: 9234567</p>
              </div>
            </div>
            <Badge variant={getStatusVariant(ship.status)} className="capitalize text-sm py-1 px-3">
              {ship.status}
            </Badge>
          </div>

          <Separator />

          {/* Vessel Information */}
          <div>
            <h4 className="mb-3">Vessel Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Ship className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">IMO Number</p>
                    <p className="font-medium">{ship.imo || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Anchor className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Scheduled Berth</p>
                    <p className="font-medium">Berth {ship.scheduledBerth}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ETA</p>
                    <p className="font-medium">{ship.eta}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Current Position</p>
                    <p className="font-medium">{ship.position.x}°N, {ship.position.y}°W</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Cargo Type</p>
                    <p className="font-medium">{ship.cargoType || 'General Cargo'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{ship.teu ? 'TEU Capacity' : 'Speed'}</p>
                    <p className="font-medium">{ship.teu ? `${ship.teu?.toLocaleString()} TEU` : `${ship.speed} knots`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Alert Section */}
          {ship.alert && (
            <>
              <div className={`border rounded-lg p-4 ${
                ship.status === 'delayed' ? 'bg-red-50 border-red-200' : 
                ship.status === 'waiting' ? 'bg-blue-50 border-blue-200' : 
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    ship.status === 'delayed' ? 'text-red-600' : 
                    ship.status === 'waiting' ? 'text-blue-600' : 
                    'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`mb-2 ${
                      ship.status === 'delayed' ? 'text-red-900' : 
                      ship.status === 'waiting' ? 'text-blue-900' : 
                      'text-green-900'
                    }`}>
                      {ship.status === 'delayed' ? 'Critical Alert' : 
                       ship.status === 'waiting' ? 'Optimization Opportunity' : 
                       'Status Update'}
                    </h4>
                    <p className={`text-sm mb-3 ${
                      ship.status === 'delayed' ? 'text-red-800' : 
                      ship.status === 'waiting' ? 'text-blue-800' : 
                      'text-green-800'
                    }`}>
                      {ship.alert}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Communication History */}
          <div>
            <h4 className="mb-3">Recent Communications</h4>
            <div className="space-y-2">
              {ship.recentMessages && ship.recentMessages.length > 0 ? (
                ship.recentMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Radio className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{msg.type.toUpperCase()} from {msg.from}</p>
                        <p className="text-xs text-gray-500">{msg.time}</p>
                      </div>
                      <p className="text-sm text-gray-600">{msg.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                  No recent communications
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Assigned Resources */}
          <div>
            <h4 className="mb-3">Assigned Resources</h4>
            <div className="grid grid-cols-2 gap-3">
              {ship.assignedResources?.tugboat && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Tugboat</p>
                  <p className="text-sm text-blue-700">{ship.assignedResources.tugboat}</p>
                </div>
              )}
              {ship.assignedResources?.crane && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Crane</p>
                  <p className="text-sm text-blue-700">{ship.assignedResources.crane}</p>
                </div>
              )}
              {ship.assignedResources?.pilot && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Pilot</p>
                  <p className="text-sm text-blue-700">{ship.assignedResources.pilot}</p>
                </div>
              )}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Berth</p>
                <p className="text-sm text-blue-700">Berth {ship.scheduledBerth} (Reserved)</p>
              </div>
              {ship.captain && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Captain</p>
                  <p className="text-sm text-blue-700">{ship.captain}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => {
            toast.success(`Contacting ${ship.name}...`, {
              description: 'Communication channel opened via VHF Channel 16'
            });
          }}>
            <Radio className="h-4 w-4 mr-2" />
            Contact Vessel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
