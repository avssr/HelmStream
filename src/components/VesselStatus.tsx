import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Ship, AlertCircle, Mail, Phone, Radio, MessageCircle, Send, XIcon } from 'lucide-react';
import { useState } from 'react';
import { ships } from './mock-data';

interface VesselStatusProps {
  onViewShip: (shipId: string) => void;
  onViewAll: () => void;
}

export function VesselStatus({ onViewShip, onViewAll }: VesselStatusProps) {
  const [selectedVessel, setSelectedVessel] = useState<typeof ships[0] | null>(null);
  const vessels = [
    {
      id: 'ship-a',
      name: 'MV Pacific Glory',
      type: 'Container Ship',
      shipCode: 'SHIP A',
      status: 'delayed',
      statusLabel: 'delayed',
      icon: '🔴'
    },
    {
      id: 'ship-b',
      name: 'MSC Horizon',
      type: 'Container Ship',
      shipCode: 'SHIP B',
      status: 'waiting',
      statusLabel: 'waiting',
      icon: '🟡'
    },
    {
      id: 'ship-c',
      name: 'Atlantic Trader',
      type: 'Bulk Carrier',
      status: 'approaching',
      statusLabel: 'approaching',
      icon: '🟢'
    }
  ];

  const handleContactClick = (vesselId: string) => {
    const ship = ships.find(s => s.id === vesselId);
    if (ship) {
      setSelectedVessel(ship);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border p-3 md:p-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3>Vessel Status</h3>
          <button 
            onClick={onViewAll}
            className="text-xs md:text-sm text-blue-600 hover:underline"
          >
            View All →
          </button>
        </div>

      <div className="space-y-2">
        {vessels.map((vessel) => (
          <div
            key={vessel.id}
            className={`w-full p-2 md:p-3 rounded-lg border hover:shadow-md transition-all ${
              vessel.status === 'delayed' 
                ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                : vessel.status === 'approaching'
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <button
              onClick={() => onViewShip(vessel.id)}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                  <span className="text-base md:text-lg flex-shrink-0">{vessel.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">{vessel.name}</p>
                      {vessel.shipCode && (
                        <Badge 
                          variant={vessel.status === 'delayed' ? 'destructive' : 'secondary'}
                          className="text-[10px] md:text-xs flex-shrink-0"
                        >
                          {vessel.shipCode}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">{vessel.type}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    vessel.status === 'delayed' 
                      ? 'destructive' 
                      : vessel.status === 'approaching'
                      ? 'default'
                      : 'secondary'
                  }
                  className={`capitalize text-[10px] md:text-xs flex-shrink-0 ${
                    vessel.status === 'approaching' ? 'bg-green-600' : ''
                  } ${
                    vessel.status === 'waiting' ? 'bg-yellow-600' : ''
                  }`}
                >
                  {vessel.statusLabel}
                </Badge>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleContactClick(vessel.id);
              }}
              className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800 hover:underline text-left"
            >
              Contact Vessel →
            </button>
          </div>
        ))}
      </div>
    </div>

    {selectedVessel && (
      <>
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setSelectedVessel(null)} />
        <div className="fixed top-[50%] left-[50%] z-[60] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-white p-6 shadow-lg max-h-[85vh] overflow-y-auto">
          <button 
            onClick={() => setSelectedVessel(null)}
            className="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Ship className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-lg leading-none font-semibold">{selectedVessel?.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedVessel?.type} • IMO: {selectedVessel?.imo}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Captain</p>
                  <p className="text-blue-800">{selectedVessel?.captain || 'Not Available'}</p>
                </div>
                <Badge className={`${
                  selectedVessel?.status === 'delayed' ? 'bg-red-600' :
                  selectedVessel?.status === 'approaching' ? 'bg-green-600' :
                  'bg-yellow-600'
                }`}>
                  {selectedVessel?.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-blue-700 opacity-80">Flag</p>
                  <p className="text-blue-900">{selectedVessel?.flag}</p>
                </div>
                <div>
                  <p className="text-blue-700 opacity-80">Speed</p>
                  <p className="text-blue-900">{selectedVessel?.speed} knots</p>
                </div>
                <div>
                  <p className="text-blue-700 opacity-80">Cargo Type</p>
                  <p className="text-blue-900">{selectedVessel?.cargoType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-700 opacity-80">TEU</p>
                  <p className="text-blue-900">{selectedVessel?.teu?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Contact Options</p>
              <div className="grid grid-cols-1 gap-2">
                <button className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Send Email</p>
                    <p className="text-xs text-gray-600">captain@{selectedVessel?.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                  <Send className="h-4 w-4 text-gray-400" />
                </button>

                <button className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Radio className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">VHF Radio</p>
                    <p className="text-xs text-gray-600">Channel 16 • Click to call</p>
                  </div>
                  <Send className="h-4 w-4 text-gray-400" />
                </button>

                <button className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-xs text-gray-600">Send direct message to captain</p>
                  </div>
                  <Send className="h-4 w-4 text-gray-400" />
                </button>

                <button className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Satellite Phone</p>
                    <p className="text-xs text-gray-600">Direct call to bridge</p>
                  </div>
                  <Send className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {selectedVessel?.recentMessages && selectedVessel.recentMessages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Recent Communications</p>
                <div className="space-y-2">
                  {selectedVessel.recentMessages.slice(0, 2).map((msg, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs text-gray-700 uppercase">{msg.type}</span>
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedVessel(null)}>
                Close
              </Button>
              <Button onClick={() => {
                setSelectedVessel(null);
                if (selectedVessel) onViewShip(selectedVessel.id);
              }}>
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </>
    )}
  </>
  );
}
