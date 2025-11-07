import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Ship, Anchor, Clock, AlertTriangle } from 'lucide-react';
import { ships } from './mock-data';

interface ShipDetailsPanelProps {
  onSelectShip?: (shipId: string) => void;
}

export function ShipDetailsPanel({ onSelectShip }: ShipDetailsPanelProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Ship className="h-5 w-5 text-blue-600" />
        <h3>Active Vessels</h3>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="delayed">Delayed</TabsTrigger>
          <TabsTrigger value="waiting">Waiting</TabsTrigger>
          <TabsTrigger value="approaching">Approaching</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {ships.map((ship) => (
            <div
              key={ship.id}
              onClick={() => onSelectShip?.(ship.id)}
              className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ship.flag}</span>
                  <div>
                    <p className="font-medium">{ship.name}</p>
                    <p className="text-sm text-gray-500">{ship.type}</p>
                  </div>
                </div>
                <Badge
                  variant={ship.status === 'delayed' ? 'destructive' : 'secondary'}
                  className="capitalize"
                >
                  {ship.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>ETA: {ship.eta}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Anchor className="h-3 w-3" />
                  <span>Berth {ship.scheduledBerth}</span>
                </div>
              </div>

              {ship.status === 'delayed' && (
                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">Engine failure reported</span>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="delayed" className="space-y-3 mt-4">
          {ships.filter(s => s.status === 'delayed').map((ship) => (
            <div
              key={ship.id}
              onClick={() => onSelectShip?.(ship.id)}
              className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ship.flag}</span>
                  <div>
                    <p className="font-medium">{ship.name}</p>
                    <p className="text-sm text-gray-500">{ship.type}</p>
                  </div>
                </div>
                <Badge variant="destructive">Delayed</Badge>
              </div>
              <div className="mt-2 p-2 bg-red-50 rounded border border-red-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">Engine failure reported</span>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="waiting" className="space-y-3 mt-4">
          {ships.filter(s => s.status === 'waiting').map((ship) => (
            <div
              key={ship.id}
              onClick={() => onSelectShip?.(ship.id)}
              className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ship.flag}</span>
                  <div>
                    <p className="font-medium">{ship.name}</p>
                    <p className="text-sm text-gray-500">{ship.type}</p>
                  </div>
                </div>
                <Badge variant="secondary">Waiting</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>ETA: {ship.eta}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Anchor className="h-3 w-3" />
                  <span>Berth {ship.scheduledBerth}</span>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="approaching" className="space-y-3 mt-4">
          {ships.filter(s => s.status === 'approaching').map((ship) => (
            <div
              key={ship.id}
              onClick={() => onSelectShip?.(ship.id)}
              className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ship.flag}</span>
                  <div>
                    <p className="font-medium">{ship.name}</p>
                    <p className="text-sm text-gray-500">{ship.type}</p>
                  </div>
                </div>
                <Badge variant="secondary">Approaching</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>ETA: {ship.eta}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Anchor className="h-3 w-3" />
                  <span>Berth {ship.scheduledBerth}</span>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
