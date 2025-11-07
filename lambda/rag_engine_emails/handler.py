"""
HelmStream - RAG Query Engine for Shipyard Emails
Stakeholder-aware query processing with temporal and causal reasoning
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal
import math
import re

# Initialize AWS clients
bedrock = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Configuration
EMAILS_TABLE = os.environ.get('DYNAMODB_TABLE_NAME', 'helmstream-emails')
CONVERSATIONS_TABLE = os.environ.get('CONVERSATIONS_TABLE_NAME', 'helmstream-conversations')
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
BEDROCK_EMBED_MODEL = os.environ.get('BEDROCK_TITAN_EMBED_MODEL_ID', 'amazon.titan-embed-text-v1')
BEDROCK_CLAUDE_MODEL = os.environ.get('BEDROCK_CLAUDE_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')

# Stakeholder roles for query parsing
STAKEHOLDER_ROLES = [
    "Local Agent", "Dock Scheduler", "Port Authority", "Tug/Mooring Lead",
    "Crane Supervisor", "Technical Lead", "Safety/Compliance",
    "Environmental Manager", "IT Support", "Cargo Owner Rep"
]

# Vessel names for filtering
VESSELS = [
    "MV Pacific Star", "MT Blue Horizon", "MV Baltic Trader",
    "MT Orange Grove", "MV Nordic Wave", "MV Sentinel"
]

# Event categories
EVENT_CATEGORIES = [
    "operational", "delay", "weather", "maintenance", "emergency",
    "completion", "scheduling", "conflict", "scope_expansion",
    "compliance", "environmental", "technical"
]


def lambda_handler(event, context):
    """
    Main handler for stakeholder-aware RAG queries

    Expected input:
    {
        "message": "What is the status of MV Pacific Star?",
        "conversation_id": "optional",
        "top_k": 5,
        "filters": {
            "vessel": "MV Pacific Star",
            "sender_role": "Local Agent",
            "event_category": "operational",
            "month": "06",
            "date_range": {"start": "2025-06-01", "end": "2025-06-30"}
        }
    }
    """

    try:
        # Parse request body
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event

        # Validate required fields
        if 'message' not in body:
            return error_response(400, "Missing required field: 'message'")

        query = body['message']
        conversation_id = body.get('conversation_id')
        top_k = body.get('top_k', 5)
        user_filters = body.get('filters', {})

        print(f"Processing query: {query[:100]}...")

        # Step 1: Extract filters from natural language query
        extracted_filters = extract_query_filters(query)
        # Merge with user-provided filters
        filters = {**extracted_filters, **user_filters}
        print(f"Query filters: {filters}")

        # Step 2: Generate query embedding
        print("Generating query embedding...")
        query_embedding = generate_embedding(query)
        print(f"✓ Query embedding generated")

        # Step 3: Retrieve similar emails with filters
        print(f"Retrieving top-{top_k} similar emails...")
        similar_emails = retrieve_similar_emails(query_embedding, top_k, filters)
        print(f"✓ Found {len(similar_emails)} similar emails")

        # Step 4: Fetch full email content from S3
        context_emails = []
        for email in similar_emails[:3]:  # Use top 3 for context
            try:
                email_content = fetch_email_from_s3(email['s3_uri'])
                context_emails.append({
                    'sender': email['sender'],
                    'sender_role': email['sender_role'],
                    'subject': email['subject'],
                    'date': email.get('date', email.get('timestamp', '')),
                    'vessel': email.get('vessel_involved', 'N/A'),
                    'event_category': email.get('event_category', 'N/A'),
                    'content': email_content.get('body', email.get('body_preview', '')),
                    'score': email['similarity_score']
                })
            except Exception as e:
                print(f"⚠️  Error fetching email {email['email_id']}: {str(e)}")
                # Use preview as fallback
                context_emails.append({
                    'sender': email['sender'],
                    'sender_role': email['sender_role'],
                    'subject': email['subject'],
                    'date': email.get('date', ''),
                    'vessel': email.get('vessel_involved', 'N/A'),
                    'event_category': email.get('event_category', 'N/A'),
                    'content': email.get('body_preview', ''),
                    'score': email['similarity_score']
                })

        print(f"✓ Retrieved {len(context_emails)} email contents")

        # Step 5: Generate stakeholder-aware response
        print("Generating response with Claude...")
        response_text, token_usage = generate_stakeholder_aware_response(
            query, context_emails, filters
        )
        print(f"✓ Response generated (tokens: {token_usage})")

        # Step 6: Save conversation
        if conversation_id:
            save_conversation_turn(conversation_id, query, response_text, similar_emails[:3])

        # Prepare response
        response_data = {
            'answer': response_text,
            'conversation_id': conversation_id,
            'token_usage': token_usage,
            'filters_applied': filters,
            'sources': [
                {
                    'email_id': email['email_id'],
                    'sender': email['sender'],
                    'sender_role': email['sender_role'],
                    'subject': email['subject'],
                    'date': email.get('date', ''),
                    'vessel': email.get('vessel_involved', 'N/A'),
                    'event_category': email.get('event_category', 'N/A'),
                    'similarity_score': float(email['similarity_score'])
                }
                for email in similar_emails
            ]
        }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data)
        }

    except Exception as e:
        print(f"❌ Error processing query: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(500, f"Error processing query: {str(e)}")


def extract_query_filters(query):
    """
    Extract filters from natural language query
    Supports: vessels, stakeholders, temporal references, event categories
    """
    filters = {}

    # Extract vessel names
    for vessel in VESSELS:
        if vessel.lower() in query.lower():
            filters['vessel'] = vessel
            break

    # Extract stakeholder roles
    for role in STAKEHOLDER_ROLES:
        if role.lower() in query.lower():
            filters['sender_role'] = role
            break

    # Extract event categories
    for category in EVENT_CATEGORIES:
        if category in query.lower():
            filters['event_category'] = category
            break

    # Extract temporal references
    months = {
        'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11'
    }
    for month_name, month_num in months.items():
        if month_name in query.lower():
            filters['month'] = month_num
            break

    # Extract specific keywords
    if 'delay' in query.lower() or 'delayed' in query.lower():
        filters['event_category'] = 'delay'
    if 'emergency' in query.lower():
        filters['event_category'] = 'emergency'
    if 'weather' in query.lower() or 'storm' in query.lower() or 'monsoon' in query.lower():
        filters['event_category'] = 'weather'

    return filters


def generate_embedding(text):
    """Generate 768-dimensional embedding using Bedrock Titan"""
    try:
        max_chars = 25000
        if len(text) > max_chars:
            text = text[:max_chars]

        response = bedrock.invoke_model(
            modelId=BEDROCK_EMBED_MODEL,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({'inputText': text})
        )

        result = json.loads(response['body'].read())
        return result['embedding']

    except Exception as e:
        print(f"❌ Error generating embedding: {str(e)}")
        raise


def retrieve_similar_emails(query_embedding, top_k=5, filters=None):
    """
    Retrieve top-K similar emails with metadata filtering
    """
    try:
        table = dynamodb.Table(EMAILS_TABLE)

        # Build filter expression if filters provided
        filter_expression = None
        expression_values = {}

        if filters:
            conditions = []
            if 'vessel' in filters and filters['vessel'] != 'N/A':
                conditions.append('vessel_involved = :vessel')
                expression_values[':vessel'] = filters['vessel']
            if 'sender_role' in filters:
                conditions.append('sender_role = :role')
                expression_values[':role'] = filters['sender_role']
            if 'event_category' in filters:
                conditions.append('event_category = :category')
                expression_values[':category'] = filters['event_category']
            if 'month' in filters:
                conditions.append('#m = :month')
                expression_values[':month'] = filters['month']

            if conditions:
                from boto3.dynamodb.conditions import Attr
                filter_expression = ' AND '.join(conditions)

        # Scan with filters
        scan_params = {}
        if filter_expression:
            scan_params['FilterExpression'] = filter_expression
            scan_params['ExpressionAttributeValues'] = expression_values
            if '#m' in filter_expression:
                scan_params['ExpressionAttributeNames'] = {'#m': 'month'}

        print(f"Scanning with filters: {filters}")
        response = table.scan(**scan_params)
        emails = response['Items']

        print(f"Found {len(emails)} emails after filtering")

        # Compute cosine similarity for each email
        similarities = []
        for email in emails:
            email_embedding = [float(x) for x in email['embedding']]
            similarity = cosine_similarity_pure_python(query_embedding, email_embedding)

            similarities.append({
                'email_id': email['email_id'],
                'timestamp': email.get('timestamp', ''),
                'sender': email['sender'],
                'sender_role': email['sender_role'],
                'recipients': email.get('recipients', []),
                'subject': email['subject'],
                'body_preview': email.get('body_preview', ''),
                's3_uri': email['s3_uri'],
                'vessel_involved': email.get('vessel_involved', 'N/A'),
                'event_category': email.get('event_category', 'operational'),
                'date': email.get('date', ''),
                'month': email.get('month', ''),
                'similarity_score': similarity
            })

        # Sort by similarity and return top-K
        similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similarities[:top_k]

    except Exception as e:
        print(f"❌ Error retrieving emails: {str(e)}")
        raise


def cosine_similarity_pure_python(vec1, vec2):
    """Compute cosine similarity without NumPy"""
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = math.sqrt(sum(a * a for a in vec1))
    magnitude2 = math.sqrt(sum(b * b for b in vec2))

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    return dot_product / (magnitude1 * magnitude2)


def fetch_email_from_s3(s3_uri):
    """Fetch full email content from S3"""
    try:
        parts = s3_uri.replace('s3://', '').split('/', 1)
        bucket = parts[0]
        key = parts[1]

        response = s3.get_object(Bucket=bucket, Key=key)
        return json.loads(response['Body'].read().decode('utf-8'))

    except Exception as e:
        print(f"❌ Error fetching from S3: {str(e)}")
        raise


def generate_stakeholder_aware_response(query, context_emails, filters):
    """
    Generate response with stakeholder perspective and temporal awareness
    """
    try:
        # Build rich context with stakeholder information
        context_parts = []
        for i, email in enumerate(context_emails, 1):
            context_parts.append(f"""
Email {i} - {email['date']} (Relevance: {email['score']:.2f})
From: {email['sender']} ({email['sender_role']})
Vessel: {email['vessel']}
Category: {email['event_category']}
Subject: {email['subject']}
---
{email['content'][:1500]}
""")

        context = "\n\n".join(context_parts)

        # Build filter context
        filter_context = ""
        if filters:
            filter_context = "\nQuery filters applied: " + ", ".join([f"{k}: {v}" for k, v in filters.items()])

        # Create stakeholder-aware prompt
        prompt = f"""You are an AI assistant helping shipyard operations staff understand and coordinate maritime vessel maintenance activities. You have access to a database of stakeholder communications (emails) spanning 6 months of operations.

Context Information:{filter_context}

Relevant Email Communications:
{context}

Question: {query}

Instructions:
- Answer based ONLY on the provided email communications
- Identify stakeholders involved and their roles
- Note temporal relationships (sequences, delays, timelines)
- Highlight causal relationships (what led to what)
- If discussing delays or issues, explain the root cause and impact
- If discussing decisions, cite who made them and why
- Be specific with dates, vessel names, and stakeholder names
- If the context doesn't contain enough information, say so clearly
- Maintain professional maritime operations language

Answer:"""

        # Call Claude 3 Sonnet
        response = bedrock.invoke_model(
            modelId=BEDROCK_CLAUDE_MODEL,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 1500,
                'temperature': 0.7,
                'messages': [{'role': 'user', 'content': prompt}]
            })
        )

        result = json.loads(response['body'].read())
        answer = result['content'][0]['text']

        token_usage = {
            'input_tokens': result['usage']['input_tokens'],
            'output_tokens': result['usage']['output_tokens']
        }

        print(f"[COST] Bedrock tokens - Input: {token_usage['input_tokens']}, Output: {token_usage['output_tokens']}")

        return answer, token_usage

    except Exception as e:
        print(f"❌ Error generating response: {str(e)}")
        raise


def save_conversation_turn(conversation_id, user_message, assistant_message, sources):
    """Save conversation turn to DynamoDB"""
    try:
        table = dynamodb.Table(CONVERSATIONS_TABLE)
        timestamp = datetime.now().isoformat()

        # Save user message
        table.put_item(Item={
            'conversation_id': conversation_id,
            'timestamp': f"{timestamp}_user",
            'role': 'user',
            'message': user_message
        })

        # Save assistant message
        table.put_item(Item={
            'conversation_id': conversation_id,
            'timestamp': f"{timestamp}_assistant",
            'role': 'assistant',
            'message': assistant_message,
            'sources': [{'email_id': s['email_id'], 'sender': s['sender']} for s in sources]
        })

        print(f"✓ Conversation saved: {conversation_id}")

    except Exception as e:
        print(f"⚠️  Error saving conversation: {str(e)}")


def error_response(status_code, message):
    """Generate error response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }


# For local testing
if __name__ == '__main__':
    test_event = {
        'message': 'What is the status of MV Pacific Star?'
    }

    class Context:
        def __init__(self):
            self.function_name = 'test-function'

    result = lambda_handler(test_event, Context())
    print(json.dumps(json.loads(result['body']), indent=2))
