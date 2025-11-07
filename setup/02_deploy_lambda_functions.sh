#!/bin/bash

# HelmStream - Lambda Functions Deployment Script
# Phase 2: Deploy Lambda functions

set -e  # Exit on error

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found: $CONFIG_FILE"
    echo "   Please run ./01_setup_aws_resources.sh first"
    exit 1
fi

# Source configuration
source "$CONFIG_FILE"

echo "============================================"
echo "HelmStream Lambda Deployment"
echo "============================================"
echo "Region: $AWS_REGION"
echo "IAM Role: $IAM_ROLE_ARN"
echo ""

# Function to deploy a Lambda function
deploy_lambda() {
    local FUNCTION_NAME=$1
    local HANDLER=$2
    local MEMORY=$3
    local TIMEOUT=$4
    local DESCRIPTION=$5

    echo "📦 Deploying $FUNCTION_NAME..."

    # Map function names to directory names
    case "$FUNCTION_NAME" in
        "helmstream-email-processor")
            DIR_NAME="email_processor"
            ;;
        "helmstream-rag-engine-emails")
            DIR_NAME="rag_engine_emails"
            ;;
        *)
            DIR_NAME="$FUNCTION_NAME"
            ;;
    esac

    # Navigate to function directory
    cd "$SCRIPT_DIR/../lambda/$DIR_NAME"

    # Create deployment package
    echo "  → Creating deployment package..."
    rm -rf package function.zip
    mkdir -p package

    # Install dependencies if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt -t package/ --quiet --upgrade
        echo "  → Dependencies installed"
    fi

    # Copy function code
    cp handler.py package/

    # Create zip file
    cd package
    zip -r ../function.zip . > /dev/null
    cd ..
    echo "  → Package created"

    # Check if function exists
    if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null; then
        # Update existing function
        echo "  → Updating existing function code..."
        aws lambda update-function-code \
            --function-name "$FUNCTION_NAME" \
            --zip-file fileb://function.zip \
            --region "$AWS_REGION" > /dev/null

        echo "  → Waiting for function to be ready..."
        aws lambda wait function-updated --function-name "$FUNCTION_NAME" --region "$AWS_REGION"

        echo "  → Updating function configuration..."
        aws lambda update-function-configuration \
            --function-name "$FUNCTION_NAME" \
            --handler "$HANDLER" \
            --runtime python3.11 \
            --timeout "$TIMEOUT" \
            --memory-size "$MEMORY" \
            --environment "Variables={
                DYNAMODB_TABLE_NAME=helmstream-emails,
                S3_BUCKET_NAME=$S3_BUCKET_NAME,
                BEDROCK_CLAUDE_MODEL_ID=$BEDROCK_CLAUDE_MODEL_ID,
                BEDROCK_TITAN_EMBED_MODEL_ID=$BEDROCK_TITAN_EMBED_MODEL_ID
            }" \
            --region "$AWS_REGION" > /dev/null

        echo "  ✓ Function updated"
    else
        # Create new function
        echo "  → Creating new function..."
        aws lambda create-function \
            --function-name "$FUNCTION_NAME" \
            --runtime python3.11 \
            --role "$IAM_ROLE_ARN" \
            --handler "$HANDLER" \
            --zip-file fileb://function.zip \
            --timeout "$TIMEOUT" \
            --memory-size "$MEMORY" \
            --description "$DESCRIPTION" \
            --environment "Variables={
                DYNAMODB_TABLE_NAME=helmstream-emails,
                S3_BUCKET_NAME=$S3_BUCKET_NAME,
                BEDROCK_CLAUDE_MODEL_ID=$BEDROCK_CLAUDE_MODEL_ID,
                BEDROCK_TITAN_EMBED_MODEL_ID=$BEDROCK_TITAN_EMBED_MODEL_ID
            }" \
            --region "$AWS_REGION" > /dev/null

        echo "  ✓ Function created"
    fi

    # Clean up
    rm -rf package function.zip

    echo "✓ $FUNCTION_NAME deployed successfully"
    echo ""
}

# Create emails DynamoDB table if it doesn't exist
echo "📊 Creating emails DynamoDB table..."
EMAILS_TABLE_NAME="helmstream-emails"
if ! aws dynamodb describe-table --table-name "$EMAILS_TABLE_NAME" --region "$AWS_REGION" &> /dev/null; then
    aws dynamodb create-table \
        --table-name "$EMAILS_TABLE_NAME" \
        --attribute-definitions \
            AttributeName=email_id,AttributeType=S \
        --key-schema \
            AttributeName=email_id,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION" > /dev/null

    echo "✓ Emails table created"
else
    echo "⚠️  Emails table already exists"
fi
echo ""

# Deploy Lambda functions
echo "Deploying Lambda functions..."
echo ""

# 1. Email Processor (for shipyard emails)
deploy_lambda \
    "helmstream-email-processor" \
    "handler.lambda_handler" \
    1024 \
    300 \
    "Process shipyard emails with stakeholder metadata"

# 2. RAG Query Engine (for stakeholder-aware queries)
deploy_lambda \
    "helmstream-rag-engine-emails" \
    "handler.lambda_handler" \
    1024 \
    60 \
    "Stakeholder-aware RAG query engine"

# Test Lambda functions
echo "🧪 Testing Lambda functions..."
echo ""

echo "Testing email processor..."
# Create test payload file
cat > /tmp/test-email-payload.json << 'EOF'
{"email":{"date":"2025-06-01","time":"08:00","sender":"Test User","sender_role":"Local Agent","recipients":["User 2"],"subject":"Test Email","body":"This is a test email for the HelmStream shipyard system","email_type":"test","month":"06","vessel_involved":"MV Test Vessel","event_category":"test"}}
EOF

aws lambda invoke \
    --function-name helmstream-email-processor \
    --cli-binary-format raw-in-base64-out \
    --payload file:///tmp/test-email-payload.json \
    --region "$AWS_REGION" \
    /tmp/test-email-output.json > /dev/null

if [ $? -eq 0 ]; then
    echo "✓ Email processor test passed"
    echo ""
    echo "Response:"
    cat /tmp/test-email-output.json | python3 -m json.tool
else
    echo "❌ Email processor test failed"
    cat /tmp/test-email-output.json
fi
echo ""

# Summary
echo "============================================"
echo "✅ Deployment Complete!"
echo "============================================"
echo "Lambda functions deployed:"
echo "  • helmstream-email-processor (1024MB, 300s timeout)"
echo "  • helmstream-rag-engine-emails (1024MB, 60s timeout)"
echo ""
echo "DynamoDB table created:"
echo "  • $EMAILS_TABLE_NAME"
echo ""
echo "Next steps:"
echo "  1. Run: python3 ingest_shipyard_emails.py"
echo "  2. Run: python3 test_shipyard_queries.py"
echo "  3. Monitor costs in CloudWatch"
echo ""
echo "Function ARNs:"
aws lambda get-function \
    --function-name helmstream-email-processor \
    --region "$AWS_REGION" \
    --query 'Configuration.FunctionArn' \
    --output text

aws lambda get-function \
    --function-name helmstream-rag-engine-emails \
    --region "$AWS_REGION" \
    --query 'Configuration.FunctionArn' \
    --output text
echo "============================================"
