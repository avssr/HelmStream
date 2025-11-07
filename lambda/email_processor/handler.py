"""
HelmStream - Email Processor Lambda Function
Handles shipyard email data with stakeholder metadata and temporal context
Optimized for the shipyard 6-month simulation dataset
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# Initialize AWS clients
bedrock = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Configuration
TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'helmstream-emails')
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
BEDROCK_EMBED_MODEL = os.environ.get('BEDROCK_TITAN_EMBED_MODEL_ID', 'amazon.titan-embed-text-v1')


def lambda_handler(event, context):
    """
    Process shipyard emails with full metadata

    Expected input (from shipyard_emails_flat.csv):
    {
        "date": "2025-06-01",
        "time": "08:00",
        "sender": "Maria Gonzalez",
        "sender_role": "Local Agent",
        "recipients": ["Luke Chen", "Emma Riley"],
        "subject": "MV Pacific Star - Dry Dock Allocation Request",
        "body": "Email content...",
        "email_type": "operational",
        "month": "06",
        "vessel_involved": "MV Pacific Star",
        "event_category": "scheduling"
    }
    """

    try:
        # Parse request body
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event

        # Handle batch processing
        if 'emails' in body:
            results = []
            for email in body['emails']:
                result = process_single_email(email)
                results.append(result)
            return batch_response(results)
        else:
            # Single email processing
            result = process_single_email(body)
            return success_response(result)

    except Exception as e:
        print(f"❌ Error processing email: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(500, f"Error processing email: {str(e)}")


def process_single_email(email_data):
    """Process a single email"""

    # Validate required fields
    required_fields = ['sender', 'subject', 'body']
    for field in required_fields:
        if field not in email_data:
            raise ValueError(f"Missing required field: {field}")

    # Extract email data
    sender = email_data['sender']
    sender_role = email_data.get('sender_role', 'Unknown')
    recipients = email_data.get('recipients', [])
    subject = email_data['subject']
    body = email_data['body']
    email_type = email_data.get('email_type', 'general')
    vessel_involved = email_data.get('vessel_involved')
    event_category = email_data.get('event_category', 'operational')
    date = email_data.get('date')
    time = email_data.get('time')
    month = email_data.get('month')

    print(f"Processing email from {sender} ({sender_role}): {subject[:50]}...")

    # Generate unique email ID
    timestamp = f"{date}T{time}" if date and time else datetime.now().isoformat()
    email_id = f"email_{date.replace('-', '')}_{time.replace(':', '')}" if date and time else f"email_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"

    # Create rich text for embedding (combines subject + body + metadata)
    # This improves retrieval by including context
    rich_text = f"""
Sender: {sender} ({sender_role})
Recipients: {', '.join(recipients) if recipients else 'N/A'}
Subject: {subject}
Date: {date} {time}
Vessel: {vessel_involved or 'N/A'}
Category: {event_category}

{body}
    """.strip()

    # Generate embedding
    print("Generating embedding...")
    embedding = generate_embedding(rich_text)
    print(f"✓ Embedding generated ({len(embedding)} dimensions)")

    # Store full email in S3
    s3_key = f"emails/{month or 'unknown'}/{email_id}.json"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=s3_key,
        Body=json.dumps(email_data, indent=2).encode('utf-8'),
        ContentType='application/json',
        Metadata={
            'email-id': email_id,
            'sender': sender,
            'vessel': vessel_involved or 'none'
        }
    )
    s3_uri = f"s3://{BUCKET_NAME}/{s3_key}"
    print(f"✓ Email stored in S3: {s3_uri}")

    # Create body preview
    body_preview = body[:500] if len(body) > 500 else body

    # Store in DynamoDB with rich metadata
    table = dynamodb.Table(TABLE_NAME)
    item = {
        'email_id': email_id,
        'timestamp': timestamp,
        'sender': sender,
        'sender_role': sender_role,
        'recipients': recipients,
        'subject': subject,
        'body_preview': body_preview,
        's3_uri': s3_uri,
        'email_type': email_type,
        'vessel_involved': vessel_involved or 'none',
        'event_category': event_category,
        'month': month or timestamp[:7],  # YYYY-MM
        'date': date or timestamp[:10],    # YYYY-MM-DD
        'embedding': [Decimal(str(x)) for x in embedding],
        'created_at': datetime.now().isoformat()
    }

    table.put_item(Item=item)
    print(f"✓ Email metadata stored in DynamoDB: {email_id}")

    return {
        'email_id': email_id,
        'status': 'processed',
        'sender': sender,
        'sender_role': sender_role,
        'vessel': vessel_involved,
        'event_category': event_category,
        'embedding_dimensions': len(embedding)
    }


def generate_embedding(text):
    """Generate 768-dimensional embedding using Bedrock Titan"""
    try:
        # Truncate if needed
        max_chars = 25000
        if len(text) > max_chars:
            print(f"⚠️  Text truncated from {len(text)} to {max_chars} characters")
            text = text[:max_chars]

        response = bedrock.invoke_model(
            modelId=BEDROCK_EMBED_MODEL,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({'inputText': text})
        )

        result = json.loads(response['body'].read())
        embedding = result['embedding']

        if not isinstance(embedding, list) or len(embedding) != 768:
            raise ValueError(f"Invalid embedding: expected 768 dimensions, got {len(embedding)}")

        return embedding

    except Exception as e:
        print(f"❌ Error generating embedding: {str(e)}")
        raise


def success_response(result):
    """Generate success response"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result)
    }


def batch_response(results):
    """Generate batch response"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'emails_processed': len(results),
            'results': results
        })
    }


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
        "date": "2025-06-01",
        "time": "08:00",
        "sender": "Maria Gonzalez",
        "sender_role": "Local Agent",
        "recipients": ["Luke Chen", "Emma Riley"],
        "subject": "MV Pacific Star - Dry Dock Allocation Request",
        "body": "Hi Luke and Emma, I'm coordinating the dry dock allocation for MV Pacific Star arriving June 10. The vessel requires routine maintenance with estimated 5-day duration. Can we secure Dock 1 for June 10-15?",
        "email_type": "operational",
        "month": "06",
        "vessel_involved": "MV Pacific Star",
        "event_category": "scheduling"
    }

    class Context:
        def __init__(self):
            self.function_name = 'test-function'

    result = lambda_handler(test_event, Context())
    print(json.dumps(json.loads(result['body']), indent=2))
