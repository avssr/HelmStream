import { Mail, MessageCircle, Phone, Anchor } from 'lucide-react';

type ChannelType = 'email' | 'whatsapp' | 'radio' | 'ais';

interface CommunicationBarProps {
  onOpenView: (view: 'messages', data?: { channel: ChannelType }) => void;
}

export function CommunicationBar({ onOpenView }: CommunicationBarProps) {
  const channels: Array<{ icon: typeof Mail; label: string; type: ChannelType; count?: number; live?: boolean; color: string }> = [
    { icon: Mail, label: 'Email', type: 'email', count: 6, color: 'text-blue-600' },
    { icon: MessageCircle, label: 'WhatsApp', type: 'whatsapp', count: 8, color: 'text-green-600' },
    { icon: Phone, label: 'Radio', type: 'radio', count: 5, color: 'text-purple-600' },
    { icon: Anchor, label: 'AIS Data', type: 'ais', live: true, color: 'text-orange-600' }
  ];

  return (
    <div className="bg-white border-b px-3 md:px-6 py-2 md:py-3 overflow-x-auto">
      <div className="flex items-center gap-3 md:gap-6 min-w-max">
        <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">Communication Channels:</span>
        {channels.map((channel, index) => {
          const Icon = channel.icon;
          return (
            <button
              key={index}
              onClick={() => onOpenView('messages', { channel: channel.type })}
              className="flex items-center gap-1.5 md:gap-2 cursor-pointer hover:bg-gray-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-colors"
            >
              <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 ${channel.color}`} />
              <span className="text-xs md:text-sm whitespace-nowrap">{channel.label}</span>
              {channel.count && (
                <span className="text-xs md:text-sm text-gray-900">{channel.count}</span>
              )}
              {channel.live && (
                <div className="flex items-center gap-1 md:gap-1.5">
                  <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs md:text-sm text-green-600">Live</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
