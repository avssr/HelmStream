# HelmStream Setup Guide

Quick start guide for deploying the HelmStream RAG pipeline on AWS.

## Prerequisites

1. **AWS Account** with admin access
2. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure
   ```
3. **Python 3.11+** installed
4. **pip** for Python package management

## Setup Steps

### Step 1: Enable Bedrock Model Access

**IMPORTANT**: You must enable model access before running the setup scripts.

1. Go to AWS Console → Amazon Bedrock → Model access
   - Direct link: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess

2. Click "Enable specific models" or "Modify model access"

3. Enable these models:
   - ✅ **Claude 3 Sonnet** (anthropic.claude-3-sonnet-20240229-v1:0)
   - ✅ **Titan Embeddings G1 - Text** (amazon.titan-embed-text-v1)

4. Wait for approval (usually instant)

### Step 2: Run Infrastructure Setup

```bash
cd setup
chmod +x *.sh
./01_setup_aws_resources.sh
```

This creates:
- S3 bucket for documents
- DynamoDB table for document metadata & embeddings
- IAM role for Lambda functions
- Configuration file (`.env`)

**Expected output:**
```
✅ Setup Complete!
Resources created:
  • S3 Bucket: helmstream-maritime-docs-XXXXXXXXXX
  • DynamoDB Table: helmstream-documents
  • IAM Role: helmstream-lambda-role
```

### Step 3: Deploy Lambda Functions

```bash
./02_deploy_lambda_functions.sh
```

This deploys:
- `helmstream-document-processor` - Ingests documents and generates embeddings
- `helmstream-rag-engine` - Processes queries and generates responses

**Expected output:**
```
✅ Deployment Complete!
Lambda functions deployed:
  • helmstream-document-processor (1024MB, 300s timeout)
  • helmstream-rag-engine (1024MB, 60s timeout)
```

### Step 4: Test the RAG Pipeline

```bash
chmod +x test_rag_pipeline.py
python3 test_rag_pipeline.py
```

This will:
1. Ingest 3 sample maritime documents
2. Generate embeddings using Bedrock Titan
3. Run 5 test queries
4. Show RAG responses with sources

**Expected output:**
```
✅ TEST COMPLETE
Documents ingested: 3
Queries tested: 5

Your RAG pipeline is working! 🎉
```

## Manual Testing

### Test Document Ingestion

```bash
aws lambda invoke \
  --function-name helmstream-document-processor \
  --payload '{"text":"The MV Ocean Star arrived at Singapore on Nov 5, 2024. Port fees: $25,000","type":"port_report","title":"Port Report - MV Ocean Star"}' \
  --region us-east-1 \
  output.json

cat output.json | python3 -m json.tool
```

### Test RAG Query

```bash
aws lambda invoke \
  --function-name helmstream-rag-engine \
  --payload '{"message":"What is the port fee for MV Ocean Star?","top_k":3}' \
  --region us-east-1 \
  query-output.json

cat query-output.json | python3 -m json.tool
```

## Cost Monitoring

### Check Current Costs

```bash
# DynamoDB usage
aws dynamodb describe-table \
  --table-name helmstream-documents \
  --query 'Table.TableSizeBytes' \
  --output text

# S3 usage
aws s3 ls s3://$(grep S3_BUCKET_NAME ../.env | cut -d= -f2) --recursive --summarize

# Lambda invocations (last 24 hours)
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=helmstream-rag-engine \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum
```

### Set Up Billing Alerts

1. Go to AWS Console → Billing → Budgets
2. Create budget with alert at $5/month
3. Add email notification

## Troubleshooting

### "Access Denied" when calling Bedrock

**Solution**: Enable model access in Bedrock console (see Step 1)

### "Table already exists" error

**Solution**: Tables were created previously. You can proceed or delete them:
```bash
aws dynamodb delete-table --table-name helmstream-documents
```

### "Invalid IAM role" error

**Solution**: Wait 10 seconds after role creation for AWS to propagate, then retry:
```bash
sleep 10
./02_deploy_lambda_functions.sh
```

### Lambda timeout errors

**Solution**: Increase timeout in deployment script:
- Document processor: 300s (5 minutes)
- RAG engine: 60s (1 minute)

### High costs

**Check Bedrock token usage:**
```bash
aws logs tail /aws/lambda/helmstream-rag-engine --follow | grep "COST"
```

**Free tier limits:**
- Lambda: 1M requests/month
- DynamoDB: 25GB storage
- S3: 5GB storage
- Bedrock: Pay-per-use (~$3-10/month for testing)

## Next Steps

1. **Create API Gateway** (optional):
   ```bash
   ./03_create_api_gateway.sh  # Coming soon
   ```

2. **Add more documents**:
   - Upload PDFs, Word docs, or text files
   - Process with document_processor Lambda

3. **Build frontend**:
   - React chat interface
   - Document upload UI
   - Activity dashboard

4. **Add Gmail integration**:
   - Set up OAuth 2.0
   - Deploy email processor Lambda
   - Configure EventBridge triggers

## File Structure

```
setup/
├── 01_setup_aws_resources.sh      # Infrastructure setup
├── 02_deploy_lambda_functions.sh  # Lambda deployment
├── test_rag_pipeline.py            # End-to-end test
├── lambda-trust-policy.json        # IAM trust policy
├── lambda-execution-policy.json   # IAM permissions
├── s3-lifecycle-policy.json        # S3 lifecycle rules
├── dynamodb-tables.json            # Table definitions
└── README.md                       # This file

lambda/
├── document_processor/
│   ├── handler.py                  # Document ingestion
│   └── requirements.txt
└── rag_engine/
    ├── handler.py                  # RAG query processing
    └── requirements.txt
```

## Configuration

Configuration is stored in `../.env`:

```bash
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
S3_BUCKET_NAME=helmstream-maritime-docs-XXXXXXXXXX
DYNAMODB_TABLE_NAME=helmstream-documents
IAM_ROLE_ARN=arn:aws:iam::123456789012:role/helmstream-lambda-role
BEDROCK_CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_TITAN_EMBED_MODEL_ID=amazon.titan-embed-text-v1
```

## Support

- Architecture docs: `../architecture.md`
- Project README: `../README.md`
- Claude Code guide: `../CLAUDE.md`

## Clean Up

To delete all resources:

```bash
# Delete Lambda functions
aws lambda delete-function --function-name helmstream-document-processor
aws lambda delete-function --function-name helmstream-rag-engine

# Delete DynamoDB tables
aws dynamodb delete-table --table-name helmstream-documents
aws dynamodb delete-table --table-name helmstream-conversations

# Delete S3 bucket (empty it first)
aws s3 rm s3://$(grep S3_BUCKET_NAME ../.env | cut -d= -f2) --recursive
aws s3 rb s3://$(grep S3_BUCKET_NAME ../.env | cut -d= -f2)

# Delete IAM role
aws iam delete-role-policy --role-name helmstream-lambda-role --policy-name helmstream-lambda-policy
aws iam delete-role --role-name helmstream-lambda-role
```
