"""
HelmStream - RAG Query Engine Lambda Function
Handles RAG queries: embedding, retrieval, and response generation
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal
import math

# Initialize AWS clients
bedrock = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Configuration from environment variables
DOCUMENTS_TABLE = os.environ.get('DYNAMODB_TABLE_NAME', 'helmstream-documents')
CONVERSATIONS_TABLE = os.environ.get('CONVERSATIONS_TABLE_NAME', 'helmstream-conversations')
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
BEDROCK_EMBED_MODEL = os.environ.get('BEDROCK_TITAN_EMBED_MODEL_ID', 'amazon.titan-embed-text-v1')
BEDROCK_CLAUDE_MODEL = os.environ.get('BEDROCK_CLAUDE_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')


def lambda_handler(event, context):
    """
    Main handler for RAG queries

    Expected input:
    {
        "message": "What is the port fee for MV Ocean Star?",
        "conversation_id": "optional-conv-id",
        "top_k": 5,
        "include_sources": true
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
        include_sources = body.get('include_sources', True)

        print(f"Processing query: {query[:100]}...")

        # Step 1: Generate query embedding
        print("Generating query embedding...")
        query_embedding = generate_embedding(query)
        print(f"✓ Query embedding generated ({len(query_embedding)} dimensions)")

        # Step 2: Retrieve similar documents
        print(f"Retrieving top-{top_k} similar documents...")
        similar_docs = retrieve_similar_documents(query_embedding, top_k)
        print(f"✓ Found {len(similar_docs)} similar documents")

        # Step 3: Fetch full document content from S3
        context_docs = []
        for doc in similar_docs[:3]:  # Use top 3 for context to stay within token limits
            try:
                doc_text = fetch_document_from_s3(doc['s3_uri'])
                context_docs.append({
                    'title': doc['title'],
                    'text': doc_text,
                    'type': doc['type'],
                    'score': doc['similarity_score']
                })
            except Exception as e:
                print(f"⚠️  Error fetching document {doc['document_id']}: {str(e)}")
                # Use preview text as fallback
                context_docs.append({
                    'title': doc['title'],
                    'text': doc.get('text_preview', ''),
                    'type': doc['type'],
                    'score': doc['similarity_score']
                })

        print(f"✓ Retrieved {len(context_docs)} document contents")

        # Step 4: Generate response using Claude with context
        print("Generating response with Claude...")
        response_text, token_usage = generate_response_with_context(query, context_docs)
        print(f"✓ Response generated (tokens: {token_usage})")

        # Step 5: Save conversation (if conversation_id provided)
        if conversation_id:
            save_conversation_turn(conversation_id, query, response_text, similar_docs[:3])

        # Prepare response
        response_data = {
            'answer': response_text,
            'conversation_id': conversation_id,
            'token_usage': token_usage
        }

        if include_sources:
            response_data['sources'] = [
                {
                    'document_id': doc['document_id'],
                    'title': doc['title'],
                    'type': doc['type'],
                    'similarity_score': float(doc['similarity_score']),
                    'preview': doc.get('text_preview', '')[:200]
                }
                for doc in similar_docs
            ]

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


def generate_embedding(text):
    """Generate 768-dimensional embedding using Bedrock Titan"""
    try:
        # Truncate if needed
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


def retrieve_similar_documents(query_embedding, top_k=5):
    """
    Retrieve top-K similar documents using cosine similarity
    Free-tier optimized: scan DynamoDB, compute similarity in-memory with NumPy-free approach
    """
    try:
        table = dynamodb.Table(DOCUMENTS_TABLE)

        # Scan all documents (acceptable for MVP with <1000 docs)
        print("Scanning DynamoDB for documents...")
        response = table.scan()
        documents = response['Items']

        print(f"Found {len(documents)} total documents")

        # Compute cosine similarity for each document
        similarities = []
        for doc in documents:
            # Convert Decimal to float
            doc_embedding = [float(x) for x in doc['embedding']]

            # Compute cosine similarity (without NumPy)
            similarity = cosine_similarity_pure_python(query_embedding, doc_embedding)

            similarities.append({
                'document_id': doc['document_id'],
                'title': doc['title'],
                's3_uri': doc['s3_uri'],
                'type': doc['type'],
                'text_preview': doc.get('text_preview', ''),
                'metadata': doc.get('metadata', {}),
                'similarity_score': similarity
            })

        # Sort by similarity (highest first) and return top-K
        similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similarities[:top_k]

    except Exception as e:
        print(f"❌ Error retrieving documents: {str(e)}")
        raise


def cosine_similarity_pure_python(vec1, vec2):
    """
    Compute cosine similarity without NumPy (for Lambda compatibility)
    """
    # Dot product
    dot_product = sum(a * b for a, b in zip(vec1, vec2))

    # Magnitudes
    magnitude1 = math.sqrt(sum(a * a for a in vec1))
    magnitude2 = math.sqrt(sum(b * b for b in vec2))

    # Cosine similarity
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    return dot_product / (magnitude1 * magnitude2)


def fetch_document_from_s3(s3_uri):
    """Fetch document content from S3"""
    try:
        # Parse s3://bucket/key
        parts = s3_uri.replace('s3://', '').split('/', 1)
        bucket = parts[0]
        key = parts[1]

        response = s3.get_object(Bucket=bucket, Key=key)
        return response['Body'].read().decode('utf-8')

    except Exception as e:
        print(f"❌ Error fetching from S3: {str(e)}")
        raise


def generate_response_with_context(query, context_docs):
    """
    Generate response using Claude 3 Sonnet with retrieved context
    """
    try:
        # Build context string
        context_parts = []
        for i, ctx in enumerate(context_docs, 1):
            context_parts.append(f"""
Document {i}: {ctx['title']} (Type: {ctx['type']}, Relevance: {ctx['score']:.2f})
---
{ctx['text'][:2000]}
""")  # Limit each document to 2000 chars

        context = "\n\n".join(context_parts)

        # Create prompt
        prompt = f"""You are a maritime operations assistant with access to a knowledge base of maritime documents. Answer the following question based ONLY on the provided context documents.

Context Documents:
{context}

Question: {query}

Instructions:
- Provide a clear, concise answer based on the information in the context
- If the context contains relevant information, cite the specific document(s)
- If the context doesn't contain enough information to answer the question, say so clearly
- Be specific with numbers, dates, and vessel names when they appear in the context
- Keep your answer focused and professional

Answer:"""

        # Call Claude 3 Sonnet
        response = bedrock.invoke_model(
            modelId=BEDROCK_CLAUDE_MODEL,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 1024,
                'temperature': 0.7,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            })
        )

        # Parse response
        result = json.loads(response['body'].read())
        answer = result['content'][0]['text']

        # Token usage for cost tracking
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
            'sources': [{'document_id': s['document_id'], 'title': s['title']} for s in sources]
        })

        print(f"✓ Conversation saved: {conversation_id}")

    except Exception as e:
        print(f"⚠️  Error saving conversation: {str(e)}")
        # Non-critical error, don't fail the request


def error_response(status_code, message):
    """Generate error response"""
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
    test_event = {
        'message': 'What is the port fee for MV Ocean Star at Singapore?',
        'top_k': 5
    }

    class Context:
        def __init__(self):
            self.function_name = 'test-function'

    result = lambda_handler(test_event, Context())
    print(json.dumps(json.loads(result['body']), indent=2))
