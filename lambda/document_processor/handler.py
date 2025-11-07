"""
HelmStream - Document Processor Lambda Function
Handles document upload, text extraction, embedding generation, and storage
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

# Configuration from environment variables
TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'helmstream-documents')
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
BEDROCK_EMBED_MODEL = os.environ.get('BEDROCK_TITAN_EMBED_MODEL_ID', 'amazon.titan-embed-text-v1')


def lambda_handler(event, context):
    """
    Main handler for document processing

    Expected input:
    {
        "text": "document content...",
        "type": "invoice|port_report|certificate|general",
        "title": "Document Title",
        "metadata": {
            "vendor": "...",
            "date": "...",
            "amount": 1000
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
        if 'text' not in body:
            return error_response(400, "Missing required field: 'text'")

        document_text = body['text']
        document_type = body.get('type', 'general')
        title = body.get('title', 'Untitled Document')
        metadata = body.get('metadata', {})

        print(f"Processing document: {title} (type: {document_type})")

        # Generate unique document ID
        doc_id = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"

        # Step 1: Store document text in S3
        s3_key = f"documents/{document_type}/{doc_id}.txt"
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=document_text.encode('utf-8'),
            ContentType='text/plain',
            Metadata={
                'document-id': doc_id,
                'document-type': document_type,
                'title': title
            }
        )
        s3_uri = f"s3://{BUCKET_NAME}/{s3_key}"
        print(f"✓ Document stored in S3: {s3_uri}")

        # Step 2: Generate embedding using Bedrock Titan
        print("Generating embedding...")
        embedding = generate_embedding(document_text)
        print(f"✓ Embedding generated ({len(embedding)} dimensions)")

        # Step 3: Create text preview
        text_preview = document_text[:500] if len(document_text) > 500 else document_text

        # Step 4: Store in DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        item = {
            'document_id': doc_id,
            'type': document_type,
            'title': title,
            's3_uri': s3_uri,
            'metadata': metadata,
            'embedding': [Decimal(str(x)) for x in embedding],  # Convert to Decimal for DynamoDB
            'created_at': datetime.now().isoformat(),
            'text_preview': text_preview
        }

        table.put_item(Item=item)
        print(f"✓ Document metadata stored in DynamoDB: {doc_id}")

        # Return success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'document_id': doc_id,
                'status': 'processed',
                's3_uri': s3_uri,
                'type': document_type,
                'title': title,
                'embedding_dimensions': len(embedding),
                'created_at': item['created_at']
            })
        }

    except Exception as e:
        print(f"❌ Error processing document: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(500, f"Error processing document: {str(e)}")


def generate_embedding(text):
    """
    Generate 768-dimensional embedding using Bedrock Titan Embeddings

    Args:
        text (str): Text to embed

    Returns:
        list: 768-dimensional embedding vector
    """
    try:
        # Truncate text if too long (Titan has 8K token limit)
        max_chars = 25000  # Roughly 8K tokens
        if len(text) > max_chars:
            print(f"⚠️  Text truncated from {len(text)} to {max_chars} characters")
            text = text[:max_chars]

        # Call Bedrock Titan Embeddings
        response = bedrock.invoke_model(
            modelId=BEDROCK_EMBED_MODEL,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'inputText': text
            })
        )

        # Parse response
        result = json.loads(response['body'].read())
        embedding = result['embedding']

        # Validate embedding
        if not isinstance(embedding, list) or len(embedding) != 768:
            raise ValueError(f"Invalid embedding: expected 768 dimensions, got {len(embedding)}")

        return embedding

    except Exception as e:
        print(f"❌ Error generating embedding: {str(e)}")
        raise


def error_response(status_code, message):
    """
    Generate error response
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'error': message
        })
    }


# For local testing
if __name__ == '__main__':
    # Test event
    test_event = {
        'text': 'The MV Ocean Star arrived at Singapore port on November 5, 2024. Port fees were $25,000 USD. The vessel is carrying 5000 TEU containers.',
        'type': 'port_report',
        'title': 'Port Arrival Report - MV Ocean Star',
        'metadata': {
            'vessel': 'MV Ocean Star',
            'port': 'Singapore',
            'date': '2024-11-05',
            'amount': 25000,
            'currency': 'USD'
        }
    }

    # Mock context
    class Context:
        def __init__(self):
            self.function_name = 'test-function'
            self.request_id = 'test-request-id'

    result = lambda_handler(test_event, Context())
    print(json.dumps(json.loads(result['body']), indent=2))
