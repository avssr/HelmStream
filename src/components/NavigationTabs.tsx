import { LayoutGrid, MessageSquare, Sparkles, ClipboardList, Bot } from 'lucide-react';
import { Badge } from './ui/badge';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview', shortLabel: 'Overview' },
    { id: 'messages', icon: MessageSquare, label: 'Communications', shortLabel: 'Comms' },
    { id: 'alerts', icon: Sparkles, label: 'AI Insights', shortLabel: 'Insights', badge: 3 },
    { id: 'workflows', icon: ClipboardList, label: 'Workflow Incidents', shortLabel: 'Workflows', badge: 4 },
    { id: 'ai-workflows', icon: Bot, label: 'AI Workflows', shortLabel: 'AI Flows' }
  ];

  return (
    <div className="bg-white border-b px-3 md:px-6 overflow-x-auto">
      <div className="flex items-center gap-0.5 md:gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-3 border-b-2 transition-colors relative whitespace-nowrap ${
                isActive 
                  ? 'border-blue-600 text-gray-900' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm md:hidden">{tab.shortLabel}</span>
              <span className="text-xs md:text-sm hidden md:inline">{tab.label}</span>
              {tab.badge && (
                <Badge variant="destructive" className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs">
                  {tab.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
