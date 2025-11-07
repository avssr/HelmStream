# Agentic Port Operations – LangGraph Flow Diagrams

This document contains block flow diagrams for six autonomous agents used in port operational intelligence, represented in Mermaid syntax.

---

## 1. Autonomous Dock Scheduler Agent

```mermaid
flowchart TD
    A[Monitor Vessel Arrivals & Dock Status] --> B{Scheduling Conflict Detected?}
    B -- No --> Z1[End]
    B -- Yes --> C[Check Dock Availability, Priority, Weather]
    C --> D[Generate Allocation Options & Risk Scores]
    D --> E[Recommend Optimal Dock Allocation & Draft Email]
    E --> F{Human Approval?}
    F -- Yes --> G[Send Email & Update Schedule]
    F -- No --> H[Modify Recommendation & Retry Approval]
    H --> F
```

## 2. Conflict Resolution Agent

```mermaid
flowchart TD
    A[Monitor Resource Usage: Cranes, Crews, Equip] --> B{Conflict Detected?}
    B -- No --> Z1[End]
    B -- Yes --> C[Retrieve Similar Past Cases via RAG]
    C --> D[Identify Stakeholders & Priorities]
    D --> E[Auto-Negotiate Timeline Adjustments]
    E --> F[Update Schedule & Notify All Parties]
```

## 3. Proactive Alerts Agent

```mermaid
flowchart TD
    A[Monitor Emails, Weather, Status Signals] --> B{Delay/Risk Pattern Detected?}
    B -- No --> Z1[End]
    B -- Yes --> C[Predict Operational Impact]
    C --> D[Calculate Cost Exposure: Demurrage, Idle Time]
    D --> E[Generate Early Warning Alert]
    E --> F{High Risk?}
    F -- No --> Z2[Alert Sent Only]
    F -- Yes --> G[Trigger Emergency Protocols]
```

## 4. Compliance and Documentation Agent

```mermaid
flowchart TD
    A[Track Compliance Rules & Required Documents] --> B[Validate Certifications & Protocols]
    B --> C{All Docs Available?}
    C -- Yes --> D[Generate Compliance Report]
    C -- No --> E[Request Missing Documentation]
    E --> B
    D --> F[Schedule Inspection & Maintain Audit Trail]

```

## 5. Stakeholder Communication Agent

```mermaid
flowchart TD
    A[Monitor Incoming Stakeholder Queries] --> B[Retrieve Context via RAG]
    B --> C[Draft Structured Response]
    C --> D{Complex or Sensitive?}
    D -- No --> E[Send Response Automatically]
    D -- Yes --> F[Human Review & Edit]
    F --> E
    E --> G[Log Message & SLA Metrics]

```

## 6. Cost Optimization Agent

```mermaid
flowchart TD
    A[Analyze Dock Utilization & Resource Efficiency] --> B{Inefficiencies Detected?}
    B -- No --> Z1[End]
    B -- Yes --> C[Simulate Optimization Scenarios]
    C --> D[Calculate Savings & Impact Score]
    D --> E[Recommend Adjustments to Leadership]

```