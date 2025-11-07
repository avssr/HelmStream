import { Badge } from './ui/badge';
import { Anchor, Ship, Warehouse, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenView: (view: 'ships' | 'berths' | 'alerts') => void;
}

export function Header({ onOpenView }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Anchor className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">HelmStream</h1>
            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Maritime Operations Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => onOpenView('ships')}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-50 rounded-lg border hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <Ship className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600 flex-shrink-0" />
            <span className="text-xs md:text-sm whitespace-nowrap"><span className="hidden sm:inline">3 Active </span>Vessels</span>
          </button>
          
          <button
            onClick={() => onOpenView('berths')}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <Warehouse className="h-4 w-4 text-gray-600" />
            <span className="text-sm">3 Berths</span>
          </button>
          
          <button
            onClick={() => onOpenView('alerts')}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600 flex-shrink-0" />
            <span className="text-xs md:text-sm text-red-900 whitespace-nowrap"><span className="hidden sm:inline">1 Critical </span>Alert</span>
          </button>
        </div>
      </div>
    </header>
  );
}
