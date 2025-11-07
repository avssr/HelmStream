#!/bin/bash

# HelmStream - AWS Infrastructure Setup Script
# Phase 1: Core AWS Resources Setup

set -e  # Exit on error

# Configuration
AWS_REGION="us-east-1"
PROJECT_NAME="helmstream"
BUCKET_NAME="${PROJECT_NAME}-maritime-docs-$(date +%s)"  # Add timestamp for uniqueness
TABLE_NAME="${PROJECT_NAME}-documents"

echo "============================================"
echo "HelmStream AWS Infrastructure Setup"
echo "============================================"
echo "Region: $AWS_REGION"
echo "S3 Bucket: $BUCKET_NAME"
echo "DynamoDB Table: $TABLE_NAME"
echo ""

# Check AWS CLI installation
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo "✓ Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✓ AWS Account ID: $ACCOUNT_ID"
echo ""

# Step 1: Create S3 Bucket
echo "📦 Step 1: Creating S3 bucket..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
    echo "✓ S3 bucket created: $BUCKET_NAME"

    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
    echo "✓ Versioning enabled"

    # Block public access
    aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    echo "✓ Public access blocked"

    # Add lifecycle policy for cost optimization
    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$BUCKET_NAME" \
        --lifecycle-configuration file://$(dirname "$0")/s3-lifecycle-policy.json
    echo "✓ Lifecycle policy applied"
else
    echo "⚠️  S3 bucket already exists: $BUCKET_NAME"
fi
echo ""

# Step 2: Create DynamoDB Table
echo "🗄️  Step 2: Creating DynamoDB table..."
if ! aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$AWS_REGION" &> /dev/null; then
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions \
            AttributeName=document_id,AttributeType=S \
            AttributeName=type,AttributeType=S \
            AttributeName=created_at,AttributeType=S \
        --key-schema \
            AttributeName=document_id,KeyType=HASH \
        --global-secondary-indexes \
            "IndexName=type-created-index,KeySchema=[{AttributeName=type,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION"

    echo "✓ DynamoDB table created: $TABLE_NAME"
    echo "⏳ Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$AWS_REGION"
    echo "✓ Table is active"
else
    echo "⚠️  DynamoDB table already exists: $TABLE_NAME"
fi
echo ""

# Step 3: Create IAM Role for Lambda
echo "🔐 Step 3: Creating IAM role for Lambda..."
ROLE_NAME="${PROJECT_NAME}-lambda-role"

if ! aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
    # Create role
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file://$(dirname "$0")/lambda-trust-policy.json \
        --description "Execution role for HelmStream Lambda functions"

    echo "✓ IAM role created: $ROLE_NAME"

    # Attach policies
    aws iam put-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-name "${PROJECT_NAME}-lambda-policy" \
        --policy-document file://$(dirname "$0")/lambda-execution-policy.json

    echo "✓ Lambda execution policy attached"

    # Wait for role to propagate
    echo "⏳ Waiting for IAM role to propagate (10 seconds)..."
    sleep 10
else
    echo "⚠️  IAM role already exists: $ROLE_NAME"
fi
echo ""

# Step 4: Check Bedrock Model Access
echo "🤖 Step 4: Checking Amazon Bedrock model access..."
echo "⚠️  IMPORTANT: You need to manually enable model access in AWS Console:"
echo "   1. Go to: https://console.aws.amazon.com/bedrock/home?region=$AWS_REGION#/modelaccess"
echo "   2. Click 'Enable specific models'"
echo "   3. Enable: Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)"
echo "   4. Enable: Titan Embeddings G1 - Text (amazon.titan-embed-text-v1)"
echo "   5. Wait for approval (usually instant)"
echo ""

# Step 5: Save Configuration
echo "💾 Step 5: Saving configuration..."
CONFIG_FILE="$(dirname "$0")/../.env"
cat > "$CONFIG_FILE" << EOF
# HelmStream AWS Configuration
# Generated on $(date)

AWS_REGION=$AWS_REGION
AWS_ACCOUNT_ID=$ACCOUNT_ID
S3_BUCKET_NAME=$BUCKET_NAME
DYNAMODB_TABLE_NAME=$TABLE_NAME
IAM_ROLE_NAME=$ROLE_NAME
IAM_ROLE_ARN=arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME

# Bedrock Model IDs
BEDROCK_CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_TITAN_EMBED_MODEL_ID=amazon.titan-embed-text-v1
EOF

echo "✓ Configuration saved to: $CONFIG_FILE"
echo ""

# Summary
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo "Resources created:"
echo "  • S3 Bucket: $BUCKET_NAME"
echo "  • DynamoDB Table: $TABLE_NAME"
echo "  • IAM Role: $ROLE_NAME"
echo ""
echo "Next steps:"
echo "  1. Enable Bedrock model access (see link above)"
echo "  2. Run: ./02_deploy_lambda_functions.sh"
echo "  3. Test the RAG pipeline"
echo ""
echo "Configuration saved to: $CONFIG_FILE"
echo "============================================"
