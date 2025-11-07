#!/bin/bash

# HelmStream - Create Lambda Function Directories and Code
# This script creates the shipyard-specific Lambda functions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_DIR="$SCRIPT_DIR/../lambda"

echo "============================================"
echo "Creating HelmStream Lambda Functions"
echo "============================================"

# Create lambda directory structure
mkdir -p "$LAMBDA_DIR/email_processor"
mkdir -p "$LAMBDA_DIR/rag_engine_emails"

echo "✓ Created Lambda directories"

# Create email_processor requirements.txt
cat > "$LAMBDA_DIR/email_processor/requirements.txt" << 'EOF'
boto3>=1.28.0
EOF

# Create email_processor handler.py
cat > "$LAMBDA_DIR/email_processor/handler.py" << 'EOF'
#!/usr/bin/env python3
"""
HelmStream - Email Processor Lambda Function
Processes shipyard emails with stakeholder metadata and generates embeddings
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3_client = boto3.client('s3')

# Environment variables
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'helmstream-emails')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
BEDROCK_TITAN_EMBED_MODEL_ID = os.environ.get('BEDROCK_TITAN_EMBED_MODEL_ID', 'amazon.titan-embed-text-v1')


def generate_embedding(text):
    """Generate embedding using Amazon Titan"""
    try:
        response = bedrock_runtime.invoke_model(
            modelId=BEDROCK_TITAN_EMBED_MODEL_ID,
            body=json.dumps({"inputText": text})
        )
        result = json.loads(response['body'].read())
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        raise


def process_single_email(email_data):
    """Process a single email and store in DynamoDB"""
    date = email_data.get('date', '')
    time = email_data.get('time', '')
    sender = email_data.get('sender', '')
    sender_role = email_data.get('sender_role', 'Unknown')
    recipients = email_data.get('recipients', [])
    subject = email_data.get('subject', '')
    body = email_data.get('body', '')
    email_type = email_data.get('email_type', 'operational')
    month = email_data.get('month', '')
    vessel_involved = email_data.get('vessel_involved', '')
    event_category = email_data.get('event_category', 'operational')

    timestamp = f"{date}T{time}" if date and time else datetime.utcnow().isoformat()
    email_id = f"email_{date.replace('-', '')}_{time.replace(':', '')}" if date and time else f"email_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

    rich_text = f"""
Sender: {sender} ({sender_role})
Recipients: {', '.join(recipients) if isinstance(recipients, list) else recipients}
Subject: {subject}
Date: {date}
Vessel: {vessel_involved or 'N/A'}
Category: {event_category}

{body}
    """.strip()

    print(f"Generating embedding for email: {email_id}")
    embedding = generate_embedding(rich_text)

    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    item = {
        'email_id': email_id,
        'timestamp': timestamp,
        'date': date,
        'time': time,
        'sender': sender,
        'sender_role': sender_role,
        'recipients': recipients if isinstance(recipients, list) else [recipients],
        'subject': subject,
        'body': body[:500] if len(body) > 500 else body,
        'body_preview': body[:200] if len(body) > 200 else body,
        'email_type': email_type,
        'vessel_involved': vessel_involved,
        'event_category': event_category,
        'month': month,
        'embedding': [Decimal(str(x)) for x in embedding],
        'created_at': datetime.utcnow().isoformat()
    }

    print(f"Storing email in DynamoDB: {email_id}")
    table.put_item(Item=item)

    return {
        'email_id': email_id,
        'sender': sender,
        'subject': subject,
        'vessel': vessel_involved
    }


def lambda_handler(event, context):
    """Lambda handler for processing emails"""
    try:
        if 'emails' in event:
            emails = event['emails']
        elif 'email' in event:
            emails = [event['email']]
        else:
            emails = [event]

        results = []
        for email_data in emails:
            try:
                result = process_single_email(email_data)
                results.append(result)
            except Exception as e:
                print(f"Error processing email: {str(e)}")
                results.append({'error': str(e), 'email_data': email_data})

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Processed {len(results)} emails',
                'emails_processed': len(results),
                'results': results
            })
        }
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
EOF

echo "✓ Created email_processor Lambda function"

# Create rag_engine_emails requirements.txt
cat > "$LAMBDA_DIR/rag_engine_emails/requirements.txt" << 'EOF'
boto3>=1.28.0
EOF

# Create rag_engine_emails handler.py
cat > "$LAMBDA_DIR/rag_engine_emails/handler.py" << 'EOF'
#!/usr/bin/env python3
"""
HelmStream - RAG Engine for Emails Lambda Function
Stakeholder-aware query engine with automatic filter extraction
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'helmstream-emails')
BEDROCK_CLAUDE_MODEL_ID = os.environ.get('BEDROCK_CLAUDE_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
BEDROCK_TITAN_EMBED_MODEL_ID = os.environ.get('BEDROCK_TITAN_EMBED_MODEL_ID', 'amazon.titan-embed-text-v1')

# Shipyard metadata
VESSELS = ['MV Pacific Star', 'MT Blue Horizon', 'MV Baltic Trader', 'MT Orange Grove', 'MV Nordic Wave', 'MV Sentinel']
STAKEHOLDER_ROLES = ['Local Agent', 'Dock Scheduler', 'Port Authority', 'Tug/Mooring Lead', 'Crane Supervisor',
                     'Technical Lead', 'Safety/Compliance', 'Environmental Manager', 'IT Support', 'Cargo Owner Rep']


def cosine_similarity(vec1, vec2):
    """Pure Python cosine similarity"""
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = sum(a * a for a in vec1) ** 0.5
    magnitude2 = sum(b * b for b in vec2) ** 0.5
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)


def generate_embedding(text):
    """Generate embedding using Amazon Titan"""
    response = bedrock_runtime.invoke_model(
        modelId=BEDROCK_TITAN_EMBED_MODEL_ID,
        body=json.dumps({"inputText": text})
    )
    result = json.loads(response['body'].read())
    return result['embedding']


def extract_query_filters(query):
    """Extract filters from natural language query"""
    filters = {}
    query_lower = query.lower()

    # Extract vessel names
    for vessel in VESSELS:
        if vessel.lower() in query_lower:
            filters['vessel'] = vessel
            break

    # Extract stakeholder roles (look for first names or roles)
    stakeholder_map = {
        'maria': 'Local Agent',
        'luke': 'Dock Scheduler',
        'emma': 'Port Authority',
        'steve': 'Tug/Mooring Lead',
        'priya': 'Crane Supervisor',
        'rajesh': 'Technical Lead',
        'sarah': 'Safety/Compliance',
        'david': 'Environmental Manager',
        'chloe': 'IT Support',
        'alan': 'Cargo Owner Rep'
    }

    for name, role in stakeholder_map.items():
        if name in query_lower:
            filters['sender_role'] = role
            break

    # Extract temporal references
    months = {
        'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11'
    }

    for month_name, month_num in months.items():
        if month_name in query_lower:
            filters['month'] = month_num
            break

    # Extract event categories
    categories = ['delay', 'weather', 'emergency', 'maintenance', 'scope_expansion',
                 'completion', 'scheduling', 'conflict', 'environmental', 'compliance']

    for category in categories:
        if category in query_lower or category.replace('_', ' ') in query_lower:
            filters['event_category'] = category
            break

    return filters


def retrieve_similar_emails(query_embedding, top_k=5, filters=None):
    """Retrieve similar emails with optional metadata filtering"""
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)

    # Build filter expression
    filter_expression = None
    expression_values = {}

    if filters:
        conditions = []
        if 'vessel' in filters:
            conditions.append('vessel_involved = :vessel')
            expression_values[':vessel'] = filters['vessel']
        if 'sender_role' in filters:
            conditions.append('sender_role = :role')
            expression_values[':role'] = filters['sender_role']
        if 'month' in filters:
            conditions.append('#month = :month')
            expression_values[':month'] = filters['month']
        if 'event_category' in filters:
            conditions.append('event_category = :category')
            expression_values[':category'] = filters['event_category']

        if conditions:
            from boto3.dynamodb.conditions import Attr
            filter_expression = eval(' & '.join([f"Attr('{c.split(' = ')[0]}').eq({c.split(' = ')[1]})" for c in conditions]))

    # Scan with filters
    scan_kwargs = {}
    if filter_expression:
        scan_kwargs['FilterExpression'] = filter_expression

    response = table.scan(**scan_kwargs)
    emails = response['Items']

    # Compute similarity scores
    for email in emails:
        email_embedding = [float(x) for x in email.get('embedding', [])]
        if email_embedding:
            email['similarity_score'] = cosine_similarity(query_embedding, email_embedding)
        else:
            email['similarity_score'] = 0.0

    # Sort by similarity and return top_k
    emails.sort(key=lambda x: x['similarity_score'], reverse=True)
    return emails[:top_k]


def generate_response(query, relevant_emails):
    """Generate response using Claude with email context"""
    # Format context
    context = "\n\n".join([
        f"Email {i+1} [{email.get('sender_role', 'Unknown')}] {email.get('sender', 'Unknown')} - {email.get('date', 'Unknown date')}\n"
        f"Subject: {email.get('subject', '')}\n"
        f"Vessel: {email.get('vessel_involved', 'N/A')}\n"
        f"Category: {email.get('event_category', 'N/A')}\n"
        f"Body: {email.get('body', email.get('body_preview', ''))}"
        for i, email in enumerate(relevant_emails)
    ])

    prompt = f"""You are a helpful assistant for a shipyard operations system. Answer the user's question based on the email communications provided.

Email Context:
{context}

User Question: {query}

Provide a clear, concise answer based on the email communications above. Cite specific emails and stakeholders when relevant."""

    # Call Claude
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    response = bedrock_runtime.invoke_model(
        modelId=BEDROCK_CLAUDE_MODEL_ID,
        body=json.dumps(request_body)
    )

    result = json.loads(response['body'].read())
    answer = result['content'][0]['text']

    return answer, result.get('usage', {})


def lambda_handler(event, context):
    """Lambda handler for RAG queries"""
    try:
        # Parse input
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event

        query = body.get('message') or body.get('query')
        top_k = body.get('top_k', 5)

        if not query:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No query provided'})
            }

        # Extract filters from query
        filters = extract_query_filters(query)

        # Generate query embedding
        query_embedding = generate_embedding(query)

        # Retrieve similar emails
        relevant_emails = retrieve_similar_emails(query_embedding, top_k=top_k, filters=filters)

        if not relevant_emails:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'answer': 'No relevant emails found for your query.',
                    'sources': [],
                    'filters_applied': filters
                })
            }

        # Generate response
        answer, token_usage = generate_response(query, relevant_emails)

        # Format sources
        sources = [
            {
                'email_id': email['email_id'],
                'sender': email.get('sender', ''),
                'sender_role': email.get('sender_role', ''),
                'subject': email.get('subject', ''),
                'date': email.get('date', ''),
                'vessel': email.get('vessel_involved', ''),
                'event_category': email.get('event_category', ''),
                'similarity_score': email['similarity_score']
            }
            for email in relevant_emails
        ]

        return {
            'statusCode': 200,
            'body': json.dumps({
                'answer': answer,
                'sources': sources,
                'filters_applied': filters,
                'token_usage': token_usage
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
EOF

echo "✓ Created rag_engine_emails Lambda function"

echo ""
echo "============================================"
echo "✅ Lambda Functions Created Successfully!"
echo "============================================"
echo "Created:"
echo "  • lambda/email_processor/handler.py"
echo "  • lambda/email_processor/requirements.txt"
echo "  • lambda/rag_engine_emails/handler.py"
echo "  • lambda/rag_engine_emails/requirements.txt"
echo ""
echo "Next step: Run ./02_deploy_lambda_functions.sh"
echo "============================================"
