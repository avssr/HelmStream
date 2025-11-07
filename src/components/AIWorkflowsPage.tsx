import { useState, useEffect, useRef } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Bot, Calendar, AlertCircle, Shield, MessageSquare, DollarSign, Plus, GitBranch } from 'lucide-react';
import mermaid from 'mermaid';

export function AIWorkflowsPage() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number>(1);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20
      },
      themeVariables: {
        primaryColor: '#ddd6fe',
        primaryTextColor: '#1e1b4b',
        primaryBorderColor: '#7c3aed',
        lineColor: '#7c3aed',
        secondaryColor: '#fef3c7',
        tertiaryColor: '#d1fae5',
        noteTextColor: '#1e1b4b',
        noteBkgColor: '#fef3c7',
        noteBorderColor: '#f59e0b'
      }
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current && selectedWorkflow) {
        try {
          mermaidRef.current.innerHTML = '';
          const { svg } = await mermaid.render(
            `mermaid-${selectedWorkflowId}`,
            selectedWorkflow.mermaidDiagram
          );
          mermaidRef.current.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }
    };
    renderDiagram();
  }, [selectedWorkflowId]);

  const workflowTypes = [
    {
      id: 1,
      icon: Calendar,
      color: 'blue',
      name: 'Autonomous Dock Scheduler Agent',
      shortName: 'Dock Scheduler',
      description: 'Monitors operations autonomously, detects problems before they escalate, and coordinates multi-step workflows',
      capabilities: [
        'Real-time vessel monitoring',
        'Conflict detection',
        'Optimal resource allocation',
        'Multi-factor analysis',
        'Stakeholder notifications'
      ],
      mermaidDiagram: `flowchart TD
    A[Monitor Vessel Arrivals & Dock Status] --> B{Scheduling Conflict Detected?}
    B -->|No| Z1[End]
    B -->|Yes| C[Check Dock Availability, Priority, Weather]
    C --> D[Generate Allocation Options & Risk Scores]
    D --> E[Recommend Optimal Dock Allocation & Draft Email]
    E --> F{Human Approval?}
    F -->|Yes| G[Send Email & Update Schedule]
    F -->|No| H[Modify Recommendation & Retry Approval]
    H --> F
    
    style A fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style B fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style C fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style D fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
    style F fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style G fill:#d1fae5,stroke:#10b981,stroke-width:2px
    style H fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style Z1 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px`
    },
    {
      id: 2,
      icon: AlertCircle,
      color: 'orange',
      name: 'Conflict Resolution Agent',
      shortName: 'Conflict Resolver',
      description: 'Detects resource conflicts, retrieves similar past cases, and negotiates timeline adjustments',
      capabilities: [
        'Resource conflict detection',
        'Historical case retrieval',
        'Priority analysis',
        'Timeline negotiation',
        'Multi-party coordination'
      ],
      mermaidDiagram: `flowchart TD
    A[Monitor Resource Usage: Cranes, Crews, Equip] --> B{Conflict Detected?}
    B -->|No| Z1[End]
    B -->|Yes| C[Retrieve Similar Past Cases via RAG]
    C --> D[Identify Stakeholders & Priorities]
    D --> E[Auto-Negotiate Timeline Adjustments]
    E --> F[Update Schedule & Notify All Parties]
    
    style A fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style B fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style C fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style D fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style E fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style F fill:#d1fae5,stroke:#10b981,stroke-width:2px
    style Z1 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px`
    },
    {
      id: 3,
      icon: AlertCircle,
      color: 'red',
      name: 'Proactive Alert Agent',
      shortName: 'Alert Monitor',
      description: 'Monitors patterns for delays and scope expansions, detects cascading impacts before they happen',
      capabilities: [
        'Pattern recognition',
        'Cascade impact detection',
        'Financial calculation',
        'Early warning system',
        'Emergency protocols'
      ],
      mermaidDiagram: `flowchart TD
    A[Monitor Emails, Weather, Status Signals] --> B{Delay/Risk Pattern Detected?}
    B -->|No| Z1[End]
    B -->|Yes| C[Predict Operational Impact]
    C --> D[Calculate Cost Exposure: Demurrage, Idle Time]
    D --> E[Generate Early Warning Alert]
    E --> F{High Risk?}
    F -->|No| Z2[Alert Sent Only]
    F -->|Yes| G[Trigger Emergency Protocols]
    
    style A fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style B fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style C fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style D fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
    style F fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style G fill:#fee2e2,stroke:#ef4444,stroke-width:2px
    style Z1 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px
    style Z2 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px`
    },
    {
      id: 4,
      icon: Shield,
      color: 'green',
      name: 'Compliance & Documentation Agent',
      shortName: 'Compliance Monitor',
      description: 'Tracks protocols, detects missing documentation, and maintains comprehensive audit trails',
      capabilities: [
        'Protocol tracking',
        'Documentation verification',
        'Report generation',
        'Inspection scheduling',
        'Audit trail maintenance'
      ],
      mermaidDiagram: `flowchart TD
    A[Track Compliance Rules & Required Documents] --> B[Validate Certifications & Protocols]
    B --> C{All Docs Available?}
    C -->|Yes| D[Generate Compliance Report]
    C -->|No| E[Request Missing Documentation]
    E --> B
    D --> F[Schedule Inspection & Maintain Audit Trail]
    
    style A fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style B fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style C fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style D fill:#d1fae5,stroke:#10b981,stroke-width:2px
    style E fill:#fee2e2,stroke:#ef4444,stroke-width:2px
    style F fill:#d1fae5,stroke:#10b981,stroke-width:2px`
    },
    {
      id: 5,
      icon: MessageSquare,
      color: 'purple',
      name: 'Stakeholder Communication Agent',
      shortName: 'Communication Hub',
      description: 'Monitors queries, retrieves relevant context, and drafts intelligent responses',
      capabilities: [
        'Query monitoring',
        'Context retrieval',
        'Response generation',
        'Escalation management',
        'Communication logging'
      ],
      mermaidDiagram: `flowchart TD
    A[Monitor Incoming Stakeholder Queries] --> B[Retrieve Context via RAG]
    B --> C[Draft Structured Response]
    C --> D{Complex or Sensitive?}
    D -->|No| E[Send Response Automatically]
    D -->|Yes| F[Human Review & Edit]
    F --> E
    E --> G[Log Message & SLA Metrics]
    
    style A fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style B fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style C fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style D fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
    style F fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style G fill:#d1fae5,stroke:#10b981,stroke-width:2px`
    },
    {
      id: 6,
      icon: DollarSign,
      color: 'emerald',
      name: 'Cost Optimization Agent',
      shortName: 'Cost Optimizer',
      description: 'Analyzes utilization, identifies inefficiencies, and recommends optimizations',
      capabilities: [
        'Utilization analysis',
        'Inefficiency detection',
        'Optimization modeling',
        'ROI calculation',
        'Financial reporting'
      ],
      mermaidDiagram: `flowchart TD
    A[Analyze Dock Utilization & Resource Efficiency] --> B{Inefficiencies Detected?}
    B -->|No| Z1[End]
    B -->|Yes| C[Simulate Optimization Scenarios]
    C --> D[Calculate Savings & Impact Score]
    D --> E[Recommend Adjustments to Leadership]
    
    style A fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style B fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style C fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style D fill:#e9d5ff,stroke:#9333ea,stroke-width:2px
    style E fill:#d1fae5,stroke:#10b981,stroke-width:2px
    style Z1 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px`
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: { 
        bg: 'bg-blue-50', 
        bgDark: 'bg-blue-100',
        border: 'border-blue-200', 
        text: 'text-blue-900', 
        icon: 'text-blue-600', 
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        active: 'bg-blue-100 border-blue-400'
      },
      orange: { 
        bg: 'bg-orange-50', 
        bgDark: 'bg-orange-100',
        border: 'border-orange-200', 
        text: 'text-orange-900', 
        icon: 'text-orange-600', 
        badge: 'bg-orange-100 text-orange-800 border-orange-300',
        active: 'bg-orange-100 border-orange-400'
      },
      red: { 
        bg: 'bg-red-50', 
        bgDark: 'bg-red-100',
        border: 'border-red-200', 
        text: 'text-red-900', 
        icon: 'text-red-600', 
        badge: 'bg-red-100 text-red-800 border-red-300',
        active: 'bg-red-100 border-red-400'
      },
      green: { 
        bg: 'bg-green-50', 
        bgDark: 'bg-green-100',
        border: 'border-green-200', 
        text: 'text-green-900', 
        icon: 'text-green-600', 
        badge: 'bg-green-100 text-green-800 border-green-300',
        active: 'bg-green-100 border-green-400'
      },
      purple: { 
        bg: 'bg-purple-50', 
        bgDark: 'bg-purple-100',
        border: 'border-purple-200', 
        text: 'text-purple-900', 
        icon: 'text-purple-600', 
        badge: 'bg-purple-100 text-purple-800 border-purple-300',
        active: 'bg-purple-100 border-purple-400'
      },
      emerald: { 
        bg: 'bg-emerald-50', 
        bgDark: 'bg-emerald-100',
        border: 'border-emerald-200', 
        text: 'text-emerald-900', 
        icon: 'text-emerald-600', 
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        active: 'bg-emerald-100 border-emerald-400'
      }
    };
    return colors[color];
  };

  const selectedWorkflow = workflowTypes.find(w => w.id === selectedWorkflowId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-purple-600 rounded-xl shadow-lg">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl">Agentic AI Workflows</h1>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300 text-lg px-4 py-1.5">
                    6 Active Agents
                  </Badge>
                </div>
                <p className="text-lg text-gray-600">
                  Autonomous AI agents that monitor operations, detect problems, and coordinate multi-step workflows
                </p>
              </div>
            </div>
            <Button className="gap-3 bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4 h-auto">
              <Plus className="h-6 w-6" />
              Create Custom Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Workflow List */}
        <div className="w-[450px] border-r bg-white flex-shrink-0">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-4">
              {workflowTypes.map((workflow) => {
                const Icon = workflow.icon;
                const colors = getColorClasses(workflow.color);
                const isActive = selectedWorkflowId === workflow.id;

                return (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflowId(workflow.id)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      isActive 
                        ? `${colors.active} shadow-lg` 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`p-3 rounded-xl ${colors.badge}`}>
                        <Icon className={`h-8 w-8 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg mb-2">{workflow.shortName}</h4>
                        <p className="text-base text-gray-600 line-clamp-2 mb-4">{workflow.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm px-2 py-1">
                            Agent #{workflow.id}
                          </Badge>
                          {isActive && (
                            <Badge className={`text-sm px-2 py-1 ${colors.badge}`}>
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Flowchart Diagram */}
        <div className="flex-1 overflow-hidden min-w-0 bg-white">
          <ScrollArea className="h-full">
            {selectedWorkflow && (() => {
              const Icon = selectedWorkflow.icon;
              const colors = getColorClasses(selectedWorkflow.color);

              return (
                <div className="p-12 max-w-[1400px]">
                  {/* Workflow Header */}
                  <div className={`p-10 rounded-2xl border-2 ${colors.border} ${colors.bg} mb-10`}>
                    <div className="flex items-start gap-8">
                      <div className={`p-5 rounded-2xl ${colors.badge} shadow-md`}>
                        <Icon className={`h-16 w-16 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-4xl font-semibold ${colors.text} mb-4`}>
                          {selectedWorkflow.name}
                        </h3>
                        <p className={`text-xl ${colors.text} opacity-80 mb-6`}>
                          {selectedWorkflow.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {selectedWorkflow.capabilities.map((cap, idx) => (
                            <Badge key={idx} variant="outline" className={`text-base px-4 py-1.5 ${colors.badge}`}>
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flowchart Title */}
                  <div className="mb-10">
                    <h4 className="text-3xl font-semibold mb-4 flex items-center gap-4">
                      <GitBranch className="h-8 w-8 text-purple-600" />
                      Workflow Decision Tree
                    </h4>
                    <p className="text-lg text-gray-600">
                      Visual representation of the AI agent's decision-making process and automation logic
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-6 mb-10 p-6 bg-gray-50 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 rounded"></div>
                      <span className="text-base font-medium">Trigger</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 rounded rotate-45"></div>
                      <span className="text-base font-medium">Decision</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 border-2 border-purple-500 rounded"></div>
                      <span className="text-base font-medium">Process</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
                      <span className="text-base font-medium">Action</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-100 border-2 border-gray-500 rounded-full"></div>
                      <span className="text-base font-medium">End</span>
                    </div>
                  </div>

                  {/* Mermaid Flowchart */}
                  <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
                    <div 
                      ref={mermaidRef}
                      className="flex justify-center items-center min-h-[400px]"
                    />
                  </div>
                </div>
              );
            })()}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
