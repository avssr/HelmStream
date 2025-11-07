import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, Ship, Sparkles, XIcon } from 'lucide-react';
import { useState } from 'react';
import { berths } from './mock-data';

interface BerthAvailabilityProps {
  onViewBerth: (berthId: number) => void;
  onViewAll: () => void;
}

export function BerthAvailability({ onViewBerth, onViewAll }: BerthAvailabilityProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const berthsSummary = [
    { id: 1, name: 'Berth 1', status: 'occupied', statusLabel: 'occupied' },
    { id: 2, name: 'Berth 2', status: 'reserved', statusLabel: 'reserved' },
    { id: 3, name: 'Berth 3', status: 'available', statusLabel: 'available' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'reserved':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'available':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border p-3 md:p-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3>Berth Availability</h3>
          <button 
            onClick={() => setShowSchedule(true)}
            className="text-xs md:text-sm text-blue-600 hover:underline"
          >
            View Full Schedule →
          </button>
        </div>

      <div className="space-y-2">
        {berthsSummary.map((berth) => (
          <button
            key={berth.id}
            onClick={() => onViewBerth(berth.id)}
            className="w-full flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-xs md:text-sm text-gray-900">{berth.name}</span>
            <Badge className={`capitalize text-white text-[10px] md:text-xs ${getStatusColor(berth.status)}`}>
              {berth.statusLabel}
            </Badge>
          </button>
        ))}
      </div>
    </div>

    {showSchedule && (
      <>
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowSchedule(false)} />
        <div className="fixed top-[50%] left-[50%] z-[60] grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-white p-6 shadow-lg max-h-[85vh] overflow-y-auto">
          <button 
            onClick={() => setShowSchedule(false)}
            className="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg leading-none font-semibold">Full Berth Schedule</h2>
          </div>
          <p className="text-sm text-gray-600">Complete schedule for all berths with AI optimization details</p>

          <div className="space-y-6 mt-4">
            {berths.map((berth) => (
              <div key={berth.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{berth.name}</h3>
                      <Badge className={`capitalize text-white text-xs ${
                        berth.status === 'occupied' ? 'bg-gray-600' :
                        berth.status === 'scheduled' ? 'bg-blue-600' :
                        'bg-green-600'
                      }`}>
                        {berth.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p>Length: {berth.length}m • Depth: {berth.depth}m • Max Draft: {berth.maxDraft}m</p>
                      <p>{berth.vesselType} • Max {berth.maxTEU?.toLocaleString()} TEU • {berth.cranes} Cranes</p>
                      {berth.currentShip && <p className="font-medium text-gray-900">Current: {berth.currentShip}</p>}
                      {berth.scheduledShip && <p className="font-medium text-blue-900">Scheduled: {berth.scheduledShip}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowSchedule(false);
                      onViewBerth(berth.id);
                    }}
                    className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                  >
                    View Details →
                  </button>
                </div>

                {berth.aiOptimization && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">AI Optimization</p>
                    </div>
                    <p className="text-sm text-purple-800">{berth.aiOptimization}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Timeline
                  </p>
                  {berth.schedule?.map((slot, idx) => {
                    const statusColors = {
                      completed: 'bg-gray-100 border-gray-300 text-gray-700',
                      active: 'bg-blue-50 border-blue-300 text-blue-900',
                      scheduled: 'bg-green-50 border-green-300 text-green-900',
                      optimized: 'bg-purple-50 border-purple-300 text-purple-900'
                    };
                    
                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded border ${statusColors[slot.status]}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="text-sm font-medium">{slot.time}</span>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {slot.status}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2 ml-5">
                          <Ship className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">{slot.vessel}</p>
                            <p className="text-xs opacity-80">{slot.operation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSchedule(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowSchedule(false);
              onViewAll();
            }}>
              View All Berths
            </Button>
          </div>
        </div>
      </>
    )}
  </>
  );
}
