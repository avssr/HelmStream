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

    # Navigate to function directory
    cd "$SCRIPT_DIR/../lambda/$FUNCTION_NAME"

    # Create deployment package
    echo "  → Creating deployment package..."
    rm -rf package function.zip
    mkdir -p package

    # Install dependencies if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt -t package/ --quiet
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
        echo "  → Updating existing function..."
        aws lambda update-function-code \
            --function-name "$FUNCTION_NAME" \
            --zip-file fileb://function.zip \
            --region "$AWS_REGION" > /dev/null

        aws lambda update-function-configuration \
            --function-name "$FUNCTION_NAME" \
            --handler "$HANDLER" \
            --runtime python3.11 \
            --timeout "$TIMEOUT" \
            --memory-size "$MEMORY" \
            --environment "Variables={
                AWS_REGION=$AWS_REGION,
                DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME,
                S3_BUCKET_NAME=$S3_BUCKET_NAME,
                BEDROCK_CLAUDE_MODEL_ID=$BEDROCK_CLAUDE_MODEL_ID,
                BEDROCK_TITAN_EMBED_MODEL_ID=$BEDROCK_TITAN_EMBED_MODEL_ID,
                CONVERSATIONS_TABLE_NAME=helmstream-conversations
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
                AWS_REGION=$AWS_REGION,
                DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME,
                S3_BUCKET_NAME=$S3_BUCKET_NAME,
                BEDROCK_CLAUDE_MODEL_ID=$BEDROCK_CLAUDE_MODEL_ID,
                BEDROCK_TITAN_EMBED_MODEL_ID=$BEDROCK_TITAN_EMBED_MODEL_ID,
                CONVERSATIONS_TABLE_NAME=helmstream-conversations
            }" \
            --region "$AWS_REGION" > /dev/null

        echo "  ✓ Function created"
    fi

    # Clean up
    rm -rf package function.zip

    echo "✓ $FUNCTION_NAME deployed successfully"
    echo ""
}

# Deploy Lambda functions
echo "Deploying Lambda functions..."
echo ""

# 1. Document Processor
deploy_lambda \
    "helmstream-document-processor" \
    "handler.lambda_handler" \
    1024 \
    300 \
    "Process documents and generate embeddings"

# 2. RAG Query Engine
deploy_lambda \
    "helmstream-rag-engine" \
    "handler.lambda_handler" \
    1024 \
    60 \
    "RAG query engine with Bedrock Claude"

# Create conversations table if it doesn't exist
echo "📊 Creating conversations table..."
if ! aws dynamodb describe-table --table-name "helmstream-conversations" --region "$AWS_REGION" &> /dev/null; then
    aws dynamodb create-table \
        --table-name "helmstream-conversations" \
        --attribute-definitions \
            AttributeName=conversation_id,AttributeType=S \
            AttributeName=timestamp,AttributeType=S \
        --key-schema \
            AttributeName=conversation_id,KeyType=HASH \
            AttributeName=timestamp,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION" > /dev/null

    echo "✓ Conversations table created"
else
    echo "⚠️  Conversations table already exists"
fi
echo ""

# Test Lambda functions
echo "🧪 Testing Lambda functions..."
echo ""

echo "Testing document processor..."
aws lambda invoke \
    --function-name helmstream-document-processor \
    --payload '{"text":"Test document for MV Ocean Star","type":"test","title":"Test Document"}' \
    --region "$AWS_REGION" \
    /tmp/test-doc-output.json > /dev/null

if [ $? -eq 0 ]; then
    echo "✓ Document processor test passed"
    cat /tmp/test-doc-output.json | python3 -m json.tool | head -10
else
    echo "❌ Document processor test failed"
fi
echo ""

# Summary
echo "============================================"
echo "✅ Deployment Complete!"
echo "============================================"
echo "Lambda functions deployed:"
echo "  • helmstream-document-processor (1024MB, 300s timeout)"
echo "  • helmstream-rag-engine (1024MB, 60s timeout)"
echo ""
echo "Next steps:"
echo "  1. Run: ./03_create_api_gateway.sh"
echo "  2. Test the RAG pipeline with sample documents"
echo "  3. Monitor costs in CloudWatch"
echo ""
echo "Function ARNs:"
aws lambda get-function \
    --function-name helmstream-document-processor \
    --region "$AWS_REGION" \
    --query 'Configuration.FunctionArn' \
    --output text

aws lambda get-function \
    --function-name helmstream-rag-engine \
    --region "$AWS_REGION" \
    --query 'Configuration.FunctionArn' \
    --output text
echo "============================================"
