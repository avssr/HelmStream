import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Warehouse, CheckCircle, Clock, XCircle } from 'lucide-react';
import { berths } from './mock-data';

interface BerthsListPanelProps {
  onSelectBerth?: (berthId: number) => void;
}

export function BerthsListPanel({ onSelectBerth }: BerthsListPanelProps) {
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
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Warehouse className="h-5 w-5 text-blue-600" />
        <h3>Berth Management</h3>
      </div>

      <div className="space-y-3">
        {berths.map((berth) => (
          <div
            key={berth.id}
            onClick={() => onSelectBerth?.(berth.id)}
            className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(berth.status)}
                <div>
                  <p className="font-medium text-gray-900">{berth.name}</p>
                  <p className="text-sm text-gray-500">Position: {berth.position.x}, {berth.position.y}</p>
                </div>
              </div>
              <Badge className={`capitalize text-white ${getStatusColor(berth.status)}`}>
                {berth.status}
              </Badge>
            </div>

            {berth.status === 'occupied' && berth.currentShip && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Current Vessel:</p>
                <p className="font-medium text-gray-900">{berth.currentShip}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {berth.schedule && berth.schedule.find(s => s.status === 'active')?.operation || 'Operations in progress'}
                </p>
              </div>
            )}

            {berth.status === 'scheduled' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-1">Next Arrival:</p>
                <p className="font-medium text-blue-900">{berth.scheduledShip}</p>
                <p className="text-xs text-blue-700 mt-1">Scheduled: {berth.scheduledTime}</p>
                {berth.aiOptimization && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-300">
                    <p className="text-xs text-blue-900 font-medium">💡 AI Optimization Available</p>
                  </div>
                )}
              </div>
            )}

            {berth.status === 'available' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">✓ Ready for immediate docking operations</p>
                {berth.schedule && berth.schedule.find(s => s.status === 'scheduled') && (
                  <p className="text-xs text-green-700 mt-1">
                    Next: {berth.schedule.find(s => s.status === 'scheduled')?.vessel}
                  </p>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Length</p>
                <p className="font-medium">{berth.length || 350}m</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Depth</p>
                <p className="font-medium">{berth.depth || 15}m</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Cranes</p>
                <p className="font-medium">{berth.cranes || 2} STS</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
