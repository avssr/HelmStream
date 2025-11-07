import { AlertCircle, Check, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface CriticalAlertCardProps {
  onViewDetails: () => void;
}

export function CriticalAlertCard({ onViewDetails }: CriticalAlertCardProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 cursor-pointer hover:bg-red-100 transition-colors" onClick={onViewDetails}>
      <div className="flex items-start gap-2 md:gap-3">
        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-900 mb-1">Active Critical Alert</h3>
          <p className="text-sm text-red-800 mb-2 md:mb-3">
            MV Pacific Glory engine failure detected.
            AI optimization in progress.
          </p>
          
          <div className="space-y-1 md:space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-red-800">
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600 flex-shrink-0" />
              <span>Schedule conflict identified</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-red-800">
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600 flex-shrink-0" />
              <span>Optimization calculated</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-red-800">
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600 flex-shrink-0" />
              <span>Stakeholders notified</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-white hover:bg-gray-50 border-red-300 text-red-900"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            View All Insights
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
