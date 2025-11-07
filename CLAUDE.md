# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HelmStream** is a maritime workflow automation system for the AWS Bedrock Hackathon (Nov '25). The application uses agentic AI to automate maritime operations workflows and provides RAG-powered Gmail integration for intelligent email processing.

### Core Technologies
- **Cloud Platform**: AWS (Lambda, Bedrock, S3, DynamoDB, API Gateway, EventBridge)
- **AI/ML**: Amazon Bedrock (Claude 3 Sonnet, Titan Embeddings)
- **Orchestration**: LangGraph for agentic workflow state machines
- **Backend**: Python 3.11+ with boto3, LangChain, google-api-python-client
- **Frontend**: React.js with Recharts/Chart.js for analytics
- **Vector Storage**: DynamoDB with NumPy cosine similarity (MVP)

### Cost Optimization Goal
The architecture is designed to stay within AWS free tier limits. Target: **$3-10/month** (primarily Bedrock API usage).

## Architecture

### High-Level System Design

The system follows a serverless, event-driven architecture:

1. **Frontend Layer**: 6 main components
   - Activity Dashboard (concurrent/forthcoming ship activities)
   - AI Chat Interface (RAG-powered)
   - Historical Activity Log
   - Document Viewer
   - Alert System
   - Financial Analytics

2. **API Layer**: API Gateway → Lambda functions (Python)

3. **Compute Layer**: 9 Lambda functions
   - `api_handler`: Main router (512MB, 30s timeout)
   - `document_processor`: Doc ingestion + embeddings (1024MB, 300s)
   - `email_processor`: Gmail sync + RAG processing (1024MB, 300s)
   - `rag_engine`: Query processing (1024MB, 60s)
   - `agentic_workflow`: LangGraph workflows (2048MB, 900s)
   - `activity_manager`: Ship activities CRUD (512MB, 30s)
   - `alert_engine`: Alert rules evaluation (512MB, 60s)
   - `financial_analytics`: Cost tracking (512MB, 30s)
   - `historical_logger`: Activity audit trail (256MB, 15s)

4. **AI/ML Layer**:
   - Amazon Bedrock for LLM inference (Claude 3 Sonnet)
   - Titan Embeddings for vector generation (768 dimensions)
   - LangGraph for workflow orchestration with state persistence

5. **Storage Layer**:
   - **S3**: Maritime documents, email attachments, reports
   - **DynamoDB**: 9 tables including ship-activities, alerts, financial-data, workflow-states (with LangGraph checkpoints), email-embeddings

6. **Orchestration**: EventBridge rules for scheduled triggers (email sync every 5min, alerts every 1min)

See `architecture.md` for detailed sequence diagrams, data models, and API specifications.

## LangGraph Workflow Architecture

The agentic workflow engine uses LangGraph state machines with 4 primary workflow types:

1. **Invoice Processing**: Extract → Validate → Calculate → Budget Check → Approve/Alert → Store → Notify
2. **Compliance Check**: Fetch Docs → Validate → Submit/Alert → Track Deadline
3. **Email Response**: RAG Search → Generate → Review → Send → Log
4. **Custom Workflows**: Claude agentic reasoning with tool use (Gmail, S3, DynamoDB, calculators)

**Key Features**:
- Conditional routing based on context
- Human-in-the-loop checkpoints (orange nodes in state diagram)
- State persistence in DynamoDB for workflow resumability
- Autonomous decision-making with Claude 3 Sonnet

## Data Models

### Critical DynamoDB Tables

All tables use partition keys optimally for query patterns:

1. **ship-activities**: Core activity tracking with GSI `status-timeline-index` for concurrent/forthcoming queries
2. **alerts**: Multi-severity alerting with customizable rules
3. **financial-data**: Budget tracking with operational expense categorization
4. **workflow-states**: LangGraph checkpoint persistence with state history
5. **email-embeddings**: RAG support for Gmail with 768-dim Titan embeddings
6. **historical-activity-log**: Time-series audit trail with optional TTL

See `architecture.md` section "Data Models" for complete schemas.

## Development Workflow

### When Building Lambda Functions

1. **Memory allocation**: Follow the Lambda Function Mapping table in `architecture.md`
   - Most handlers: 512MB
   - Document/email processing: 1024MB
   - Agentic workflows: 2048MB (complex reasoning)

2. **Timeout configuration**: Set according to function purpose
   - CRUD operations: 30s
   - RAG queries: 60s
   - Workflow execution: 900s (15min max)

3. **Environment variables**: Store in AWS Secrets Manager
   - Gmail OAuth tokens (encrypted)
   - Bedrock configuration
   - DynamoDB table names

4. **Lambda layers**: Use shared layers to reduce deployment size
   - `langgraph_layer`: LangGraph + LangChain
   - `aws_sdk_layer`: boto3 + extras
   - `common_utils`: Shared utilities

### RAG Pipeline Implementation

The RAG system combines documents and emails:

1. **Embedding generation**: Use Bedrock Titan (768 dimensions)
2. **Storage**: DynamoDB with embedding arrays
3. **Retrieval**: In-memory cosine similarity using NumPy (avoid OpenSearch costs)
4. **Context window**: Top-K matching documents (typically K=5)
5. **Response generation**: Claude 3 Sonnet with retrieved context

**Multi-source RAG**: Query both `maritime-documents` and `email-embeddings` tables, combine results by relevance score.

### Gmail Integration

1. **Authentication**: OAuth 2.0 with tokens stored encrypted in DynamoDB
2. **Sync frequency**: EventBridge trigger every 5 minutes
3. **Email classification**: Use Claude 3 Sonnet to classify (invoice, inquiry, alert, routine)
4. **Entity extraction**: Parse vessel names, amounts, dates, currencies
5. **Automatic actions**: File attachments to S3, create activities, send responses

### Alert System

**Rule evaluation flow**:
- EventBridge triggers alert_engine Lambda every 1 minute
- Query activities & financial data from DynamoDB
- Evaluate custom rules (compliance deadlines, budget thresholds, workflow failures)
- Create alert records and notify via multiple channels

**Alert types**:
- Compliance deadlines (X days before expiration)
- Document expiration warnings
- Financial threshold breaches
- Workflow failures/delays
- Unusual email activity patterns

## API Design

All APIs follow RESTful conventions. See `architecture.md` for 60+ endpoint specifications across 9 categories.

**Key endpoints**:
- `POST /api/v1/chat/query`: RAG chat with conversation memory
- `GET /api/v1/activities/concurrent`: Real-time ongoing activities
- `GET /api/v1/activities/forthcoming`: Scheduled future activities
- `POST /api/v1/workflows`: Trigger LangGraph workflows
- `GET /api/v1/analytics/financial`: Financial summaries with AI insights

**Response format**: Consistent JSON with pagination for list endpoints:
```json
{
  "data": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150
  }
}
```

## Deployment

### Infrastructure as Code

Use AWS SAM (Serverless Application Model) for deployment:

```
infrastructure/
├── lambda/               # Function code by service
├── layers/              # Shared dependencies
├── frontend/            # React app
├── dynamodb/            # Table definitions
├── eventbridge/         # Scheduled rules
├── template.yaml        # SAM template
└── samconfig.toml       # Deployment config
```

**Deployment commands** (when implemented):
```bash
sam build
sam deploy --guided  # First time
sam deploy           # Subsequent deploys
```

### AWS Resource Configuration

1. **Bedrock**: Request model access for `anthropic.claude-3-sonnet-20240229-v1:0` and `amazon.titan-embed-text-v1`
2. **DynamoDB**: Use on-demand pricing mode for unpredictable workloads
3. **S3**: Enable versioning and lifecycle policies
4. **EventBridge**: Configure rules with appropriate rate expressions
5. **CloudWatch**: Set up billing alarms for free tier limits

## Security Considerations

- **IAM Roles**: Least privilege principle for all Lambda execution roles
- **API Gateway**: Use API keys or Cognito authentication (future)
- **S3 Buckets**: Block public access, use signed URLs for document downloads
- **OAuth Tokens**: Encrypt at rest in DynamoDB using KMS
- **VPC**: Optional VPC endpoints for private AWS service communication

## Cost Monitoring

Track these metrics to stay within budget:

1. **Bedrock token usage**: Primary cost driver (~$3-10/month)
   - Claude 3 Sonnet: $3/MTok input, $15/MTok output
   - Titan Embeddings: $0.10/MTok
2. **Lambda invocations**: Stay under 1M/month free tier
3. **DynamoDB**: Monitor RCU/WCU usage (25 free)
4. **S3**: Track storage (5GB free) and requests
5. **API Gateway**: Monitor calls (1M free for 12 months)

Set CloudWatch alarms:
- Daily cost > $5
- Lambda error rate > 5%
- DynamoDB throttled requests > 0
- Gmail API quota > 80%

## Future Enhancements

Documented in `README.md`:
- Amazon Cognito for user authentication
- WebSocket API for real-time updates
- Amazon Textract for OCR of scanned documents
- Migration to OpenSearch for production vector search
- Multi-language support
- Workflow analytics dashboard

## Important Implementation Notes

1. **Vector similarity**: Use NumPy's cosine similarity instead of expensive OpenSearch for MVP
2. **Workflow state**: Always persist LangGraph checkpoints to DynamoDB for resumability
3. **Email attachments**: Store in S3 immediately upon receipt, reference by URI in DynamoDB
4. **Financial calculations**: Include exchange rate handling in financial-data metadata
5. **Activity timeline**: Use GSI `status-timeline-index` for efficient concurrent/forthcoming queries
6. **Human-in-the-loop**: Implement approval endpoints for workflows requiring human review

## Reference Documentation

- `README.md`: Full project overview, features, and getting started
- `architecture.md`: Detailed technical architecture, diagrams, data models, API specs
