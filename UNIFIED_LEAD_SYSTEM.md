# Unified Lead Processing System

This document outlines the unified lead processing system for multiple marketing websites that funnel to our internal call center. The system handles varying form structures across different websites while storing all leads in a standardized format in Amazon S3 and DynamoDB.

## Overview

The system provides:

1. **Dynamic JSON Schema** - Adapts to different form structures while maintaining uniform core fields
2. **TrustedForms Integration** - Captures and stores TrustedForms certificates with each lead
3. **AWS Infrastructure** - Leverages S3, DynamoDB, Lambda, and API Gateway for scalable processing
4. **AWS Connect Integration** - Seamlessly delivers lead data to the call center

## Architecture

![Architecture Diagram](https://placeholder-for-architecture-diagram.png)

The lead processing flow works as follows:

1. User submits a form on one of our websites
2. JavaScript on the website:
   - Creates a standardized lead JSON object
   - Captures a TrustedForms certificate
   - Sends the data to our unified API endpoint
3. Lambda function processes the lead:
   - Validates and enriches the lead data
   - Verifies the TrustedForm certificate (optional)
   - Stores the lead in S3 with an organized folder structure
   - Stores key lead attributes in DynamoDB for quick lookup
   - Sends a notification for qualified leads
4. AWS Connect integration:
   - When a call comes in, AWS Connect looks up the caller in DynamoDB
   - The lead data is retrieved from S3 if needed
   - Lead details are displayed to the agent in the call center interface

## Lead Data Structure

Each lead is stored with the following structure:

```json
{
  "leadId": "unique-identifier",
  "sourceSite": "website-name",
  "timestamp": "2023-03-14T12:34:56Z",
  
  "funnelType": "MVA",
  "leadType": "commercial_vehicle_accident",
  "adCategory": "LegalAds",
  
  "contactInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "5551234567"
  },
  
  "qualified": true,
  
  "tracking": {
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "truck-accidents"
  },
  
  "trustedFormCertUrl": "https://cert.trustedform.com/2605828b1c037951db4f15e61bb0be3f969454d3",
  
  "formData": {
    // All original form fields preserved here
  },
  
  "awsMeta": {
    "ttl": 1678824896,
    "s3Path": "funnelType=MVA/leadType=commercial_vehicle_accident/2023/03/14/website_name_20230314T123456Z_unique-id.json"
  }
}
```

## S3 Storage Strategy

Leads are stored in S3 using the following path structure:

```
company-leads-prod/
  funnelType=MVA/
    leadType=commercial_vehicle_accident/
      adCategory=LegalAds/
        2023/
          03/
            14/
              website_name_20230314T123456Z_unique-id.json
```

This structure allows for:
- Logical grouping by funnel and lead type
- Chronological organization
- Easy filtering and retrieval

## AWS Connect Integration

When a call comes into the call center:

1. AWS Connect triggers the `connect-lead-lookup` Lambda function
2. The function extracts the caller's phone number from the event
3. It searches DynamoDB for leads matching the phone number
4. If found, it retrieves detailed lead data from S3
5. The lead data is returned to AWS Connect as contact attributes
6. Agents see the lead details in their contact control panel (CCP)

## TrustedForms Integration

TrustedForms certificates provide proof of consent and form submission details:

1. The TrustedForms JavaScript is embedded on all form pages
2. When a form is submitted, the `getTrustedFormCertificate()` function is called
3. The certificate URL is included in the lead JSON
4. The Lambda function can optionally verify the certificate using the TrustedForms API
5. The certificate URL is stored in DynamoDB and accessible to the call center

## Implementation Details

### Frontend

Add these scripts to each website:

```html
<!-- In the head section -->
<script src="/js/lead-schema.js"></script>
<script src="/js/trusted-forms.js"></script>

<!-- Before the closing body tag (after your form script) -->
<script src="/js/form-api.js"></script>
```

### AWS Setup

1. Deploy the CloudFormation template:
   ```
   aws cloudformation deploy --template-file cloudformation/unified-lead-stack.yaml --stack-name unified-lead-system --parameter-overrides Environment=prod NotificationEmail=leads@example.com TrustedFormsApiKey=ccdd54f8fb4dc3b495d85dd504abd5f3
   ```

2. Package the Lambda functions:
   ```
   npm run package-lambda
   ```

3. Update the API endpoint in `form-api.js` with the deployed API Gateway URL.

## Tagging Strategy

Each lead is tagged with metadata for organization and filtering:

- **funnelType**: The marketing funnel or campaign type (e.g., MVA, MassTort)
- **leadType**: The specific type of lead (e.g., commercial_vehicle_accident)
- **adCategory**: The category of advertisement that generated the lead

These tags are applied at three levels:
1. Within the JSON data
2. As S3 object tags
3. As part of the S3 path structure

This allows for consistent organization across all systems.

## Security and Compliance

The system includes several security measures:

- S3 buckets are encrypted using server-side encryption (SSE-S3)
- HTTPS is enforced for all S3 access
- Public access is blocked on S3 buckets
- IAM roles follow the principle of least privilege
- Sensitive API keys are stored as environment variables
- Data retention policies are implemented via TTL and lifecycle rules