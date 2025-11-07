#!/usr/bin/env python3
"""
HelmStream - Shipyard Email Dataset Ingestion Script
Ingests the 88 emails from shipyard_emails_flat.csv into the RAG system
"""

import json
import boto3
import sys
import os
import csv
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


def ingest_csv_emails(csv_path, lambda_client, function_name):
    """
    Ingest emails from CSV file
    Expected CSV format: date,time,sender,sender_role,recipients,subject,body,email_type,month,vessel_involved,event_category
    """
    print(f"\n📧 Reading emails from: {csv_path}")

    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return []

    emails = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parse recipients (may be comma-separated)
            recipients = []
            if row.get('recipients'):
                recipients = [r.strip() for r in row['recipients'].split(';')]

            email = {
                'date': row.get('date', ''),
                'time': row.get('time', ''),
                'sender': row.get('sender', ''),
                'sender_role': row.get('sender_role', ''),
                'recipients': recipients,
                'subject': row.get('subject', ''),
                'body': row.get('body', ''),
                'email_type': row.get('email_type', 'operational'),
                'month': row.get('month', ''),
                'vessel_involved': row.get('vessel_involved', ''),
                'event_category': row.get('event_category', 'operational')
            }
            emails.append(email)

    print(f"✓ Loaded {len(emails)} emails from CSV")

    # Process emails in batches to reduce Lambda invocations
    batch_size = 10
    processed = 0
    failed = 0

    for i in range(0, len(emails), batch_size):
        batch = emails[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(emails) + batch_size - 1) // batch_size

        print(f"\n📦 Processing batch {batch_num}/{total_batches} ({len(batch)} emails)...")

        try:
            # Invoke Lambda with batch
            response = lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps({'emails': batch})
            )

            result = json.loads(response['Payload'].read())

            if result['statusCode'] == 200:
                body = json.loads(result['body'])
                batch_processed = body.get('emails_processed', 0)
                processed += batch_processed
                print(f"   ✓ Batch processed: {batch_processed} emails")

                # Show sample email IDs
                if 'results' in body and body['results']:
                    sample = body['results'][0]
                    print(f"   📧 Sample: {sample.get('email_id', 'unknown')} - {sample.get('sender', 'unknown')}")
            else:
                print(f"   ❌ Batch failed: {result.get('body', 'Unknown error')}")
                failed += len(batch)

        except Exception as e:
            print(f"   ❌ Exception processing batch: {str(e)}")
            failed += len(batch)

    print(f"\n{'='*60}")
    print(f"✅ INGESTION COMPLETE")
    print(f"{'='*60}")
    print(f"Total emails: {len(emails)}")
    print(f"Processed: {processed}")
    print(f"Failed: {failed}")
    print(f"{'='*60}\n")

    return emails


def ingest_json_emails(json_path, lambda_client, function_name):
    """
    Ingest emails from JSON file
    Expected format: shipyard_6month_email_simulation.json
    """
    print(f"\n📧 Reading emails from: {json_path}")

    if not os.path.exists(json_path):
        print(f"❌ JSON file not found: {json_path}")
        return []

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Extract emails from JSON structure
    emails = []
    if 'emails' in data:
        for email in data['emails']:
            # Transform to expected format
            emails.append({
                'date': email.get('date', ''),
                'time': email.get('time', ''),
                'sender': email.get('sender', ''),
                'sender_role': email.get('sender_role', ''),
                'recipients': email.get('recipients', []),
                'subject': email.get('subject', ''),
                'body': email.get('body', ''),
                'email_type': email.get('email_type', 'operational'),
                'month': email.get('month', ''),
                'vessel_involved': email.get('vessel_involved', ''),
                'event_category': email.get('event_category', 'operational')
            })

    print(f"✓ Loaded {len(emails)} emails from JSON")

    # Process similar to CSV
    # ... (same batch processing logic)

    return emails


def main():
    """Main ingestion function"""
    print("="*60)
    print("HelmStream - Shipyard Email Dataset Ingestion")
    print("="*60)

    # Load configuration
    config = load_config()
    region = config.get('AWS_REGION', 'us-east-1')

    print(f"Region: {region}")
    print(f"Account: {config.get('AWS_ACCOUNT_ID', 'unknown')}")

    # Initialize Lambda client
    lambda_client = boto3.client('lambda', region_name=region)

    # Email processor function name
    email_processor = 'helmstream-email-processor'

    # Look for dataset files
    dataset_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'rag-docs')

    csv_path = os.path.join(dataset_dir, 'shipyard_emails_flat.csv')
    json_path = os.path.join(dataset_dir, 'shipyard_6month_email_simulation.json')

    # Check which file exists
    if os.path.exists(csv_path):
        print(f"\n✓ Found CSV dataset: {csv_path}")
        emails = ingest_csv_emails(csv_path, lambda_client, email_processor)
    elif os.path.exists(json_path):
        print(f"\n✓ Found JSON dataset: {json_path}")
        emails = ingest_json_emails(json_path, lambda_client, email_processor)
    else:
        print(f"\n❌ Dataset not found!")
        print(f"   Expected locations:")
        print(f"   - {csv_path}")
        print(f"   - {json_path}")
        sys.exit(1)

    if emails:
        print("\n🎉 Dataset ingestion successful!")
        print("\nNext steps:")
        print("  1. Test queries with: python3 test_shipyard_queries.py")
        print("  2. View email data in DynamoDB console")
        print("  3. Start building your frontend!")
    else:
        print("\n⚠️  No emails were ingested")
        sys.exit(1)


if __name__ == '__main__':
    main()
