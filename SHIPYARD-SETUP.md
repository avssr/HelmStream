# HelmStream - Shipyard Email Dataset Setup

**Based on:** `rag-docs/DATASET-MANIFEST.md`
**Dataset:** 88 emails from shipyard 6-month simulation (June-November 2025)

---

## What Changed to Support the Shipyard Dataset

The system has been specifically adapted to handle the shipyard email simulation dataset with the following enhancements:

### 1. **Email-Specific Data Model**

**New DynamoDB Table:** `helmstream-emails`

```json
{
  "email_id": "email_20250601_0800",
  "timestamp": "2025-06-01T08:00",
  "sender": "Maria Gonzalez",
  "sender_role": "Local Agent",
  "recipients": ["Luke Chen", "Emma Riley"],
  "subject": "MV Pacific Star - Dry Dock Allocation Request",
  "body_preview": "Hi Luke and Emma, I'm coordinating...",
  "s3_uri": "s3://bucket/emails/06/email_20250601_0800.json",
  "email_type": "operational",
  "vessel_involved": "MV Pacific Star",
  "event_category": "scheduling",
  "month": "06",
  "date": "2025-06-01",
  "embedding": [768-dimensional vector],
  "created_at": "2024-11-07T..."
}
```

**Metadata Tags** (per DATASET-MANIFEST.md):
- ✅ Vessel name (6 vessels supported)
- ✅ Event category (12 types)
- ✅ Stakeholder role (10 roles)
- ✅ Month (06-11)
- ✅ Date (YYYY-MM-DD)
- ✅ Email type

### 2. **Stakeholder-Aware Lambda Functions**

#### A. Email Processor (`lambda/email_processor/`)
- Handles email-specific fields (sender, recipients, sender_role)
- Creates rich text for embedding (includes metadata context)
- Stores full email in S3 with metadata
- Supports batch processing

#### B. RAG Engine for Emails (`lambda/rag_engine_emails/`)
- **Intelligent Query Parsing**: Automatically extracts filters from natural language
  - Vessel names: "What is the status of MV Pacific Star?" → filters by vessel
  - Stakeholder roles: "What did Maria communicate?" → filters by sender
  - Temporal: "What happened in October?" → filters by month
  - Event categories: "What delays occurred?" → filters by event type

- **Stakeholder-Aware Responses**: Contextualizes answers with:
  - Who said what (sender + role)
  - When they said it (date/time)
  - Why it matters (event category)
  - What vessel is affected

- **Temporal Reasoning**: Understands sequences, delays, timelines

### 3. **Dataset Ingestion Tools**

#### `setup/ingest_shipyard_emails.py`
- Reads `shipyard_emails_flat.csv` from `rag-docs/`
- Processes 88 emails in batches
- Generates embeddings for each email
- Stores in DynamoDB with full metadata

#### `setup/test_shipyard_queries.py`
- 15 realistic test queries from `rag-query-reference.md`
- Tests 5 query categories:
  1. **Operational Status** - vessel status, dock availability
  2. **Delay Analysis** - root causes, impacts
  3. **Decision Context** - who approved what, why
  4. **Coordination** - conflict resolution, stakeholder communication
  5. **Temporal** - what happened when, sequences

---

## Setup Instructions (Shipyard Dataset)

### Step 1: Standard AWS Setup

```bash
cd setup
./01_setup_aws_resources.sh
```

This creates:
- S3 bucket for email storage
- DynamoDB table: `helmstream-emails` (optimized for email metadata)
- IAM roles with Bedrock permissions

### Step 2: Deploy Email-Specific Lambda Functions

```bash
./02_deploy_lambda_functions.sh
```

This deploys:
- `helmstream-email-processor` - Processes shipyard emails with metadata
- `helmstream-rag-engine-emails` - Stakeholder-aware query engine

**Note:** The script automatically detects and deploys the email-specific versions.

### Step 3: Ingest the Shipyard Dataset

```bash
python3 ingest_shipyard_emails.py
```

**What this does:**
1. Reads `rag-docs/shipyard_emails_flat.csv` (88 emails)
2. Processes in batches of 10
3. Generates Titan embeddings for each email
4. Stores in DynamoDB + S3

**Expected output:**
```
📧 Reading emails from: ../../rag-docs/shipyard_emails_flat.csv
✓ Loaded 88 emails from CSV

📦 Processing batch 1/9 (10 emails)...
   ✓ Batch processed: 10 emails
   📧 Sample: email_20250601_0800 - Maria Gonzalez

...

✅ INGESTION COMPLETE
Total emails: 88
Processed: 88
Failed: 0
```

**Time:** ~3-5 minutes
**Cost:** ~$0.10 (Titan embeddings for 88 emails)

### Step 4: Test with Realistic Queries

```bash
python3 test_shipyard_queries.py
```

Tests 15 queries across all categories with actual data from the dataset.

**Sample output:**
```
🔍 [Operational Status] What is the current status of MV Pacific Star?

💬 Answer: Based on the email communications, MV Pacific Star completed
routine maintenance at Dock 1 from June 10-15, 2025. The vessel was
successfully released on June 15 after all safety checks were completed...

📚 Sources (3 emails):
   1. [Local Agent] Maria Gonzalez
      Subject: MV Pacific Star - Completion Notification
      Vessel: MV Pacific Star | Category: completion | Score: 0.892

💰 Tokens: 1,245 in, 187 out (≈$0.0067)
```

---

## Dataset Details

### Vessels (6)
1. **MV Pacific Star** - Container Ship
2. **MT Blue Horizon** - Tanker
3. **MV Baltic Trader** - Bulk Carrier
4. **MT Orange Grove** - Tanker
5. **MV Nordic Wave** - Container Ship
6. **MV Sentinel** - General Cargo

### Stakeholders (10)
1. Maria Gonzalez - Local Agent
2. Luke Chen - Dock Scheduler
3. Emma Riley - Port Authority
4. Steve Bradshaw - Tug/Mooring Lead
5. Priya Patel - Crane Supervisor
6. Rajesh Kumar - Technical Lead
7. Sarah Mitchell - Safety/Compliance
8. David Okonkwo - Environmental Manager
9. Chloe Nguyen - IT Support
10. Alan Shore - Cargo Owner Rep

### Event Categories (12)
1. operational
2. delay
3. weather
4. maintenance
5. emergency
6. completion
7. scheduling
8. conflict
9. scope_expansion
10. compliance
11. environmental
12. technical

### Timeline
- **Start:** June 1, 2025
- **End:** November 30, 2025
- **Total emails:** 88
- **Major events:** 11 (storms, failures, crises)

---

## Query Patterns Supported

### 1. Operational Status Queries
```
"What is the current status of MV Pacific Star?"
"When will Dock 1 be available?"
"Which vessels are currently in dock?"
```

**How it works:**
- Extracts vessel name from query
- Filters emails by vessel
- Returns latest status updates

### 2. Decision Context Queries
```
"What was the decision process for extending Baltic Trader dock stay?"
"Who approved the Baltic Trader extended dock allocation?"
"Why was Orange Grove allocation moved?"
```

**How it works:**
- Identifies decision-related keywords
- Retrieves email chains with approval communications
- Cites specific stakeholders and their roles

### 3. Causality Queries
```
"Why was Blue Horizon delayed?"
"How did the storm impact Pacific Star's schedule?"
"What was the root cause of [outcome]?"
```

**How it works:**
- Searches for delay/impact event categories
- Traces temporal sequences
- Explains cause-and-effect relationships

### 4. Stakeholder Perspective Queries
```
"What did Maria communicate to Alan about cargo delays?"
"How did Rajesh respond to the scope expansion?"
"From the Technical Lead's perspective, what happened?"
```

**How it works:**
- Filters by sender_role
- Retrieves communications between specific stakeholders
- Maintains context of who said what

### 5. Temporal Queries
```
"What happened in October?"
"Trace the Baltic Trader propeller issue from discovery to resolution"
"How long did [operation] take?"
```

**How it works:**
- Filters by month/date range
- Orders results chronologically
- Identifies event sequences

---

## Architecture Alignment with DATASET-MANIFEST.md

### ✅ Document Chunking Strategy
**Requirement:** Email chains + context, 1,500-2,500 tokens per chunk

**Implementation:**
- Each email stored individually with full context
- Embedding includes: sender info + recipients + subject + body
- Rich text format preserves relationships

### ✅ Metadata Tagging
**Requirement:**
- Primary: vessel, event category, stakeholder role, month, status
- Secondary: technical keywords, decision type, impact type

**Implementation:**
- All primary tags implemented in DynamoDB schema
- Automatic extraction from query for filtering
- Secondary tags supported via body text search

### ✅ Embedding Strategy
**Requirement:** Create embeddings for stakeholder roles, vessel types, event categories, temporal sequences

**Implementation:**
- Titan Embeddings (768-dim) for all emails
- Rich text includes metadata for semantic similarity
- Cosine similarity search with metadata filtering

### ✅ Query Pattern Optimization
**Requirement:** Support 5 query types from manifest

**Implementation:**
- ✅ Type 1: Operational Status → vessel + status filters
- ✅ Type 2: Decision Context → stakeholder + approval keywords
- ✅ Type 3: Causality → event category + temporal ordering
- ✅ Type 4: Stakeholder Perspective → sender_role filters
- ✅ Type 5: Temporal Relationships → month/date filters + ordering

---

## Quality Metrics (from DATASET-MANIFEST.md)

Expected benchmarks:
- ✅ Correct vessel status identification: 95%+
- ✅ Accurate date/timeline recall: 98%+
- ✅ Correct stakeholder role attribution: 95%+
- ✅ Causality chain identification: 80%+
- ✅ Temporal relationship understanding: 80%+

**How to verify:**
Run `test_shipyard_queries.py` and check response accuracy against source emails.

---

## Use Cases Implemented

### ✅ Use Case 1: Onboarding New Stakeholders
**Query:** "Give me a summary of what happened in October"

**Supported:**
- Filter by month=10
- Retrieve all October emails
- Claude generates month-level summary

### ✅ Use Case 2: Incident Analysis
**Query:** "Trace the Baltic Trader propeller issue from discovery to resolution"

**Supported:**
- Filter by vessel="MV Baltic Trader" + event_category="emergency"
- Retrieve chronological email chain
- Claude traces causality chain

### ✅ Use Case 3: Pattern Recognition
**Query:** "How often did scope expansions occur and what types?"

**Supported:**
- Filter by event_category="scope_expansion"
- Count occurrences
- Claude analyzes patterns

### ✅ Use Case 4: Stakeholder Communication
**Query:** "What did Maria communicate to Alan about cargo delays?"

**Supported:**
- Filter by sender="Maria Gonzalez" + recipients contains "Alan"
- Retrieve communication timeline
- Claude summarizes rationale and actions

### ✅ Use Case 5: Crisis Learning
**Query:** "Walk me through the October crisis decision-making process"

**Supported:**
- Filter by month="10" + event_category="emergency"
- Retrieve decision chain emails
- Claude explains problem → options → decision → execution

---

## File Structure

```
HelmStream/
├── lambda/
│   ├── email_processor/           # NEW: Shipyard email processor
│   │   ├── handler.py             # Email-specific ingestion
│   │   └── requirements.txt
│   ├── rag_engine_emails/         # NEW: Stakeholder-aware RAG
│   │   ├── handler.py             # Query with metadata filters
│   │   └── requirements.txt
│   ├── document_processor/        # Original: Generic documents
│   └── rag_engine/                # Original: Generic RAG
├── setup/
│   ├── ingest_shipyard_emails.py  # NEW: Dataset ingestion
│   ├── test_shipyard_queries.py   # NEW: Realistic test queries
│   ├── 01_setup_aws_resources.sh
│   ├── 02_deploy_lambda_functions.sh
│   └── README.md
├── SHIPYARD-SETUP.md              # NEW: This file
├── rag-docs/                      # Dataset location
│   ├── DATASET-MANIFEST.md
│   ├── shipyard_emails_flat.csv   # 88 emails
│   └── rag-query-reference.md
└── ...
```

---

## Next Steps

1. **✅ Setup Complete** - Run the 4 scripts above
2. **Test Queries** - Try the 15 built-in queries
3. **Add Custom Queries** - Use the supported patterns
4. **Build Frontend** - Connect to the Lambda functions
5. **Add Gmail Integration** - Sync real emails (future)

---

## Cost Estimates (Shipyard Dataset)

### One-Time Ingestion
- 88 emails × Titan embeddings: **~$0.10**

### Query Testing (15 queries)
- Claude 3 Sonnet: **~$0.10**

### Monthly Usage (100 queries/day)
- 3,000 queries × avg tokens: **~$15/month**

**Total MVP with dataset: ~$15-20/month**

---

## Troubleshooting

### Dataset not found
```bash
# Make sure rag-docs is in the right location:
ls -la ../../rag-docs/shipyard_emails_flat.csv
```

### Email table doesn't exist
```bash
# Create it manually:
aws dynamodb create-table \
  --table-name helmstream-emails \
  --attribute-definitions AttributeName=email_id,AttributeType=S \
  --key-schema AttributeName=email_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### Lambda function not found
```bash
# Deploy email-specific functions:
cd setup
./02_deploy_lambda_functions.sh
```

---

## Verification Checklist

- [ ] AWS Bedrock models enabled (Claude 3 Sonnet + Titan)
- [ ] DynamoDB table `helmstream-emails` created
- [ ] Lambda functions deployed (email_processor, rag_engine_emails)
- [ ] Dataset file found: `rag-docs/shipyard_emails_flat.csv`
- [ ] 88 emails ingested successfully
- [ ] Test queries return relevant results
- [ ] Stakeholder filters working (try: "What did Maria...?")
- [ ] Vessel filters working (try: "Status of MV Pacific Star?")
- [ ] Temporal filters working (try: "What happened in October?")

---

## Reference Documents

1. **DATASET-MANIFEST.md** - Complete dataset specification
2. **rag-query-reference.md** - Query patterns by stakeholder role
3. **shipyard-6mo-summary.md** - Operational overview and context
4. **timeline-critical-events.md** - Chronological event details

All available in: `rag-docs/`
