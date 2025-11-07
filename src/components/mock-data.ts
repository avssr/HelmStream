// Mock data for HelmStream platform

export interface Ship {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  status: 'docked' | 'approaching' | 'waiting' | 'delayed';
  eta?: string;
  scheduledBerth?: number;
  flag: string;
  imo?: string;
  cargoType?: string;
  teu?: number;
  speed?: number;
  captain?: string;
  recentMessages?: Array<{
    type: 'email' | 'radio' | 'ais';
    from: string;
    content: string;
    time: string;
  }>;
  assignedResources?: {
    tugboat?: string;
    crane?: string;
    pilot?: string;
  };
  alert?: string;
}

export interface Berth {
  id: number;
  name: string;
  position: { x: number; y: number };
  status: 'occupied' | 'available' | 'scheduled';
  currentShip?: string;
  scheduledShip?: string;
  scheduledTime?: string;
  length?: number;
  depth?: number;
  maxDraft?: number;
  vesselType?: string;
  maxTEU?: number;
  cranes?: number;
  schedule?: Array<{
    time: string;
    vessel: string;
    status: 'completed' | 'active' | 'scheduled' | 'optimized';
    operation: string;
  }>;
  aiOptimization?: string;
}

export interface Crane {
  id: string;
  position: { x: number; y: number };
  status: 'active' | 'idle' | 'scheduled';
  assignedTo?: string;
}

export interface Tugboat {
  id: string;
  position: { x: number; y: number };
  status: 'active' | 'idle' | 'scheduled';
  assignedTo?: string;
}

export interface CommunicationChannel {
  id: string;
  type: 'email' | 'whatsapp' | 'radio' | 'sms' | 'ais';
  name: string;
  unreadCount: number;
  lastActivity?: string;
  icon: string;
}

export interface Message {
  id: string;
  channel: string;
  from: string;
  subject: string;
  content: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  processed: boolean;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  relatedEntities: string[];
  aiInsight: string;
  suggestedAction?: string;
}

export interface WorkflowTicket {
  id: string;
  type: 'email' | 'task' | 'notification';
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'completed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  content: string;
  triggeredBy: string;
}

export const ships: Ship[] = [
  {
    id: 'ship-a',
    name: 'MV Pacific Glory',
    type: 'Container Ship',
    position: { x: 150, y: 300 },
    status: 'delayed',
    eta: '14:00 (Delayed)',
    scheduledBerth: 2,
    flag: '🇯🇵',
    imo: '9234567',
    cargoType: 'Refrigerated Containers',
    teu: 4500,
    speed: 0,
    captain: 'Capt. Tanaka Yamamoto',
    recentMessages: [
      {
        type: 'email',
        from: 'captain@pacificglory.com',
        content: 'URGENT: Main engine failure in cylinder 4. Engineering team working on emergency repairs. Unable to proceed. Request tug assistance if repairs fail. Cargo includes time-sensitive perishables.',
        time: '13:45'
      },
      {
        type: 'ais',
        from: 'AIS System',
        content: 'Position: 34.2°N, 118.5°W - Speed: 0 knots - Course: N/A - Engine stopped',
        time: '13:46'
      },
      {
        type: 'radio',
        from: 'VHF Ch 16',
        content: 'Port Authority, this is Pacific Glory. We are dead in the water. Requesting permission to delay berthing indefinitely. Over.',
        time: '13:48'
      }
    ],
    assignedResources: {
      tugboat: 'Tug Atlas (Standby)',
      crane: 'Crane Beta (Reassigned)',
      pilot: 'Pilot Team A (Released)'
    },
    alert: 'Critical engine failure - Berth 2 schedule disrupted. AI has identified MSC Horizon as optimal replacement.'
  },
  {
    id: 'ship-b',
    name: 'MSC Horizon',
    type: 'Container Ship',
    position: { x: 100, y: 450 },
    status: 'waiting',
    eta: '16:30 (Can advance to 14:15)',
    scheduledBerth: 2,
    flag: '🇩🇪',
    imo: '9445821',
    cargoType: 'Mixed Containers',
    teu: 5200,
    speed: 8,
    captain: 'Capt. Klaus Weber',
    recentMessages: [
      {
        type: 'email',
        from: 'Port Authority Operations',
        content: 'MSC Horizon, we have an early berthing opportunity at Berth 2 due to schedule optimization. Available at 14:00 instead of 16:30. This would save 2.5 hours waiting time and approximately $73,000 in combined costs. Please confirm if you can advance arrival.',
        time: '13:50'
      },
      {
        type: 'radio',
        from: 'VHF Ch 16',
        content: 'Port Authority, MSC Horizon confirming early arrival at 14:15. Reducing speed to match new ETA. Ready to proceed. Over.',
        time: '13:52'
      },
      {
        type: 'ais',
        from: 'AIS System',
        content: 'Position: 34.1°N, 118.3°W - Speed: 8 knots - Course: 045° - ETA updated',
        time: '13:53'
      }
    ],
    assignedResources: {
      tugboat: 'Tug Atlas (Reassigned from Pacific Glory)',
      crane: 'Crane Beta (Ready)',
      pilot: 'Pilot Team A (Confirmed)'
    },
    alert: 'Early berthing opportunity - AI optimization suggests $73,000 savings across stakeholders'
  },
  {
    id: 'ship-c',
    name: 'Atlantic Trader',
    type: 'Bulk Carrier',
    position: { x: 250, y: 200 },
    status: 'approaching',
    eta: '18:00',
    scheduledBerth: 3,
    flag: '🇬🇧',
    imo: '9167234',
    cargoType: 'Iron Ore',
    teu: 0,
    speed: 12,
    captain: 'Capt. James Morrison',
    recentMessages: [
      {
        type: 'radio',
        from: 'VHF Ch 16',
        content: 'Port Authority, Atlantic Trader on approach. ETA 18:00 confirmed. Cargo: 45,000 MT iron ore. Request berth 3 preparation and crane assignment. Over.',
        time: '14:30'
      },
      {
        type: 'ais',
        from: 'AIS System',
        content: 'Position: 34.0°N, 118.2°W - Speed: 12 knots - Course: 020° - On schedule',
        time: '14:35'
      },
      {
        type: 'email',
        from: 'operations@atlantictrader.com',
        content: 'Port Authority, please confirm shore crane availability for discharge operations. Estimated discharge time: 8 hours. Departure planned for 02:00 tomorrow.',
        time: '14:40'
      }
    ],
    assignedResources: {
      tugboat: 'Tug Neptune (Scheduled)',
      crane: 'Crane Gamma (Ready)',
      pilot: 'Pilot Team B (Scheduled 17:45)'
    }
  }
];

export const berths: Berth[] = [
  {
    id: 1,
    name: 'Berth 1',
    position: { x: 500, y: 150 },
    status: 'occupied',
    currentShip: 'Oriental Star',
    length: 350,
    depth: 15,
    maxDraft: 14,
    vesselType: 'Container Ships',
    maxTEU: 8000,
    cranes: 2,
    schedule: [
      {
        time: '08:00 - 16:00',
        vessel: 'Previous vessel departure',
        status: 'completed',
        operation: 'Final cargo discharge and departure'
      },
      {
        time: '16:30 - 02:00',
        vessel: 'Oriental Star',
        status: 'active',
        operation: 'Container loading operations (4,200 TEU)'
      },
      {
        time: '02:00 - 06:00',
        vessel: 'Oriental Star',
        status: 'scheduled',
        operation: 'Final preparations and departure'
      }
    ]
  },
  {
    id: 2,
    name: 'Berth 2',
    position: { x: 500, y: 280 },
    status: 'scheduled',
    scheduledShip: 'MSC Horizon (AI Optimized)',
    scheduledTime: '14:15 (Advanced from 16:30)',
    length: 350,
    depth: 15,
    maxDraft: 14,
    vesselType: 'Container Ships',
    maxTEU: 8000,
    cranes: 2,
    schedule: [
      {
        time: '08:00 - 13:30',
        vessel: 'Maintenance operations',
        status: 'completed',
        operation: 'Berth preparation and safety checks'
      },
      {
        time: '14:00 (Original)',
        vessel: 'MV Pacific Glory - CANCELLED',
        status: 'completed',
        operation: 'Engine failure - slot now available'
      },
      {
        time: '14:15 - 22:00',
        vessel: 'MSC Horizon',
        status: 'optimized',
        operation: 'Container discharge and loading (5,200 TEU)'
      },
      {
        time: '22:00 - 23:00',
        vessel: 'MSC Horizon',
        status: 'scheduled',
        operation: 'Final preparations and departure'
      }
    ],
    aiOptimization: 'AI detected schedule gap and optimized MSC Horizon arrival 2.5 hours earlier. Combined savings: $73,000 (port delays + fuel costs). Berth utilization increased by 15%.'
  },
  {
    id: 3,
    name: 'Berth 3',
    position: { x: 500, y: 410 },
    status: 'available',
    length: 400,
    depth: 18,
    maxDraft: 17,
    vesselType: 'Bulk Carriers & Large Vessels',
    maxTEU: 10000,
    cranes: 3,
    schedule: [
      {
        time: '06:00 - 14:00',
        vessel: 'Nordic Voyager',
        status: 'completed',
        operation: 'Coal discharge - 50,000 MT'
      },
      {
        time: '14:00 - 18:00',
        vessel: 'Berth available',
        status: 'active',
        operation: 'Ready for immediate docking'
      },
      {
        time: '18:00 - 02:00',
        vessel: 'Atlantic Trader',
        status: 'scheduled',
        operation: 'Iron ore discharge - 45,000 MT'
      }
    ]
  }
];

export const cranes: Crane[] = [
  {
    id: 'crane-1',
    position: { x: 520, y: 150 },
    status: 'active',
    assignedTo: 'Berth 1'
  },
  {
    id: 'crane-2',
    position: { x: 520, y: 280 },
    status: 'scheduled',
    assignedTo: 'Berth 2 - Reassigned'
  }
];

export const tugboats: Tugboat[] = [
  {
    id: 'tug-1',
    position: { x: 320, y: 200 },
    status: 'idle'
  },
  {
    id: 'tug-2',
    position: { x: 280, y: 380 },
    status: 'scheduled',
    assignedTo: 'MSC Horizon'
  }
];

export const communicationChannels: CommunicationChannel[] = [
  {
    id: 'email-1',
    type: 'email',
    name: 'Port Operations',
    unreadCount: 3,
    lastActivity: '2 min ago',
    icon: 'Mail'
  },
  {
    id: 'email-2',
    type: 'email',
    name: 'Ship Comms',
    unreadCount: 1,
    lastActivity: '5 min ago',
    icon: 'Mail'
  },
  {
    id: 'whatsapp-1',
    type: 'whatsapp',
    name: 'Pilot Team',
    unreadCount: 5,
    lastActivity: '1 min ago',
    icon: 'MessageCircle'
  },
  {
    id: 'radio-1',
    type: 'radio',
    name: 'VHF Ch 16',
    unreadCount: 0,
    lastActivity: '10 min ago',
    icon: 'Radio'
  },
  {
    id: 'ais-1',
    type: 'ais',
    name: 'AIS Data Feed',
    unreadCount: 12,
    lastActivity: 'Live',
    icon: 'Satellite'
  }
];

export const messages: Message[] = [
  // Email Messages
  {
    id: 'msg-1',
    channel: 'email',
    from: 'captain@pacificglory.com',
    subject: 'URGENT: Engine Failure - Delayed Arrival',
    content: 'Port Authority, we regret to inform you that MV Pacific Glory has experienced a critical engine failure in cylinder 4. Our ETA to Berth 2 originally scheduled for 14:00 is now indefinitely delayed. Engineering team is conducting emergency repairs. We will update you on our revised ETA within the hour. Current position: 15nm out. Request standby tug assistance if repairs cannot be completed. Cargo includes time-sensitive refrigerated containers.',
    timestamp: '13:45',
    priority: 'high',
    processed: true
  },
  {
    id: 'msg-2',
    channel: 'email',
    from: 'operations@mschorizon.com',
    subject: 'RE: Early Berthing Opportunity Accepted',
    content: 'Port Authority Operations, thank you for the early berthing opportunity at Berth 2. MSC Horizon confirms acceptance to advance arrival from 16:30 to 14:15. We are adjusting speed to match the new ETA. Captain Weber has been notified and all crew are prepared for early berthing operations. Please confirm pilot boarding time and tug assignment.',
    timestamp: '13:52',
    priority: 'high',
    processed: true
  },
  {
    id: 'msg-3',
    channel: 'email',
    from: 'operations@atlantictrader.com',
    subject: 'Berth 3 Operations Confirmation',
    content: 'Dear Port Authority, Atlantic Trader will arrive at Berth 3 as scheduled at 18:00. Cargo: 45,000 MT iron ore for discharge. Estimated discharge time: 8 hours using shore cranes. Please confirm crane availability and ensure berth preparation is complete. We plan departure at 02:00 tomorrow. All documentation has been submitted electronically.',
    timestamp: '14:40',
    priority: 'medium',
    processed: true
  },
  {
    id: 'msg-4',
    channel: 'email',
    from: 'harbormaster@portauthority.com',
    subject: 'Daily Operations Summary',
    content: 'Morning shift summary: 3 vessels berthed successfully, 2 departures completed on schedule. Berth 1 currently occupied by Oriental Star (container ops in progress). Berth 2 optimization in effect due to Pacific Glory delay. Berth 3 ready for Atlantic Trader arrival. Weather conditions optimal. All equipment operational.',
    timestamp: '14:15',
    priority: 'low',
    processed: true
  },
  {
    id: 'msg-5',
    channel: 'email',
    from: 'cargo@orientalstar.com',
    subject: 'Container Loading Progress Update',
    content: 'Port Operations, Oriental Star container loading at Berth 1 proceeding on schedule. 3,200 of 4,200 TEU loaded. Estimated completion: 01:30 tomorrow. No issues or delays. Crane operations efficient. Request final documentation be prepared for 02:00 departure.',
    timestamp: '13:20',
    priority: 'low',
    processed: true
  },
  {
    id: 'msg-6',
    channel: 'email',
    from: 'customs@portauthority.com',
    subject: 'Customs Clearance - MSC Horizon',
    content: 'MSC Horizon customs pre-clearance approved. All documentation in order. Cargo manifest verified. Ready for immediate processing upon berthing. No holds or inspections required. Estimated clearance time: 15 minutes post-berthing.',
    timestamp: '13:30',
    priority: 'medium',
    processed: false
  },

  // WhatsApp Messages
  {
    id: 'msg-7',
    channel: 'whatsapp',
    from: 'Pilot Team A - Rodriguez',
    subject: 'Quick update needed',
    content: 'Hey, standing by for Pacific Glory but heard about engine issue? Should I head to MSC Horizon instead? Need confirmation ASAP 👍',
    timestamp: '13:50',
    priority: 'high',
    processed: true
  },
  {
    id: 'msg-8',
    channel: 'whatsapp',
    from: 'Tug Atlas - Captain Mike',
    subject: 'Reassignment confirmed',
    content: 'Got the update. Moving from Pacific Glory standby to MSC Horizon. ETA to boarding point 14:00. Crew ready ⚓',
    timestamp: '13:53',
    priority: 'medium',
    processed: true
  },
  {
    id: 'msg-9',
    channel: 'whatsapp',
    from: 'Crane Operator Beta',
    subject: 'Ready for MSC Horizon',
    content: 'Crane Beta ready at Berth 2. Equipment check done. Team briefed on early arrival. All systems go 🏗️',
    timestamp: '13:55',
    priority: 'medium',
    processed: true
  },
  {
    id: 'msg-10',
    channel: 'whatsapp',
    from: 'Pilot Team B - Chen',
    subject: 'Atlantic Trader boarding',
    content: 'Confirmed for Atlantic Trader at 17:45. Weather looks good. Will board at standard approach point 🌊',
    timestamp: '14:25',
    priority: 'low',
    processed: false
  },
  {
    id: 'msg-11',
    channel: 'whatsapp',
    from: 'Line Handler Team 3',
    subject: 'Shift coverage',
    content: 'We can cover the early MSC Horizon berthing. Team is already on site. No overtime needed 💪',
    timestamp: '13:58',
    priority: 'low',
    processed: true
  },
  {
    id: 'msg-12',
    channel: 'whatsapp',
    from: 'Tug Neptune - Captain Sarah',
    subject: 'Atlantic Trader assignment',
    content: 'Neptune ready for 17:45 Atlantic Trader assist. Checked the vessel specs - bulk carrier, should be straightforward operation ✅',
    timestamp: '14:35',
    priority: 'medium',
    processed: false
  },
  {
    id: 'msg-13',
    channel: 'whatsapp',
    from: 'Berthing Master',
    subject: 'Berth 2 prep complete',
    content: 'Berth 2 inspection done. All fenders checked, bollards secure. Ready for MSC Horizon 🎯',
    timestamp: '14:00',
    priority: 'medium',
    processed: true
  },
  {
    id: 'msg-14',
    channel: 'whatsapp',
    from: 'Fuel Services',
    subject: 'Bunkering schedule',
    content: 'Can we bunker Oriental Star tonight? Or should we wait until after departure? Let me know the best window ⛽',
    timestamp: '13:15',
    priority: 'low',
    processed: false
  },

  // Radio/Voice Messages
  {
    id: 'msg-15',
    channel: 'radio',
    from: 'VHF Ch 16 - Pacific Glory',
    subject: 'Emergency Communication',
    content: 'Port Authority, this is MV Pacific Glory. We are dead in the water. Main engine failure. Position 15 nautical miles southwest of harbor entrance. Requesting permission to delay berthing indefinitely. Standing by for tug assistance if required. Over.',
    timestamp: '13:48',
    priority: 'high',
    processed: true
  },
  {
    id: 'msg-16',
    channel: 'radio',
    from: 'VHF Ch 16 - MSC Horizon',
    subject: 'Early Arrival Confirmation',
    content: 'Port Authority, this is MSC Horizon. Confirming early arrival at Berth 2. New ETA 14:15. Reducing speed from 12 to 8 knots to match schedule. Ready to proceed with pilot boarding. Over.',
    timestamp: '13:52',
    priority: 'high',
    processed: true
  },
  {
    id: 'msg-17',
    channel: 'radio',
    from: 'VHF Ch 16 - Atlantic Trader',
    subject: 'Approach Update',
    content: 'Port Authority, Atlantic Trader on approach. Current position 8 miles out. ETA Berth 3: 18:00 confirmed. Cargo: 45,000 metric tons iron ore. Request berth preparation and crane assignment confirmation. Over.',
    timestamp: '14:30',
    priority: 'medium',
    processed: true
  },
  {
    id: 'msg-18',
    channel: 'radio',
    from: 'VHF Ch 12 - Pilot Station',
    subject: 'Pilot Dispatch Update',
    content: 'All vessels, Pilot Station. Team A reassigned to MSC Horizon, boarding at 14:10. Team B standing by for Atlantic Trader at 17:45. Team C available for evening operations. Out.',
    timestamp: '13:54',
    priority: 'medium',
    processed: true
  },
  {
    id: 'msg-19',
    channel: 'radio',
    from: 'VHF Ch 16 - Harbor Control',
    subject: 'Traffic Advisory',
    content: 'All vessels in harbor area. Traffic update: One vessel dead in water 15 miles southwest. Give wide berth to MV Pacific Glory. Berth 2 operations advancing to 14:15 for MSC Horizon. Maintain safe speed in harbor channels. Out.',
    timestamp: '13:51',
    priority: 'medium',
    processed: true
  },

  // AIS Data Messages
  {
    id: 'msg-20',
    channel: 'ais',
    from: 'AIS System',
    subject: 'MV Pacific Glory - Critical Status Change',
    content: 'MMSI: 431234567 | IMO: 9234567 | Position: 34.2°N, 118.5°W | Speed: 0.0 knots | Course: N/A | Status: Not Under Command | Timestamp: 13:46 UTC',
    timestamp: '13:46',
    priority: 'high',
    processed: true
  },
  {
    id: 'msg-21',
    channel: 'ais',
    from: 'AIS System',
    subject: 'MSC Horizon - Speed Adjustment',
    content: 'MMSI: 211445821 | IMO: 9445821 | Position: 34.1°N, 118.3°W | Speed: 8.2 knots | Course: 045° | Status: Under Way Using Engine | ETA Updated: 14:15 | Timestamp: 13:53 UTC',
    timestamp: '13:53',
    priority: 'medium',
    processed: true
  },
  {
    id: 'msg-22',
    channel: 'ais',
    from: 'AIS System',
    subject: 'Atlantic Trader - On Schedule',
    content: 'MMSI: 232167234 | IMO: 9167234 | Position: 34.0°N, 118.2°W | Speed: 12.1 knots | Course: 020° | Status: Under Way Using Engine | ETA: 18:00 | Draught: 14.2m | Timestamp: 14:35 UTC',
    timestamp: '14:35',
    priority: 'low',
    processed: false
  },
  {
    id: 'msg-23',
    channel: 'ais',
    from: 'AIS System',
    subject: 'Oriental Star - Moored',
    content: 'MMSI: 477123456 | IMO: 9312456 | Position: 34.05°N, 118.25°W | Speed: 0.0 knots | Status: Moored | Berth: 1 | Operation: Cargo Ops | Timestamp: 14:00 UTC',
    timestamp: '14:00',
    priority: 'low',
    processed: true
  },
  {
    id: 'msg-24',
    channel: 'ais',
    from: 'AIS System',
    subject: 'Tug Atlas - In Transit',
    content: 'MMSI: 338901234 | Call Sign: TUGA | Position: 34.08°N, 118.28°W | Speed: 8.5 knots | Course: 225° | Status: Engaged in Towing | Assignment: MSC Horizon | Timestamp: 13:55 UTC',
    timestamp: '13:55',
    priority: 'low',
    processed: true
  },
  {
    id: 'msg-25',
    channel: 'ais',
    from: 'AIS System',
    subject: 'Tug Neptune - Standby',
    content: 'MMSI: 338901567 | Call Sign: TUGN | Position: 34.06°N, 118.26°W | Speed: 0.5 knots | Course: 180° | Status: Restricted Maneuverability | Assignment: Atlantic Trader (Scheduled) | Timestamp: 14:32 UTC',
    timestamp: '14:32',
    priority: 'low',
    processed: false
  },
  {
    id: 'msg-26',
    channel: 'ais',
    from: 'AIS System',
    subject: 'Vessel Traffic Summary',
    content: 'Total Active Vessels: 7 | Inbound: 2 | Outbound: 0 | Moored: 1 | Anchored: 1 | Service Vessels: 3 | Traffic Density: Moderate | Last Update: 14:40 UTC',
    timestamp: '14:40',
    priority: 'low',
    processed: false
  },
  {
    id: 'msg-27',
    channel: 'ais',
    from: 'AIS System',
    subject: 'MSC Horizon - Approaching Pilot Station',
    content: 'MMSI: 211445821 | IMO: 9445821 | Position: 34.12°N, 118.29°W | Speed: 7.8 knots | Course: 048° | Distance to Pilot Boarding: 2.1 nm | ETA Pilot Boarding: 14:10 | Timestamp: 14:05 UTC',
    timestamp: '14:05',
    priority: 'medium',
    processed: false
  }
];

export const alerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'critical',
    title: 'Schedule Disruption Detected',
    description: 'MV Pacific Glory engine failure creates Berth 2 availability window',
    timestamp: 'Nov 7, 13:47',
    relatedEntities: ['MV Pacific Glory', 'Berth 2', 'MSC Horizon'],
    aiInsight: 'AI Analysis: MSC Horizon can advance schedule by 2.5 hours. Potential savings: $45,000 in port delays + $28,000 in fuel for MSC Horizon. Berth utilization optimized.',
    suggestedAction: 'Offer early berthing to MSC Horizon'
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Resource Reallocation Required',
    description: 'Tugboats and crane operators need schedule update',
    timestamp: 'Nov 7, 13:48',
    relatedEntities: ['Tug-2', 'Crane-2', 'Pilot Team'],
    aiInsight: 'AI Analysis: Current resources allocated to Pacific Glory can be reassigned to MSC Horizon with 15-minute notice window.',
    suggestedAction: 'Notify operational teams'
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'Weather Window Optimal',
    description: 'Current conditions favorable for MSC Horizon early berthing',
    timestamp: 'Nov 7, 13:49',
    relatedEntities: ['MSC Horizon', 'Weather System'],
    aiInsight: 'AI Analysis: Sea conditions optimal for next 4 hours. Wind: 8 knots, Visibility: 10nm. Ideal for safe berthing operations.',
    suggestedAction: 'Proceed with schedule change'
  },
  {
    id: 'alert-4',
    type: 'critical',
    title: 'Main Engine Failure',
    description: 'MV Pacific Glory experiencing critical mechanical failure 15nm from port',
    timestamp: 'Nov 5, 09:23',
    relatedEntities: ['MV Pacific Glory', 'Engineering Team'],
    aiInsight: 'AI Analysis: Engine cylinder 4 failure. Vessel dead in water. Immediate tug assistance may be required. Cargo includes time-sensitive perishables worth $2.3M.',
    suggestedAction: 'Dispatch emergency tug support'
  },
  {
    id: 'alert-5',
    type: 'warning',
    title: 'Delayed Customs Clearance',
    description: 'Documentation issues for Nordic Star causing 3-hour delay',
    timestamp: 'Nov 4, 16:45',
    relatedEntities: ['Nordic Star', 'Customs', 'Berth 1'],
    aiInsight: 'AI Analysis: Missing phytosanitary certificates for agricultural cargo. Additional inspection required. Delay impact: $12,000 in port fees.',
    suggestedAction: 'Contact agent for urgent documentation'
  },
  {
    id: 'alert-6',
    type: 'warning',
    title: 'Crane Maintenance Alert',
    description: 'Crane Alpha showing hydraulic pressure anomaly',
    timestamp: 'Nov 6, 11:20',
    relatedEntities: ['Crane Alpha', 'Berth 1', 'Maintenance Team'],
    aiInsight: 'AI Analysis: Hydraulic system pressure drop detected. Preventive maintenance recommended within 24 hours to avoid operational failure.',
    suggestedAction: 'Schedule immediate inspection'
  },
  {
    id: 'alert-7',
    type: 'info',
    title: 'Optimal Tide Window',
    description: 'High tide at 06:00 tomorrow ideal for large vessel operations',
    timestamp: 'Nov 6, 18:00',
    relatedEntities: ['Tidal System', 'Deep Draft Vessels'],
    aiInsight: 'AI Analysis: Maximum water depth of 18.5m available. Perfect window for Atlantic Voyager (16.8m draft) berthing operations.',
    suggestedAction: 'Schedule deep draft vessels accordingly'
  },
  {
    id: 'alert-8',
    type: 'critical',
    title: 'Security Breach Detected',
    description: 'Unauthorized vessel detected in restricted zone',
    timestamp: 'Nov 1, 22:15',
    relatedEntities: ['Port Security', 'Zone C'],
    aiInsight: 'AI Analysis: Small craft entered restricted area near fuel depot. AIS transponder not broadcasting. Security team dispatched.',
    suggestedAction: 'Immediate security response required'
  },
  {
    id: 'alert-9',
    type: 'warning',
    title: 'Weather Advisory',
    description: 'Strong winds expected in 6 hours affecting berthing operations',
    timestamp: 'Oct 30, 14:30',
    relatedEntities: ['Weather System', 'All Berths'],
    aiInsight: 'AI Analysis: Wind gusts up to 35 knots forecast. Recommend expediting current operations and delaying new arrivals by 4 hours.',
    suggestedAction: 'Alert all vessels and reschedule accordingly'
  },
  {
    id: 'alert-10',
    type: 'info',
    title: 'Berth Optimization Success',
    description: 'AI-suggested schedule change saved 4 hours of waiting time',
    timestamp: 'Oct 28, 10:15',
    relatedEntities: ['Oriental Express', 'Berth 3'],
    aiInsight: 'AI Analysis: Early departure of previous vessel created opportunity. Oriental Express advanced by 4 hours. Total savings: $38,000.',
    suggestedAction: 'Continue AI-driven optimization'
  }
];

export const workflowTickets: WorkflowTicket[] = [
  {
    id: 'wf-1',
    type: 'email',
    recipient: 'captain@mschorizon.com',
    subject: 'Early Berthing Opportunity - Berth 2 Available',
    status: 'sent',
    priority: 'high',
    timestamp: '13:50',
    content: 'Captain, due to an unexpected schedule change, Berth 2 is now available for early berthing at 14:00 instead of your scheduled 16:30. This advancement would save approximately 2.5 hours of waiting time and associated costs. Please confirm if you can advance your arrival.',
    triggeredBy: 'AI Schedule Optimizer'
  },
  {
    id: 'wf-2',
    type: 'email',
    recipient: 'tugboat-ops@portauthority.com',
    subject: 'Tugboat Reassignment - MSC Horizon Priority',
    status: 'sent',
    priority: 'high',
    timestamp: '13:51',
    content: 'Tugboat Team, please reassign Tug-2 from standby for Pacific Glory to MSC Horizon berthing operation at Berth 2, new ETA 14:15. Pacific Glory operation postponed indefinitely due to engine failure.',
    triggeredBy: 'AI Operations Manager'
  },
  {
    id: 'wf-3',
    type: 'email',
    recipient: 'crane-ops@portauthority.com',
    subject: 'Crane Schedule Update - MSC Horizon Advanced',
    status: 'pending',
    priority: 'medium',
    timestamp: '13:52',
    content: 'Crane Operations, Crane-2 at Berth 2 should be prepared for MSC Horizon container operations beginning approximately 14:30. Please confirm crew availability and equipment readiness.',
    triggeredBy: 'AI Operations Manager'
  },
  {
    id: 'wf-4',
    type: 'notification',
    recipient: 'pilot-team@portauthority.com',
    subject: 'Pilot Assignment Change - MSC Horizon Now Priority',
    status: 'pending',
    priority: 'high',
    timestamp: '13:52',
    content: 'Pilot Team, please redirect pilot services from Pacific Glory (delayed) to MSC Horizon for Berth 2 berthing operation at 14:15. Pilot boarding point remains standard approach.',
    triggeredBy: 'AI Operations Manager'
  }
];

export const chatHistory = [
  {
    role: 'assistant',
    content: 'Critical schedule optimization completed. MSC Horizon has been offered early berthing at Berth 2. Estimated savings: $73,000 across all stakeholders.',
    timestamp: '13:50'
  }
];
