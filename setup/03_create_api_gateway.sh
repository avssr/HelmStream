#!/bin/bash

# HelmStream - API Gateway Setup Script
# Phase 3: Create REST API with Lambda integrations

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
echo "HelmStream API Gateway Setup"
echo "============================================"
echo "Region: $AWS_REGION"
echo ""

API_NAME="helmstream-api"

# Step 1: Create REST API
echo "📡 Step 1: Creating REST API..."
API_ID=$(aws apigateway get-rest-apis --region "$AWS_REGION" --query "items[?name=='$API_NAME'].id" --output text)

if [ -z "$API_ID" ]; then
    API_ID=$(aws apigateway create-rest-api \
        --name "$API_NAME" \
        --description "HelmStream Shipyard Operations API" \
        --region "$AWS_REGION" \
        --endpoint-configuration types=REGIONAL \
        --query 'id' \
        --output text)
    echo "✓ Created API: $API_ID"
else
    echo "⚠️  API already exists: $API_ID"
fi

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id "$API_ID" \
    --region "$AWS_REGION" \
    --query 'items[?path==`/`].id' \
    --output text)

echo "✓ Root resource ID: $ROOT_RESOURCE_ID"
echo ""

# Step 2: Create /query resource and POST method
echo "📋 Step 2: Creating /query endpoint..."

# Check if resource exists
QUERY_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id "$API_ID" \
    --region "$AWS_REGION" \
    --query 'items[?pathPart==`query`].id' \
    --output text)

if [ -z "$QUERY_RESOURCE_ID" ]; then
    QUERY_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$ROOT_RESOURCE_ID" \
        --path-part "query" \
        --region "$AWS_REGION" \
        --query 'id' \
        --output text)
    echo "✓ Created /query resource: $QUERY_RESOURCE_ID"
else
    echo "⚠️  /query resource already exists: $QUERY_RESOURCE_ID"
fi

# Create POST method for /query
if ! aws apigateway get-method \
    --rest-api-id "$API_ID" \
    --resource-id "$QUERY_RESOURCE_ID" \
    --http-method POST \
    --region "$AWS_REGION" &> /dev/null; then

    aws apigateway put-method \
        --rest-api-id "$API_ID" \
        --resource-id "$QUERY_RESOURCE_ID" \
        --http-method POST \
        --authorization-type NONE \
        --region "$AWS_REGION" > /dev/null

    echo "✓ Created POST method for /query"
else
    echo "⚠️  POST method already exists for /query"
fi

# Integrate with RAG engine Lambda
LAMBDA_ARN="arn:aws:lambda:$AWS_REGION:$AWS_ACCOUNT_ID:function:helmstream-rag-engine-emails"
LAMBDA_URI="arn:aws:apigateway:$AWS_REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$QUERY_RESOURCE_ID" \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "$LAMBDA_URI" \
    --region "$AWS_REGION" > /dev/null

echo "✓ Integrated /query with Lambda"

# Add Lambda permission for API Gateway
aws lambda add-permission \
    --function-name helmstream-rag-engine-emails \
    --statement-id apigateway-query-$(date +%s) \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$AWS_REGION:$AWS_ACCOUNT_ID:$API_ID/*/*/query" \
    --region "$AWS_REGION" 2>/dev/null || echo "  (permission may already exist)"

echo ""

# Step 3: Create /process-email resource and POST method
echo "📧 Step 3: Creating /process-email endpoint..."

# Check if resource exists
EMAIL_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id "$API_ID" \
    --region "$AWS_REGION" \
    --query 'items[?pathPart==`process-email`].id' \
    --output text)

if [ -z "$EMAIL_RESOURCE_ID" ]; then
    EMAIL_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id "$API_ID" \
        --parent-id "$ROOT_RESOURCE_ID" \
        --path-part "process-email" \
        --region "$AWS_REGION" \
        --query 'id' \
        --output text)
    echo "✓ Created /process-email resource: $EMAIL_RESOURCE_ID"
else
    echo "⚠️  /process-email resource already exists: $EMAIL_RESOURCE_ID"
fi

# Create POST method for /process-email
if ! aws apigateway get-method \
    --rest-api-id "$API_ID" \
    --resource-id "$EMAIL_RESOURCE_ID" \
    --http-method POST \
    --region "$AWS_REGION" &> /dev/null; then

    aws apigateway put-method \
        --rest-api-id "$API_ID" \
        --resource-id "$EMAIL_RESOURCE_ID" \
        --http-method POST \
        --authorization-type NONE \
        --region "$AWS_REGION" > /dev/null

    echo "✓ Created POST method for /process-email"
else
    echo "⚠️  POST method already exists for /process-email"
fi

# Integrate with email processor Lambda
EMAIL_LAMBDA_ARN="arn:aws:lambda:$AWS_REGION:$AWS_ACCOUNT_ID:function:helmstream-email-processor"
EMAIL_LAMBDA_URI="arn:aws:apigateway:$AWS_REGION:lambda:path/2015-03-31/functions/$EMAIL_LAMBDA_ARN/invocations"

aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$EMAIL_RESOURCE_ID" \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "$EMAIL_LAMBDA_URI" \
    --region "$AWS_REGION" > /dev/null

echo "✓ Integrated /process-email with Lambda"

# Add Lambda permission for API Gateway
aws lambda add-permission \
    --function-name helmstream-email-processor \
    --statement-id apigateway-email-$(date +%s) \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$AWS_REGION:$AWS_ACCOUNT_ID:$API_ID/*/*/process-email" \
    --region "$AWS_REGION" 2>/dev/null || echo "  (permission may already exist)"

echo ""

# Step 4: Enable CORS for both endpoints
echo "🌐 Step 4: Enabling CORS..."

for RESOURCE_ID in "$QUERY_RESOURCE_ID" "$EMAIL_RESOURCE_ID"; do
    # Create OPTIONS method
    if ! aws apigateway get-method \
        --rest-api-id "$API_ID" \
        --resource-id "$RESOURCE_ID" \
        --http-method OPTIONS \
        --region "$AWS_REGION" &> /dev/null; then

        aws apigateway put-method \
            --rest-api-id "$API_ID" \
            --resource-id "$RESOURCE_ID" \
            --http-method OPTIONS \
            --authorization-type NONE \
            --region "$AWS_REGION" > /dev/null

        aws apigateway put-integration \
            --rest-api-id "$API_ID" \
            --resource-id "$RESOURCE_ID" \
            --http-method OPTIONS \
            --type MOCK \
            --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
            --region "$AWS_REGION" > /dev/null

        aws apigateway put-method-response \
            --rest-api-id "$API_ID" \
            --resource-id "$RESOURCE_ID" \
            --http-method OPTIONS \
            --status-code 200 \
            --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' \
            --region "$AWS_REGION" > /dev/null

        aws apigateway put-integration-response \
            --rest-api-id "$API_ID" \
            --resource-id "$RESOURCE_ID" \
            --http-method OPTIONS \
            --status-code 200 \
            --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'POST,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
            --region "$AWS_REGION" > /dev/null
    fi
done

echo "✓ CORS enabled"
echo ""

# Step 5: Deploy API
echo "🚀 Step 5: Deploying API..."

DEPLOYMENT_ID=$(aws apigateway create-deployment \
    --rest-api-id "$API_ID" \
    --stage-name prod \
    --stage-description "Production stage" \
    --description "HelmStream API deployment $(date)" \
    --region "$AWS_REGION" \
    --query 'id' \
    --output text)

echo "✓ Deployed to production: $DEPLOYMENT_ID"
echo ""

# Step 6: Get API URL
API_URL="https://$API_ID.execute-api.$AWS_REGION.amazonaws.com/prod"

echo "============================================"
echo "✅ API Gateway Setup Complete!"
echo "============================================"
echo ""
echo "📡 API URL: $API_URL"
echo ""
echo "Endpoints:"
echo "  • POST $API_URL/query"
echo "  • POST $API_URL/process-email"
echo ""
echo "============================================"
echo "🧪 Test with cURL or Postman:"
echo "============================================"
echo ""
echo "Query endpoint:"
echo "curl -X POST $API_URL/query \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\":\"What is the status of MV Pacific Star?\",\"top_k\":5}'"
echo ""
echo "Process email endpoint:"
echo "curl -X POST $API_URL/process-email \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":{\"date\":\"2025-06-01\",\"time\":\"08:00\",\"sender\":\"Test User\",\"sender_role\":\"Local Agent\",\"recipients\":[\"User 2\"],\"subject\":\"Test\",\"body\":\"Test email\",\"email_type\":\"test\",\"month\":\"06\",\"vessel_involved\":\"MV Test\",\"event_category\":\"test\"}}'"
echo ""
echo "============================================"

# Save API URL to config
echo "" >> "$CONFIG_FILE"
echo "# API Gateway" >> "$CONFIG_FILE"
echo "API_GATEWAY_ID=$API_ID" >> "$CONFIG_FILE"
echo "API_GATEWAY_URL=$API_URL" >> "$CONFIG_FILE"

echo "✓ Configuration updated: $CONFIG_FILE"
echo ""
echo "Next steps:"
echo "  1. Test the API endpoints with Postman"
echo "  2. Run: python3 ingest_shipyard_emails.py (to load 88 emails)"
echo "  3. Query the system via API!"
echo "============================================"
