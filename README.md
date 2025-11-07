# HelmStream
Amazon Hackathon Nov '25 - Maritime Operations Orchestrator

AWS Bedrock Hackathon Project - An intelligent maritime workflow automation system with agentic AI and RAG-powered Gmail integration.

## Port Operations Dashboard

This is the frontend dashboard for the HelmStream system. The original design is available at https://www.figma.com/design/ih1E4akcAbHEqJKoobMwys/Port-Operations-Dashboard.

### Running the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at http://localhost:3000/

### Features

- **AI-Powered Chatbot**: Integrated with AWS Bedrock LLM for intelligent maritime queries
- **Real-time Dashboard**: Monitor vessel status, berth availability, and port operations
- **Communication Hub**: Manage communications across Email, WhatsApp, Radio, and AIS
- **AI Insights & Alerts**: Automated alerts and AI-generated insights
- **Workflow Management**: Track and manage automated maritime workflows

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

## Technology Stack

- **Frontend**: React 18 + TypeScript with Vite
  - Radix UI for accessible components
  - Tailwind CSS for styling
  - Recharts for data visualization
  - Lucide React for icons
- **Cloud**: AWS (Lambda, Bedrock, S3, DynamoDB, API Gateway, EventBridge, CloudWatch)
- **Language**: Python 3.11+
- **AI/ML**: Amazon Bedrock (Claude 3 Sonnet, Titan Embeddings)
- **Frameworks**:
  - **LangGraph**: Agentic workflow orchestration and state management
  - **LangChain**: RAG pipeline and prompt management
  - **boto3**: AWS SDK for Python
  - **google-api-python-client**: Gmail API integration

## Estimated Monthly Costs

**Assuming moderate usage:**
- AWS Lambda: $0 (within free tier)
- API Gateway: $0 (within free tier for first 12 months)
- S3: $0 (within 5GB free tier)
- DynamoDB: $0 (within 25GB free tier)
- CloudWatch: $0 (basic monitoring)
- **Amazon Bedrock**: ~$5-20 (variable based on token usage)

**Total MVP Cost: ~$5-30/month** (mostly Bedrock API usage)

## 📚 Documentation

All documentation is organized in the `docs/` folder:

### 📖 Setup Guides
- **[QUICKSTART.md](docs/setup/QUICKSTART.md)** - Quick setup guide
- **[SHIPYARD-SETUP.md](docs/setup/SHIPYARD-SETUP.md)** - Detailed shipyard email system setup

### 🎬 Demo & Presentation
- **[HACKATHON-DEMO.md](docs/demo/HACKATHON-DEMO.md)** - Complete 5-minute hackathon demo guide
- **[QUICK-REFERENCE.md](docs/demo/QUICK-REFERENCE.md)** - Quick reference card (print-friendly)
- **[POSTMAN-GUIDE.md](docs/demo/POSTMAN-GUIDE.md)** - Complete Postman testing guide
- **[POSTMAN-QUICKSTART.md](docs/demo/POSTMAN-QUICKSTART.md)** - 3-minute Postman setup

### 🔧 Technical Documentation
- **[architecture.md](docs/technical/architecture.md)** - System architecture and design
- **[CLAUDE.md](docs/technical/CLAUDE.md)** - Claude Code implementation details
- **[agent-implementation.md](docs/technical/agent-implementation.md)** - Agent design patterns

### 📊 Status & Reference
- **[SYSTEM-STATUS.md](docs/reference/SYSTEM-STATUS.md)** - Complete system status report
- **[FINAL-VERIFICATION.md](docs/reference/FINAL-VERIFICATION.md)** - System verification checklist

### 🔒 Security
- **[SECURITY-NOTES.md](SECURITY-NOTES.md)** - Security best practices and API key management

## Getting Started

### Quick Start (5 minutes)

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd HelmStream
   ```

2. **Set up AWS infrastructure**
   ```bash
   cd setup
   ./01_setup_aws_resources.sh
   ./02_deploy_lambda_functions.sh
   ./03_create_api_gateway.sh
   ./04_add_authentication.sh
   ```

3. **Ingest shipyard data**
   ```bash
   python3 ingest_shipyard_emails.py
   ```

4. **Test the system**
   ```bash
   python3 test_shipyard_queries.py
   python3 test_crisis_agent.py
   ```

5. **Start the frontend** (optional)
   ```bash
   npm install
   npm run dev
   ```

For detailed instructions, see [docs/setup/QUICKSTART.md](docs/setup/QUICKSTART.md)
