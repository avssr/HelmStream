# HelmStream
Amazon Hackathon Nov '25 - Maritime Operations Orchestrator

AWS Bedrock Hackathon Project - An intelligent maritime workflow automation system with agentic AI and RAG-powered Gmail integration.

## Architecture Overview

This MVP leverages AWS free tier services to minimize costs while providing powerful AI-driven capabilities for the maritime industry.

### Core Components

#### 1. Frontend Layer
- **Static Web Hosting**: S3 + CloudFront (or local React app)
- **Dashboard**: Real-time view of concurrent and forthcoming ship activities
- **AI Chat Interface**: Interactive chatbot powered by RAG for maritime queries
- **Historical Activity Log**: Comprehensive timeline of all ship activities
- **Document Viewer**: Display and manage documents related to ship operations
- **Alert System**: Real-time notifications for critical events
- **Financial/Operational Analytics**: Dashboard showing cost implications and operational metrics

#### 2. API Layer
- **AWS Lambda**: Serverless compute for all backend logic
- **API Gateway**: RESTful API endpoints (1M free requests/month)
- Python 3.11+ runtime for all Lambda functions

#### 3. AI/ML Layer
- **Amazon Bedrock**:
  - Claude 3 Sonnet for agentic workflows and reasoning
  - Titan Embeddings for RAG document embedding
  - No upfront costs, pay per token usage
- **LangGraph Integration**: Custom agent workflow orchestration with:
  - State machine for complex multi-step workflows
  - Conditional routing based on workflow context
  - Human-in-the-loop checkpoints
  - Workflow persistence and resumability
- **Agentic Capabilities**:
  - Autonomous workflow triggering based on events (emails, schedules, alerts)
  - Multi-step reasoning with tool use (Gmail, S3, calculations)
  - Dynamic decision-making for maritime operations

#### 4. RAG Pipeline
- **Document Storage**: S3 (5GB free tier)
- **Vector Storage**: DynamoDB (25GB free tier) for embeddings and metadata
- **Embedding Process**: Bedrock Titan Embeddings via Lambda
- **Retrieval**: Cosine similarity search in Lambda

#### 5. Gmail Integration with RAG
- **Gmail API**: OAuth 2.0 authentication for secure email access
- **RAG Chat API**: Intelligent email processing using:
  - Retrieval from historical emails and maritime documents
  - Context-aware response generation
  - Semantic search across email threads and attachments
- **Lambda Functions**: Email reading, parsing, and intelligent actions
- **DynamoDB**: Store email state, conversation history, and action logs

#### 6. Data Storage
- **S3 Buckets**:
  - Maritime documents (invoices, bills of lading, certificates, compliance docs)
  - Email attachments
  - Historical reports and analytics
  - System logs
- **DynamoDB Tables**:
  - Ship activities (historical log with timestamps)
  - Concurrent and forthcoming activities
  - Alerts and notifications
  - Financial data (cost tracking, operational expenses)
  - Workflow states (LangGraph state persistence)
  - Vector embeddings (documents and emails)
  - Email action logs and conversation history
  - User profiles and preferences

#### 7. Orchestration
- **AWS Lambda + EventBridge**: Scheduled workflow checks
- **Step Functions** (optional): Complex multi-step workflows (4,000 free transitions/month)

## Free Tier Services Used

| Service | Free Tier Limit | Usage |
|---------|----------------|-------|
| AWS Lambda | 1M requests/month, 400K GB-seconds | API handlers, RAG processing |
| API Gateway | 1M calls/month (12 months) | REST endpoints |
| S3 | 5GB storage, 20K GET, 2K PUT | Document storage |
| DynamoDB | 25GB storage, 25 RCU/WCU | Metadata, embeddings |
| CloudWatch | 5GB logs, 10 custom metrics | Monitoring |
| Amazon Bedrock | Pay-per-use (no free tier) | LLM inference, embeddings |

## Cost Optimization Strategies

1. **Lambda Functions**: Keep memory allocation minimal (512MB-1024MB)
2. **Bedrock Usage**: Cache common queries, use smaller models for simple tasks
3. **S3**: Enable lifecycle policies, compress documents
4. **DynamoDB**: On-demand pricing for unpredictable workloads
5. **Vector Search**: Simple cosine similarity in-memory vs. OpenSearch Serverless (expensive)

## Key Features

### Frontend Features

#### 1. Activity Dashboard
- **Concurrent Activities**: Real-time view of ongoing ship operations
- **Forthcoming Activities**: Scheduled and predicted upcoming tasks
- **Timeline View**: Visual representation of activity sequences
- **Status Tracking**: Live updates on workflow progress
- **Filtering & Search**: Quick access to specific activities by ship, type, or date

#### 2. AI Chat Interface
- **Natural Language Queries**: Ask questions about any maritime operation
- **RAG-Powered Responses**: Answers grounded in your documents and emails
- **Multi-Turn Conversations**: Context-aware dialogue with memory
- **Document References**: Citations and links to source documents
- **Email Integration**: Query and interact with Gmail data seamlessly

#### 3. Historical Activity Log
- **Comprehensive Timeline**: Complete history of all ship activities
- **Activity Details**: Full context including documents, emails, and decisions
- **Search & Filter**: Find historical activities by multiple criteria
- **Audit Trail**: Track who did what and when
- **Export Capabilities**: Download logs for compliance and reporting

#### 4. Document Management
- **Centralized Repository**: All maritime documents in one place
- **Smart Categorization**: AI-powered document classification
- **Quick Preview**: View documents without downloading
- **Version Control**: Track document changes over time
- **Linked Activities**: See which activities reference each document

#### 5. Alert System
- **Real-Time Notifications**: Instant alerts for critical events
- **Alert Types**:
  - Compliance deadlines approaching
  - Document expiration warnings
  - Workflow failures or delays
  - Financial threshold breaches
  - Unusual email activity
- **Customizable Rules**: Configure alert conditions per user/role
- **Multi-Channel**: In-app, email, and dashboard notifications

#### 6. Financial & Operational Analytics
- **Cost Tracking**: Real-time operational expense monitoring
- **Budget Alerts**: Notifications when costs approach thresholds
- **Financial Implications**: Automatic cost calculation for workflows
- **Operational Metrics**: KPIs for efficiency and performance
- **Trend Analysis**: Historical cost and performance trends
- **Custom Reports**: Generate financial summaries on demand

### Backend Features

#### 1. Agentic AI Workflow Engine
- **LangGraph-Powered**: Complex state machine for workflow orchestration
- **Autonomous Triggering**: Workflows start automatically based on:
  - Incoming emails (invoices, requests, notifications)
  - Scheduled events (compliance checks, renewals)
  - Alert conditions (cost thresholds, deadlines)
  - External API triggers
- **Multi-Step Reasoning**: Claude 3 Sonnet for complex decision-making
- **Tool Integration**:
  - Gmail API (send/receive/search emails)
  - S3 operations (read/write documents)
  - DynamoDB queries (retrieve historical data)
  - Financial calculators (cost implications)
- **Human-in-the-Loop**: Pause workflows for approval when needed
- **State Persistence**: Resume interrupted workflows seamlessly

#### 2. RAG Chat API (Gmail Integration)
- **Intelligent Email Processing**:
  - Semantic search across all emails and attachments
  - Context retrieval from maritime documents
  - Generate responses based on historical data
- **Email Automation**:
  - Monitor inbox for maritime-related emails
  - Classify emails by type (invoice, inquiry, alert, routine)
  - Extract structured data (dates, amounts, vessel info)
  - Automatically file attachments to S3
  - Generate and send intelligent responses
  - Update workflow states based on email content
- **Conversation Memory**: Track email threads for contextual responses
- **Multi-Source RAG**: Combine email data with document repository

#### 3. File Storage & Management
- **S3-Based Storage**: Scalable, durable document storage
- **Automatic Organization**: AI-powered folder structure
- **Embedding Generation**: Vector embeddings for semantic search
- **Metadata Extraction**: Automatically parse document metadata
- **Access Control**: Role-based document permissions
- **Lifecycle Policies**: Automatic archival of old documents

#### 4. LangGraph Custom Workflows
- **Visual Workflow Designer** (future): Define custom maritime workflows
- **Conditional Logic**: Branch workflows based on data or AI decisions
- **Parallel Execution**: Run multiple tasks concurrently
- **Error Handling**: Retry logic and fallback strategies
- **Workflow Templates**: Pre-built patterns for common operations:
  - Vessel clearance process
  - Invoice processing and approval
  - Compliance document renewal
  - Port authority communication
  - Crew change coordination

## Data Flow

1. **Document Ingestion**:
   - Upload maritime docs to S3
   - Lambda triggers embedding generation via Bedrock
   - Store vectors in DynamoDB with metadata

2. **RAG Query**:
   - User sends query via API Gateway
   - Lambda generates query embedding
   - Retrieve top-k similar documents from DynamoDB
   - Bedrock Claude generates response with context
   - Return to user

3. **Gmail Workflow**:
   - EventBridge triggers Lambda periodically
   - Fetch new emails via Gmail API
   - Agent analyzes email content with Bedrock
   - Execute actions (file documents, send responses, update DB)
   - Log actions to DynamoDB

4. **Agentic Workflow**:
   - User initiates workflow via API
   - Lambda invokes Bedrock with tools (Gmail, S3, calculations)
   - Agent performs multi-step reasoning
   - Execute actions autonomously
   - Return results to user

## Security Considerations

- Gmail OAuth tokens stored encrypted in DynamoDB
- S3 bucket policies restrict public access
- API Gateway with API keys/Cognito authentication
- Lambda execution roles with minimal IAM permissions
- VPC endpoints for private AWS service communication (optional)

## Estimated Monthly Costs

**Assuming moderate usage:**
- AWS Lambda: $0 (within free tier)
- API Gateway: $0 (within free tier for first 12 months)
- S3: $0 (within 5GB free tier)
- DynamoDB: $0 (within 25GB free tier)
- CloudWatch: $0 (basic monitoring)
- **Amazon Bedrock**: ~$5-20 (variable based on token usage)
  - Claude 3 Sonnet: ~$3/MTok input, ~$15/MTok output
  - Titan Embeddings: ~$0.10/MTok

**Total MVP Cost: ~$5-30/month** (mostly Bedrock API usage)

## Getting Started

1. Set up AWS account and configure free tier alerts
2. Deploy infrastructure using AWS SAM or CDK
3. Configure Gmail API credentials
4. Upload maritime domain documents to S3
5. Test RAG pipeline with sample queries
6. Configure agentic workflows
7. Monitor costs in AWS Cost Explorer

## Technology Stack

- **Cloud**: AWS (Lambda, Bedrock, S3, DynamoDB, API Gateway, EventBridge, CloudWatch)
- **Language**: Python 3.11+
- **AI/ML**: Amazon Bedrock (Claude 3 Sonnet, Titan Embeddings)
- **Frameworks**:
  - **LangGraph**: Agentic workflow orchestration and state management
  - **LangChain**: RAG pipeline and prompt management
  - **boto3**: AWS SDK for Python
  - **google-api-python-client**: Gmail API integration
  - **pandas**: Financial data analysis
  - **numpy**: Vector operations and cosine similarity
- **Frontend**: React.js (recommended) with:
  - Recharts/Chart.js for analytics visualization
  - Socket.io (optional) for real-time updates
  - Material-UI or Tailwind CSS for UI components
- **Vector Search**: NumPy cosine similarity (MVP), upgradeable to OpenSearch

## Architecture Diagram

See `architecture.md` for a detailed visual representation of the system architecture.

## Future Enhancements

- Add Amazon Cognito for user authentication
- Implement WebSocket API for real-time updates
- Add Amazon Textract for OCR of scanned documents
- Scale to Amazon OpenSearch for production vector search
- Add multi-language support
- Implement workflow analytics dashboard
