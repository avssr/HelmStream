import { useState } from 'react';
import { Header } from './components/Header';
import { CommunicationBar } from './components/CommunicationBar';
import { NavigationTabs } from './components/NavigationTabs';
import { CriticalAlertCard } from './components/CriticalAlertCard';
import { VesselStatus } from './components/VesselStatus';
import { BerthAvailability } from './components/BerthAvailability';
import { PortMap } from './components/PortMap';
import { Chatbot } from './components/Chatbot';
import { Toaster } from './components/ui/sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';
import { ShipDetailsPanel } from './components/ShipDetailsPanel';
import { MessagesPanel } from './components/MessagesPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { BerthsListPanel } from './components/BerthsListPanel';
import { ShipDetailDialog } from './components/ShipDetailDialog';
import { BerthDetailDialog } from './components/BerthDetailDialog';
import { AIWorkflowsPage } from './components/AIWorkflowsPage';

export type ViewType = 'ships' | 'messages' | 'alerts' | 'workflows' | 'berths' | 'ship-detail' | 'ai-workflows' | null;
export type ChannelType = 'email' | 'whatsapp' | 'radio' | 'ais';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>(null);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [selectedBerthId, setSelectedBerthId] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType | null>(null);
  const [alertsFilterStartDate, setAlertsFilterStartDate] = useState<string>('');
  const [alertsFilterEndDate, setAlertsFilterEndDate] = useState<string>('');

  const handleOpenView = (view: ViewType, data?: any) => {
    setActiveView(view);
    if (view === 'ship-detail' && data?.shipId) {
      setSelectedShipId(data.shipId);
    } else if (view === 'berths' && data?.berthId) {
      setSelectedBerthId(data.berthId);
    } else if (view === 'messages' && data?.channel) {
      setSelectedChannel(data.channel);
    } else if (view === 'alerts' && data?.dateFilter) {
      setAlertsFilterStartDate(data.dateFilter.startDate || '');
      setAlertsFilterEndDate(data.dateFilter.endDate || '');
    } else if (view === 'alerts' && !data?.dateFilter) {
      // Clear filters when opening alerts without date filter
      setAlertsFilterStartDate('');
      setAlertsFilterEndDate('');
    }
  };

  const handleCloseView = () => {
    setActiveView(null);
    setSelectedShipId(null);
    setSelectedBerthId(null);
    setSelectedChannel(null);
    setAlertsFilterStartDate('');
    setAlertsFilterEndDate('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenView={handleOpenView} />
      <CommunicationBar onOpenView={handleOpenView} />
      <NavigationTabs activeTab={activeView === 'messages' || activeView === 'alerts' || activeView === 'workflows' || activeView === 'ai-workflows' ? activeView : 'overview'} onTabChange={(tab) => handleOpenView(tab as ViewType)} />
      
      {/* AI Workflows Full Page */}
      {activeView === 'ai-workflows' ? (
        <AIWorkflowsPage />
      ) : (
        <main className="p-3 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              <CriticalAlertCard onViewDetails={() => handleOpenView('alerts')} />
              <VesselStatus onViewShip={(shipId) => handleOpenView('ship-detail', { shipId })} onViewAll={() => handleOpenView('ships')} />
              <BerthAvailability onViewBerth={(berthId) => handleOpenView('berths', { berthId })} onViewAll={() => handleOpenView('berths')} />
            </div>

            {/* Main Content Area - Port Map */}
            <div className="lg:col-span-9">
              <div className="h-[400px] md:h-[600px] lg:h-[calc(100vh-240px)]">
                <PortMap onSelectShip={(shipId) => handleOpenView('ship-detail', { shipId })} onSelectBerth={(berthId) => handleOpenView('berths', { berthId })} />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* AI Chatbot Widget */}
      <Chatbot onNavigate={(view) => handleOpenView(view as ViewType)} />
      
      {/* Toast notifications */}
      <Toaster />

      {/* Sheets for different views */}
      <Sheet open={activeView === 'ships'} onOpenChange={(open) => !open && handleCloseView()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>All Vessels</SheetTitle>
            <SheetDescription>View and manage all vessels in the port</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ShipDetailsPanel onSelectShip={(shipId) => handleOpenView('ship-detail', { shipId })} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activeView === 'messages'} onOpenChange={(open) => !open && handleCloseView()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Communications</SheetTitle>
            <SheetDescription>All communication channels and messages</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <MessagesPanel channel={selectedChannel} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activeView === 'alerts'} onOpenChange={(open) => !open && handleCloseView()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>AI Insights & Alerts</SheetTitle>
            <SheetDescription>AI-generated insights and critical alerts</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <AlertsPanel 
              filterStartDate={alertsFilterStartDate} 
              filterEndDate={alertsFilterEndDate}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activeView === 'workflows'} onOpenChange={(open) => !open && handleCloseView()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Automated Workflows</SheetTitle>
            <SheetDescription>View and manage automated workflow tickets</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <WorkflowPanel onNavigateToAIWorkflows={() => handleOpenView('ai-workflows')} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activeView === 'berths' && selectedBerthId === null} onOpenChange={(open) => !open && handleCloseView()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Berth Management</SheetTitle>
            <SheetDescription>Monitor berth status and schedule operations</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <BerthsListPanel onSelectBerth={(berthId) => handleOpenView('berths', { berthId })} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail Dialogs */}
      <ShipDetailDialog
        shipId={selectedShipId}
        open={activeView === 'ship-detail' && selectedShipId !== null}
        onClose={handleCloseView}
      />

      <BerthDetailDialog
        berthId={selectedBerthId}
        open={activeView === 'berths' && selectedBerthId !== null}
        onClose={handleCloseView}
      />
    </div>
  );
}
