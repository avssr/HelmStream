#!/usr/bin/env python3
"""
HelmStream - Shipyard Query Test Script
Tests RAG system with realistic shipyard operation queries from rag-query-reference.md
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


# Test queries from DATASET-MANIFEST.md and rag-query-reference.md
TEST_QUERIES = [
    # Operational Status Queries
    {
        "category": "Operational Status",
        "query": "What is the current status of MV Pacific Star?",
        "expected_elements": ["MV Pacific Star", "status", "dock"]
    },
    {
        "category": "Operational Status",
        "query": "When will Dock 1 be available for new vessel allocation?",
        "expected_elements": ["Dock 1", "available", "schedule"]
    },
    # Delay & Issue Queries
    {
        "category": "Delay Analysis",
        "query": "Why was Blue Horizon delayed?",
        "expected_elements": ["Blue Horizon", "delay", "reason"]
    },
    {
        "category": "Delay Analysis",
        "query": "How did the storm impact Pacific Star's original schedule?",
        "expected_elements": ["Pacific Star", "storm", "weather", "schedule"]
    },
    # Decision Context Queries
    {
        "category": "Decision Context",
        "query": "What was the decision process for extending Baltic Trader dock stay in October?",
        "expected_elements": ["Baltic Trader", "October", "decision", "extended"]
    },
    {
        "category": "Decision Context",
        "query": "Who approved the Baltic Trader extended dock allocation?",
        "expected_elements": ["Baltic Trader", "approved", "extended"]
    },
    # Coordination & Conflict Resolution
    {
        "category": "Coordination",
        "query": "How did we resolve the crane maintenance vs. Baltic Trader heavy lift conflict in July?",
        "expected_elements": ["crane", "Baltic Trader", "conflict", "July"]
    },
    # Stakeholder Perspective Queries
    {
        "category": "Stakeholder",
        "query": "What did Maria communicate to Alan about his cargo delays?",
        "expected_elements": ["Maria", "Alan", "cargo", "delay"]
    },
    # Temporal Queries
    {
        "category": "Temporal",
        "query": "What happened in October?",
        "expected_elements": ["October"]
    },
    {
        "category": "Temporal",
        "query": "Trace the Baltic Trader propeller issue from discovery to resolution",
        "expected_elements": ["Baltic Trader", "propeller", "discovery", "resolution"]
    },
    # Scope Expansion Queries
    {
        "category": "Scope Expansion",
        "query": "What scope expansions were discovered during pre-dock inspections?",
        "expected_elements": ["scope expansion", "inspection"]
    },
    # Environmental & Compliance
    {
        "category": "Environmental",
        "query": "What environmental protocols were triggered during Blue Horizon's ballast treatment?",
        "expected_elements": ["Blue Horizon", "environmental", "ballast", "protocol"]
    },
    # Weather Impact
    {
        "category": "Weather",
        "query": "How did weather impact operations in June and August?",
        "expected_elements": ["weather", "June", "August"]
    },
    # Resource Management
    {
        "category": "Resource Management",
        "query": "What was the tug availability issue in early July?",
        "expected_elements": ["tug", "availability", "July"]
    },
    # Technical Analysis
    {
        "category": "Technical",
        "query": "Which vessels required ballast system work?",
        "expected_elements": ["ballast", "vessel"]
    }
]


def test_query(lambda_client, function_name, query_data):
    """Test a single query"""
    query = query_data['query']
    category = query_data['category']

    print(f"\n{'='*60}")
    print(f"🔍 [{category}] {query}")
    print('='*60)

    try:
        response = lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='RequestResponse',
            Payload=json.dumps({
                'message': query,
                'top_k': 5
            })
        )

        result = json.loads(response['Payload'].read())

        if result['statusCode'] == 200:
            body = json.loads(result['body'])

            # Display answer
            print(f"\n💬 Answer:")
            print(f"{body['answer']}")

            # Display sources
            if 'sources' in body and body['sources']:
                print(f"\n📚 Sources ({len(body['sources'])} emails):")
                for i, source in enumerate(body['sources'][:3], 1):
                    print(f"   {i}. [{source.get('sender_role', 'Unknown')}] {source.get('sender', 'Unknown')}")
                    print(f"      Subject: {source['subject'][:60]}...")
                    print(f"      Vessel: {source.get('vessel', 'N/A')} | "
                          f"Category: {source.get('event_category', 'N/A')} | "
                          f"Score: {source['similarity_score']:.3f}")

            # Display filters applied
            if 'filters_applied' in body and body['filters_applied']:
                print(f"\n🎯 Filters Applied: {json.dumps(body['filters_applied'], indent=2)}")

            # Display token usage
            if 'token_usage' in body:
                tokens = body['token_usage']
                cost_estimate = (tokens['input_tokens'] / 1000000 * 3) + (tokens['output_tokens'] / 1000000 * 15)
                print(f"\n💰 Tokens: {tokens['input_tokens']} in, {tokens['output_tokens']} out (≈${cost_estimate:.4f})")

            return True
        else:
            print(f"\n❌ Error: {result.get('body', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function"""
    print("="*60)
    print("HelmStream - Shipyard Query Test Suite")
    print("="*60)
    print(f"Based on: DATASET-MANIFEST.md query patterns")
    print(f"Total queries: {len(TEST_QUERIES)}")

    # Load configuration
    config = load_config()
    region = config.get('AWS_REGION', 'us-east-1')

    print(f"\nRegion: {region}")
    print(f"Account: {config.get('AWS_ACCOUNT_ID', 'unknown')}")

    # Initialize Lambda client
    lambda_client = boto3.client('lambda', region_name=region)

    # RAG engine function name
    rag_engine = 'helmstream-rag-engine-emails'

    # Test each query
    passed = 0
    failed = 0

    for i, query_data in enumerate(TEST_QUERIES, 1):
        print(f"\n\n{'#'*60}")
        print(f"Query {i}/{len(TEST_QUERIES)}")
        print(f"{'#'*60}")

        success = test_query(lambda_client, rag_engine, query_data)

        if success:
            passed += 1
        else:
            failed += 1

        # Pause between queries to avoid rate limits
        if i < len(TEST_QUERIES):
            import time
            time.sleep(2)

    # Summary
    print(f"\n\n{'='*60}")
    print(f"TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Total queries: {len(TEST_QUERIES)}")
    print(f"Passed: {passed} ✓")
    print(f"Failed: {failed} ✗")
    print(f"Success rate: {(passed/len(TEST_QUERIES)*100):.1f}%")
    print(f"{'='*60}")

    # Category breakdown
    print(f"\nQueries by Category:")
    categories = {}
    for query in TEST_QUERIES:
        cat = query['category']
        categories[cat] = categories.get(cat, 0) + 1

    for cat, count in sorted(categories.items()):
        print(f"  • {cat}: {count} queries")

    print(f"\n{'='*60}")
    print(f"✅ Testing complete!")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
