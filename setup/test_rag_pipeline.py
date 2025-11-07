#!/usr/bin/env python3
"""
HelmStream - RAG Pipeline Test Script
Test the document ingestion and query pipeline
"""

import json
import boto3
import sys
import os
from datetime import datetime

# Load configuration
def load_config():
    """Load configuration from .env file"""
    config = {}
    env_file = os.path.join(os.path.dirname(__file__), '..', '.env')

    if not os.path.exists(env_file):
        print("❌ Configuration file not found. Run ./01_setup_aws_resources.sh first")
        sys.exit(1)

    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                config[key] = value

    return config

# Sample maritime documents
SAMPLE_DOCUMENTS = [
    {
        "text": """
Port Arrival Report - MV Ocean Star
Date: November 5, 2024
Port: Singapore
Berth: 12A

The container vessel MV Ocean Star arrived at Singapore port on November 5, 2024 at 08:00 UTC.
The vessel is carrying 5000 TEU containers. Port fees total $25,000 USD.
Expected departure: November 7, 2024.

Cargo manifest includes:
- 2000 TEU electronics from China
- 1500 TEU textiles from Vietnam
- 1500 TEU general cargo

All customs documentation has been submitted and approved.
        """,
        "type": "port_report",
        "title": "Port Arrival Report - MV Ocean Star - Singapore",
        "metadata": {
            "vessel": "MV Ocean Star",
            "port": "Singapore",
            "arrival_date": "2024-11-05",
            "port_fee": 25000,
            "currency": "USD"
        }
    },
    {
        "text": """
Invoice #INV-2024-001
Singapore Port Authority
Date: November 5, 2024

Vessel: MV Ocean Star
Service Period: November 5-7, 2024

Port Services:
- Berth occupancy (48 hours): $15,000
- Pilotage services: $5,000
- Tug boat assistance: $3,000
- Port security: $2,000

Total Amount Due: $25,000 USD
Payment Terms: Net 30 days
Due Date: December 5, 2024
        """,
        "type": "invoice",
        "title": "Invoice INV-2024-001 - Singapore Port Authority",
        "metadata": {
            "invoice_number": "INV-2024-001",
            "vendor": "Singapore Port Authority",
            "amount": 25000,
            "currency": "USD",
            "due_date": "2024-12-05"
        }
    },
    {
        "text": """
Safety Certificate Renewal Notice
IMO Registration: 9876543

Vessel: MV Ocean Star
Current Certificate Expiry: November 30, 2024

This notice serves to inform that the vessel's safety certificate will expire on November 30, 2024.
Renewal inspection must be completed before November 25, 2024 to ensure continuous compliance.

Required Inspections:
- Hull integrity check
- Fire safety systems
- Life-saving equipment
- Navigation equipment

Estimated renewal cost: $5,000 USD
Processing time: 3-5 business days
        """,
        "type": "certificate",
        "title": "Safety Certificate Renewal - MV Ocean Star",
        "metadata": {
            "vessel": "MV Ocean Star",
            "certificate_type": "safety",
            "expiry_date": "2024-11-30",
            "renewal_cost": 5000
        }
    }
]

# Test queries
TEST_QUERIES = [
    "What is the port fee for MV Ocean Star at Singapore?",
    "When does the safety certificate expire for MV Ocean Star?",
    "What cargo is MV Ocean Star carrying?",
    "What is the total invoice amount from Singapore Port Authority?",
    "When did MV Ocean Star arrive at Singapore port?"
]


def test_document_ingestion(lambda_client, function_name):
    """Test document ingestion"""
    print("\n" + "="*60)
    print("TESTING DOCUMENT INGESTION")
    print("="*60)

    ingested_docs = []

    for i, doc in enumerate(SAMPLE_DOCUMENTS, 1):
        print(f"\n📄 Ingesting document {i}/{len(SAMPLE_DOCUMENTS)}: {doc['title'][:50]}...")

        try:
            response = lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps(doc)
            )

            result = json.loads(response['Payload'].read())

            if result['statusCode'] == 200:
                body = json.loads(result['body'])
                print(f"   ✓ Document ingested: {body['document_id']}")
                print(f"   ✓ Embedding dimensions: {body['embedding_dimensions']}")
                ingested_docs.append(body)
            else:
                print(f"   ❌ Error: {result.get('body', 'Unknown error')}")

        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")

    print(f"\n✓ Ingested {len(ingested_docs)} documents successfully")
    return ingested_docs


def test_rag_queries(lambda_client, function_name):
    """Test RAG queries"""
    print("\n" + "="*60)
    print("TESTING RAG QUERIES")
    print("="*60)

    for i, query in enumerate(TEST_QUERIES, 1):
        print(f"\n🔍 Query {i}/{len(TEST_QUERIES)}: {query}")

        try:
            response = lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps({
                    'message': query,
                    'top_k': 3
                })
            )

            result = json.loads(response['Payload'].read())

            if result['statusCode'] == 200:
                body = json.loads(result['body'])
                print(f"\n   💬 Answer: {body['answer']}\n")

                if 'sources' in body:
                    print("   📚 Sources:")
                    for source in body['sources'][:2]:
                        print(f"      - {source['title']} (score: {source['similarity_score']:.3f})")

                if 'token_usage' in body:
                    tokens = body['token_usage']
                    print(f"   💰 Tokens: {tokens['input_tokens']} in, {tokens['output_tokens']} out")
            else:
                print(f"   ❌ Error: {result.get('body', 'Unknown error')}")

        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")


def main():
    """Main test function"""
    print("============================================")
    print("HelmStream RAG Pipeline Test")
    print("============================================")

    # Load configuration
    config = load_config()
    region = config.get('AWS_REGION', 'us-east-1')

    print(f"Region: {region}")
    print(f"Account: {config.get('AWS_ACCOUNT_ID', 'unknown')}")

    # Initialize Lambda client
    lambda_client = boto3.client('lambda', region_name=region)

    # Test document ingestion
    doc_processor = 'helmstream-document-processor'
    rag_engine = 'helmstream-rag-engine'

    try:
        # Wait a moment for DynamoDB to be ready
        print("\n⏳ Waiting 5 seconds for services to be ready...")
        import time
        time.sleep(5)

        # Ingest documents
        ingested_docs = test_document_ingestion(lambda_client, doc_processor)

        # Wait for documents to be indexed
        if ingested_docs:
            print("\n⏳ Waiting 5 seconds for documents to be indexed...")
            time.sleep(5)

            # Test queries
            test_rag_queries(lambda_client, rag_engine)

        print("\n" + "="*60)
        print("✅ TEST COMPLETE")
        print("="*60)
        print(f"\nDocuments ingested: {len(ingested_docs)}")
        print(f"Queries tested: {len(TEST_QUERIES)}")
        print("\nYour RAG pipeline is working! 🎉")

    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
