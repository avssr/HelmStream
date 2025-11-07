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
