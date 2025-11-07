# HelmStream - Quick Start Guide

Get your RAG chat running on AWS Bedrock in ~15 minutes.

## What You'll Build

A complete RAG (Retrieval-Augmented Generation) chat system that:
- ✅ Ingests maritime documents and generates embeddings
- ✅ Stores vectors in DynamoDB (free tier)
- ✅ Uses Amazon Bedrock (Claude 3 Sonnet + Titan Embeddings)
- ✅ Answers questions based on your documents
- ✅ Costs ~$3-10/month (mostly Bedrock API usage)

## Prerequisites (5 minutes)

### 1. AWS Account Setup
```bash
# Install AWS CLI
# macOS:
brew install awscli

# Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter your Access Key ID, Secret Key, region (us-east-1), output format (json)
```

### 2. Enable Bedrock Models
🚨 **CRITICAL STEP** - Do this first!

1. Open: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess
2. Click "Enable specific models"
3. Enable:
   - ✅ Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
   - ✅ Titan Embeddings G1 - Text (amazon.titan-embed-text-v1)
4. Wait for approval (usually instant)

### 3. Verify Python
```bash
python3 --version  # Should be 3.11+
pip3 --version
```

## Step-by-Step Setup (10 minutes)

### Step 1: Setup AWS Infrastructure (3 min)
```bash
cd setup
./01_setup_aws_resources.sh
```

**What this does:**
- Creates S3 bucket for documents
- Creates DynamoDB table for embeddings
- Creates IAM role for Lambda
- Saves configuration to `.env`

**Expected output:**
```
✅ Setup Complete!
Resources created:
  • S3 Bucket: helmstream-maritime-docs-1699123456
  • DynamoDB Table: helmstream-documents
  • IAM Role: helmstream-lambda-role
```

### Step 2: Deploy Lambda Functions (5 min)
```bash
./02_deploy_lambda_functions.sh
```

**What this does:**
- Packages Python code with dependencies
- Deploys 2 Lambda functions:
  - `helmstream-document-processor` (ingests docs)
  - `helmstream-rag-engine` (handles queries)
- Creates conversations table

**Expected output:**
```
✅ Deployment Complete!
Lambda functions deployed:
  • helmstream-document-processor (1024MB, 300s timeout)
  • helmstream-rag-engine (1024MB, 60s timeout)
```

### Step 3: Test Everything (2 min)
```bash
python3 test_rag_pipeline.py
```

**What this does:**
- Ingests 3 sample maritime documents
- Generates embeddings with Bedrock Titan
- Runs 5 test queries
- Shows answers with sources

**Expected output:**
```
✅ TEST COMPLETE
Documents ingested: 3
Queries tested: 5

Your RAG pipeline is working! 🎉
```

## Example Queries & Responses

### Query 1
```
🔍 Query: What is the port fee for MV Ocean Star at Singapore?

💬 Answer: According to the Port Arrival Report and Invoice documents,
the port fees for MV Ocean Star at Singapore total $25,000 USD. This
includes berth occupancy ($15,000), pilotage services ($5,000), tug boat
assistance ($3,000), and port security ($2,000).

📚 Sources:
   - Invoice INV-2024-001 - Singapore Port Authority (score: 0.892)
   - Port Arrival Report - MV Ocean Star - Singapore (score: 0.875)

💰 Tokens: 1,234 in, 156 out
```

### Query 2
```
🔍 Query: When does the safety certificate expire for MV Ocean Star?

💬 Answer: The safety certificate for MV Ocean Star expires on November
30, 2024. The renewal inspection must be completed before November 25,
2024 to ensure continuous compliance.

📚 Sources:
   - Safety Certificate Renewal - MV Ocean Star (score: 0.945)
```

## Manual Testing

### Test Document Upload
```bash
aws lambda invoke \
  --function-name helmstream-document-processor \
  --payload '{
    "text": "The MV Pacific arrived at Hong Kong on Nov 10, 2024. Port fees: $30,000",
    "type": "port_report",
    "title": "Port Report - MV Pacific"
  }' \
  output.json

cat output.json | python3 -m json.tool
```

### Test RAG Query
```bash
aws lambda invoke \
  --function-name helmstream-rag-engine \
  --payload '{
    "message": "What are the port fees for MV Pacific?",
    "top_k": 3
  }' \
  query-output.json

cat query-output.json | python3 -m json.tool
```

## Understanding the Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Lambda Functions                        │
│  ┌─────────────────────┐    ┌──────────────────────┐       │
│  │ Document Processor  │    │    RAG Query Engine  │       │
│  │  • Extract text     │    │  • Generate embedding│       │
│  │  • Generate embedding│   │  • Search DynamoDB   │       │
│  │  • Store in DynamoDB │   │  • Fetch from S3     │       │
│  │  • Save to S3       │    │  • Call Claude       │       │
│  └─────────────────────┘    └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Amazon Bedrock                           │
│  ┌─────────────────────┐    ┌──────────────────────┐       │
│  │  Titan Embeddings   │    │   Claude 3 Sonnet    │       │
│  │  768-dim vectors    │    │   Response generation│       │
│  └─────────────────────┘    └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                             │
│  ┌─────────────────────┐    ┌──────────────────────┐       │
│  │  DynamoDB (Free)    │    │    S3 (Free)         │       │
│  │  • Embeddings       │    │  • Full documents    │       │
│  │  • Metadata         │    │  • Attachments       │       │
│  └─────────────────────┘    └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Cost Breakdown

### Free Tier Usage
- ✅ Lambda: 1M requests/month FREE
- ✅ DynamoDB: 25GB storage FREE
- ✅ S3: 5GB storage FREE
- ✅ API Gateway: 1M calls/month FREE (12 months)

### Pay-per-Use
- 💰 Bedrock Claude 3 Sonnet: ~$3/MTok input, ~$15/MTok output
- 💰 Bedrock Titan Embeddings: ~$0.10/MTok

**Typical MVP costs: $3-10/month**

Example calculation for 100 queries/day:
- 100 docs ingested (one-time): ~$0.50
- 100 queries × 30 days = 3,000 queries
- Avg tokens per query: 1,500 in, 200 out
- Cost: ~$15/month

## Next Steps

### Option 1: Add More Documents
```bash
# Create your own documents
cat > my_document.json << EOF
{
  "text": "Your document content here...",
  "type": "custom_type",
  "title": "My Document Title",
  "metadata": {"key": "value"}
}
EOF

# Ingest it
aws lambda invoke \
  --function-name helmstream-document-processor \
  --payload file://my_document.json \
  output.json
```

### Option 2: Build a Simple Frontend
```bash
# Create a simple web interface
mkdir frontend
cd frontend
npx create-react-app helmstream-chat
# Add chat UI that calls your Lambda functions
```

### Option 3: Add Gmail Integration
- Set up OAuth 2.0 for Gmail
- Deploy email processor Lambda
- Automatically ingest email attachments
- Use RAG to respond to emails

### Option 4: Deploy API Gateway
```bash
# Coming soon: ./03_create_api_gateway.sh
# This will create REST API endpoints for easy access
```

## Troubleshooting

### ❌ "AccessDeniedException" from Bedrock
**Cause:** Model access not enabled
**Solution:** Go to Bedrock console and enable Claude 3 Sonnet + Titan Embeddings

### ❌ "ResourceNotFoundException" for DynamoDB table
**Cause:** Table not created
**Solution:** Run `./01_setup_aws_resources.sh` again

### ❌ Lambda timeout
**Cause:** Document too large or slow network
**Solution:** Increase timeout in `02_deploy_lambda_functions.sh` to 300s

### ❌ High costs
**Cause:** Too many Bedrock API calls
**Solution:**
- Cache common queries
- Reduce `top_k` from 5 to 3
- Use shorter documents
- Monitor with: `aws logs tail /aws/lambda/helmstream-rag-engine | grep COST`

## Monitoring Costs

```bash
# Check DynamoDB storage
aws dynamodb describe-table \
  --table-name helmstream-documents \
  --query 'Table.TableSizeBytes'

# Check S3 usage
aws s3 ls s3://YOUR-BUCKET-NAME --recursive --summarize

# View Lambda logs (shows token usage)
aws logs tail /aws/lambda/helmstream-rag-engine --follow
```

## Clean Up (Delete Everything)

```bash
# Run cleanup script
cd setup
./cleanup.sh  # Coming soon

# Or manually:
aws lambda delete-function --function-name helmstream-document-processor
aws lambda delete-function --function-name helmstream-rag-engine
aws dynamodb delete-table --table-name helmstream-documents
# ... (see setup/README.md for full cleanup)
```

## Learn More

- 📖 Full architecture: `architecture.md`
- 📖 Project overview: `README.md`
- 📖 Development guide: `CLAUDE.md`
- 📖 Setup details: `setup/README.md`

## Support

Having issues? Check:
1. AWS Bedrock model access enabled?
2. AWS CLI configured correctly?
3. Python 3.11+ installed?
4. Correct AWS region (us-east-1)?

Still stuck? Review the detailed logs:
```bash
aws logs tail /aws/lambda/helmstream-document-processor --follow
aws logs tail /aws/lambda/helmstream-rag-engine --follow
```

---

**You're all set! 🚀**

Your RAG pipeline is ready to answer questions about your maritime documents using Amazon Bedrock.
