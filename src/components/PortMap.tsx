import { Badge } from './ui/badge';

interface PortMapProps {
  onSelectShip: (shipId: string) => void;
  onSelectBerth: (berthId: number) => void;
}

export function PortMap({ onSelectShip, onSelectBerth }: PortMapProps) {
  return (
    <div className="bg-white rounded-lg border p-3 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2>Live Port Map</h2>
        <Badge variant="outline" className="bg-white border-gray-300 text-xs md:text-sm">
          <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500 rounded-full mr-1.5 md:mr-2 animate-pulse"></span>
          Live
        </Badge>
      </div>

      <div className="relative flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border overflow-hidden">
        <svg viewBox="0 0 900 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Water area (left side) */}
          <rect x="0" y="0" width="700" height="600" fill="#dbeafe" />
          
          {/* Dock area (right side) */}
          <rect x="700" y="0" width="200" height="600" fill="#e5e7eb" />
          
          {/* Dock edge line */}
          <line x1="700" y1="0" x2="700" y2="600" stroke="#6b7280" strokeWidth="3" />
          
          {/* Port Dock Area Label */}
          <text x="800" y="40" textAnchor="middle" fill="#4b5563" fontSize="16" fontWeight="600">
            Port Dock Area
          </text>
          
          {/* Water Area Label */}
          <text x="350" y="40" textAnchor="middle" fill="#1e40af" fontSize="16" fontWeight="600" opacity="0.6">
            Navigation Channel
          </text>

          {/* Berth 1 - Top - OCCUPIED (Gray) */}
          <g onClick={() => onSelectBerth(1)} className="cursor-pointer" style={{ cursor: 'pointer' }}>
            <text x="760" y="105" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="600">Berth 1</text>
            <text x="760" y="170" textAnchor="middle" fill="#4b5563" fontSize="12">occupied</text>
            
            {/* Berth icon - Occupied status (gray) */}
            <g className="hover:opacity-70 transition-opacity">
              {/* Berth platform background */}
              <rect x="710" y="125" width="85" height="80" fill="#f9fafb" stroke="#9ca3af" strokeWidth="2" rx="4" opacity="0.8" />
              
              {/* Dock edge with status color */}
              <rect x="710" y="125" width="6" height="80" fill="#6b7280" rx="2" />
              
              {/* Bollards/cleats (mooring posts) - status color */}
              <g fill="#4b5563">
                <circle cx="725" cy="140" r="4" />
                <circle cx="725" cy="165" r="4" />
                <circle cx="725" cy="190" r="4" />
                
                <circle cx="780" cy="140" r="4" />
                <circle cx="780" cy="165" r="4" />
                <circle cx="780" cy="190" r="4" />
              </g>
              
              {/* Status indicator bar */}
              <rect x="750" y="130" width="35" height="6" fill="#6b7280" rx="3" />
            </g>
            
            {/* Crane 1 - Port crane icon */}
            <g transform="translate(820, 145)">
              {/* Crane base/platform */}
              <rect x="-10" y="8" width="20" height="4" fill="#6b7280" rx="2" />
              {/* Main tower */}
              <rect x="-3" y="-12" width="6" height="20" fill="#f59e0b" />
              {/* Horizontal boom */}
              <rect x="-18" y="-14" width="36" height="4" fill="#f59e0b" rx="1" />
              {/* Vertical support cable */}
              <line x1="0" y1="-12" x2="0" y2="-10" stroke="#374151" strokeWidth="1.5" />
              {/* Trolley */}
              <rect x="8" y="-16" width="6" height="4" fill="#dc2626" rx="1" />
              {/* Lifting cable */}
              <line x1="11" y1="-12" x2="11" y2="-4" stroke="#374151" strokeWidth="1" strokeDasharray="1,1" />
              {/* Hook */}
              <circle cx="11" cy="-3" r="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
            </g>
            <text x="870" y="152" fill="#f59e0b" fontSize="11" fontWeight="600">Crane 1</text>
            
            {/* Ship at berth 1 - Better ship icon */}
            <g transform="translate(650, 165)">
              {/* Ship hull */}
              <path d="M -18,-8 L -18,8 L 18,8 L 18,-8 L 12,-12 L -12,-12 Z" fill="#6b7280" stroke="#374151" strokeWidth="2" />
              {/* Bridge */}
              <rect x="-6" y="-14" width="12" height="6" fill="#374151" rx="1" />
              {/* Chimney */}
              <rect x="2" y="-18" width="3" height="4" fill="#ef4444" rx="1" />
            </g>
            <text x="590" y="170" textAnchor="middle" fill="#1f2937" fontSize="11">MV Atlantic Pride</text>
          </g>

          {/* Berth 2 - Middle - RESERVED (Blue) */}
          <g onClick={() => onSelectBerth(2)} className="cursor-pointer" style={{ cursor: 'pointer' }}>
            <text x="760" y="240" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="600">Berth 2</text>
            <text x="760" y="305" textAnchor="middle" fill="#2563eb" fontSize="12">reserved</text>
            
            {/* Berth icon - Reserved status (blue) */}
            <g className="hover:opacity-70 transition-opacity">
              {/* Berth platform background */}
              <rect x="710" y="260" width="85" height="80" fill="#f9fafb" stroke="#93c5fd" strokeWidth="2" rx="4" opacity="0.8" />
              
              {/* Dock edge with status color */}
              <rect x="710" y="260" width="6" height="80" fill="#3b82f6" rx="2" />
              
              {/* Bollards/cleats (mooring posts) - status color */}
              <g fill="#2563eb">
                <circle cx="725" cy="275" r="4" />
                <circle cx="725" cy="300" r="4" />
                <circle cx="725" cy="325" r="4" />
                
                <circle cx="780" cy="275" r="4" />
                <circle cx="780" cy="300" r="4" />
                <circle cx="780" cy="325" r="4" />
              </g>
              
              {/* Status indicator bar */}
              <rect x="750" y="265" width="35" height="6" fill="#3b82f6" rx="3" />
            </g>
            
            {/* Crane 2 - Port crane icon */}
            <g transform="translate(820, 280)">
              {/* Crane base/platform */}
              <rect x="-10" y="8" width="20" height="4" fill="#6b7280" rx="2" />
              {/* Main tower */}
              <rect x="-3" y="-12" width="6" height="20" fill="#f59e0b" />
              {/* Horizontal boom */}
              <rect x="-18" y="-14" width="36" height="4" fill="#f59e0b" rx="1" />
              {/* Vertical support cable */}
              <line x1="0" y1="-12" x2="0" y2="-10" stroke="#374151" strokeWidth="1.5" />
              {/* Trolley */}
              <rect x="8" y="-16" width="6" height="4" fill="#dc2626" rx="1" />
              {/* Lifting cable */}
              <line x1="11" y1="-12" x2="11" y2="-4" stroke="#374151" strokeWidth="1" strokeDasharray="1,1" />
              {/* Hook */}
              <circle cx="11" cy="-3" r="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
            </g>
            <text x="870" y="287" fill="#f59e0b" fontSize="11" fontWeight="600">Crane 2</text>
          </g>

          {/* Berth 3 - Bottom - AVAILABLE (Green) */}
          <g onClick={() => onSelectBerth(3)} className="cursor-pointer" style={{ cursor: 'pointer' }}>
            <text x="760" y="375" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="600">Berth 3</text>
            <text x="760" y="440" textAnchor="middle" fill="#059669" fontSize="12">available</text>
            
            {/* Berth icon - Available status (green) */}
            <g className="hover:opacity-70 transition-opacity">
              {/* Berth platform background */}
              <rect x="710" y="395" width="85" height="80" fill="#f9fafb" stroke="#86efac" strokeWidth="2" rx="4" opacity="0.8" />
              
              {/* Dock edge with status color */}
              <rect x="710" y="395" width="6" height="80" fill="#10b981" rx="2" />
              
              {/* Bollards/cleats (mooring posts) - status color */}
              <g fill="#059669">
                <circle cx="725" cy="410" r="4" />
                <circle cx="725" cy="435" r="4" />
                <circle cx="725" cy="460" r="4" />
                
                <circle cx="780" cy="410" r="4" />
                <circle cx="780" cy="435" r="4" />
                <circle cx="780" cy="460" r="4" />
              </g>
              
              {/* Status indicator bar */}
              <rect x="750" y="400" width="35" height="6" fill="#10b981" rx="3" />
            </g>
            
            {/* Crane 3 - Port crane icon */}
            <g transform="translate(820, 415)">
              {/* Crane base/platform */}
              <rect x="-10" y="8" width="20" height="4" fill="#6b7280" rx="2" />
              {/* Main tower */}
              <rect x="-3" y="-12" width="6" height="20" fill="#f59e0b" />
              {/* Horizontal boom */}
              <rect x="-18" y="-14" width="36" height="4" fill="#f59e0b" rx="1" />
              {/* Vertical support cable */}
              <line x1="0" y1="-12" x2="0" y2="-10" stroke="#374151" strokeWidth="1.5" />
              {/* Trolley */}
              <rect x="8" y="-16" width="6" height="4" fill="#dc2626" rx="1" />
              {/* Lifting cable */}
              <line x1="11" y1="-12" x2="11" y2="-4" stroke="#374151" strokeWidth="1" strokeDasharray="1,1" />
              {/* Hook */}
              <circle cx="11" cy="-3" r="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
            </g>
            <text x="870" y="422" fill="#f59e0b" fontSize="11" fontWeight="600">Crane 3</text>
          </g>

          {/* SHIP B - Replacement vessel (approaching, in green circle) */}
          <g onClick={() => onSelectShip('ship-b')} className="cursor-pointer" style={{ cursor: 'pointer' }}>
            <circle cx="450" cy="230" r="45" fill="#10b981" opacity="0.2" stroke="#059669" strokeWidth="3" className="hover:opacity-30 transition-opacity" />
            
            {/* Ship icon - larger and better */}
            <g transform="translate(450, 230)">
              {/* Ship hull */}
              <path d="M -22,-10 L -22,10 L 22,10 L 22,-10 L 15,-15 L -15,-15 Z" fill="#10b981" stroke="#059669" strokeWidth="2.5" />
              {/* Bridge */}
              <rect x="-8" y="-18" width="16" height="8" fill="#059669" rx="1" />
              {/* Chimney */}
              <rect x="2" y="-23" width="4" height="5" fill="#fbbf24" rx="1" />
              {/* Windows */}
              <circle cx="-4" cy="-14" r="2" fill="#dbeafe" />
              <circle cx="4" cy="-14" r="2" fill="#dbeafe" />
            </g>
            
            <rect x="420" y="190" width="60" height="18" fill="#10b981" rx="4" />
            <text x="450" y="203" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">SHIP B</text>
            
            <text x="450" y="290" textAnchor="middle" fill="#1f2937" fontSize="13" fontWeight="500">MSC Horizon</text>
            <text x="450" y="305" textAnchor="middle" fill="#047857" fontSize="11">REPLACEMENT VESSEL</text>
          </g>

          {/* SHIP A - Delayed vessel (red circle with alert) */}
          <g onClick={() => onSelectShip('ship-a')} className="cursor-pointer" style={{ cursor: 'pointer' }}>
            <circle cx="300" cy="420" r="45" fill="#ef4444" opacity="0.2" stroke="#dc2626" strokeWidth="3" className="hover:opacity-30 transition-opacity" />
            
            {/* Ship icon - damaged/alert state */}
            <g transform="translate(300, 420)">
              {/* Ship hull */}
              <path d="M -22,-10 L -22,10 L 22,10 L 22,-10 L 15,-15 L -15,-15 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="2.5" />
              {/* Bridge */}
              <rect x="-8" y="-18" width="16" height="8" fill="#dc2626" rx="1" />
              {/* Chimney with smoke/problem indicator */}
              <rect x="2" y="-23" width="4" height="5" fill="#991b1b" rx="1" />
              {/* Alert symbol */}
              <circle cx="0" cy="0" r="7" fill="#fef2f2" opacity="0.9" />
              <text x="0" y="4" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold">!</text>
            </g>
            
            <rect x="270" y="380" width="60" height="18" fill="#ef4444" rx="4" />
            <text x="300" y="393" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">SHIP A</text>
            
            <text x="300" y="480" textAnchor="middle" fill="#1f2937" fontSize="13" fontWeight="500">Pacific Glory</text>
            <text x="300" y="495" textAnchor="middle" fill="#dc2626" fontSize="11">ENGINE FAILURE</text>
          </g>

          {/* Tug Hercules - Better tugboat icon */}
          <g>
            <g transform="translate(580, 350)">
              {/* Tug body - compact design */}
              <path d="M -10,-6 L -10,6 L 10,6 L 10,-6 Z" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              {/* Wheelhouse */}
              <rect x="-5" y="-10" width="10" height="4" fill="#1e40af" rx="1" />
              {/* Exhaust */}
              <rect x="0" y="-13" width="2" height="3" fill="#6b7280" rx="0.5" />
            </g>
            <text x="580" y="375" textAnchor="middle" fill="#1f2937" fontSize="10">Tug Hercules</text>
          </g>

          {/* Tug Atlas - Better tugboat icon */}
          <g>
            <g transform="translate(450, 450)">
              {/* Tug body */}
              <path d="M -10,-6 L -10,6 L 10,6 L 10,-6 Z" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" />
              {/* Wheelhouse */}
              <rect x="-5" y="-10" width="10" height="4" fill="#7c3aed" rx="1" />
              {/* Exhaust */}
              <rect x="0" y="-13" width="2" height="3" fill="#6b7280" rx="0.5" />
            </g>
            <text x="450" y="475" textAnchor="middle" fill="#1f2937" fontSize="10">Tug Atlas</text>
          </g>

          {/* Grid lines for depth/symmetry */}
          <line x1="0" y1="200" x2="700" y2="200" stroke="#93c5fd" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />
          <line x1="0" y1="300" x2="700" y2="300" stroke="#93c5fd" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />
          <line x1="0" y1="400" x2="700" y2="400" stroke="#93c5fd" strokeWidth="1" opacity="0.3" strokeDasharray="5,5" />
          
          <line x1="200" y1="0" x2="200" y2="600" stroke="#93c5fd" strokeWidth="1" opacity="0.2" strokeDasharray="5,5" />
          <line x1="350" y1="0" x2="350" y2="600" stroke="#93c5fd" strokeWidth="1" opacity="0.2" strokeDasharray="5,5" />
          <line x1="500" y1="0" x2="500" y2="600" stroke="#93c5fd" strokeWidth="1" opacity="0.2" strokeDasharray="5,5" />

          {/* Legend */}
          <g transform="translate(30, 390)">
            <rect x="0" y="0" width="165" height="195" fill="white" opacity="0.95" rx="6" stroke="#d1d5db" strokeWidth="1.5" />
            <text x="10" y="20" fill="#1f2937" fontSize="13" fontWeight="600">Legend</text>
            
            {/* Approaching ship icon */}
            <g transform="translate(18, 35)">
              <path d="M -6,-3 L -6,3 L 6,3 L 6,-3 L 4,-4 L -4,-4 Z" fill="#10b981" />
            </g>
            <text x="32" y="40" fill="#374151" fontSize="11">Approaching</text>
            
            {/* Docked ship icon */}
            <g transform="translate(18, 57)">
              <path d="M -6,-3 L -6,3 L 6,3 L 6,-3 L 4,-4 L -4,-4 Z" fill="#6b7280" />
            </g>
            <text x="32" y="62" fill="#374151" fontSize="11">Docked</text>
            
            {/* Delayed ship icon */}
            <g transform="translate(18, 79)">
              <path d="M -6,-3 L -6,3 L 6,3 L 6,-3 L 4,-4 L -4,-4 Z" fill="#ef4444" />
            </g>
            <text x="32" y="84" fill="#374151" fontSize="11">Delayed</text>
            
            {/* Berth Available */}
            <g transform="translate(18, 100)">
              <rect x="-4" y="-3" width="8" height="6" fill="#f9fafb" stroke="#86efac" strokeWidth="1" />
              <rect x="-4" y="-3" width="1.5" height="6" fill="#10b981" />
              <circle cx="-2" cy="0" r="1.2" fill="#059669" />
              <circle cx="2" cy="0" r="1.2" fill="#059669" />
            </g>
            <text x="32" y="105" fill="#374151" fontSize="11">Berth Available</text>
            
            {/* Berth Reserved */}
            <g transform="translate(18, 122)">
              <rect x="-4" y="-3" width="8" height="6" fill="#f9fafb" stroke="#93c5fd" strokeWidth="1" />
              <rect x="-4" y="-3" width="1.5" height="6" fill="#3b82f6" />
              <circle cx="-2" cy="0" r="1.2" fill="#2563eb" />
              <circle cx="2" cy="0" r="1.2" fill="#2563eb" />
            </g>
            <text x="32" y="127" fill="#374151" fontSize="11">Berth Reserved</text>
            
            {/* Berth Occupied */}
            <g transform="translate(18, 144)">
              <rect x="-4" y="-3" width="8" height="6" fill="#f9fafb" stroke="#9ca3af" strokeWidth="1" />
              <rect x="-4" y="-3" width="1.5" height="6" fill="#6b7280" />
              <circle cx="-2" cy="0" r="1.2" fill="#4b5563" />
              <circle cx="2" cy="0" r="1.2" fill="#4b5563" />
            </g>
            <text x="32" y="149" fill="#374151" fontSize="11">Berth Occupied</text>
            
            {/* Crane icon */}
            <g transform="translate(18, 165)">
              <rect x="-5" y="3" width="10" height="2" fill="#6b7280" rx="1" />
              <rect x="-1.5" y="-5" width="3" height="8" fill="#f59e0b" />
              <rect x="-7" y="-6" width="14" height="2" fill="#f59e0b" rx="0.5" />
              <rect x="3" y="-7" width="3" height="2" fill="#dc2626" rx="0.5" />
              <circle cx="4.5" cy="-2" r="1" fill="#fbbf24" />
            </g>
            <text x="32" y="170" fill="#374151" fontSize="11">Port Crane</text>
            
            {/* Tugboat icon */}
            <g transform="translate(18, 185)">
              <path d="M -4,-2 L -4,2 L 4,2 L 4,-2 Z" fill="#3b82f6" />
              <rect x="-2" y="-4" width="4" height="2" fill="#1e40af" />
            </g>
            <text x="32" y="190" fill="#374151" fontSize="11">Tugboat</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
