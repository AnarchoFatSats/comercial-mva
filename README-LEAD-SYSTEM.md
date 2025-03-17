# Unified Lead Processing System

This repository contains a comprehensive lead processing system for capturing, standardizing, and storing leads from multiple marketing websites while integrating with AWS Connect for the call center.

## System Components

### Frontend Components
- **lead-schema.js** - Defines the standardized JSON structure for leads
- **trusted-forms.js** - Handles TrustedForms certificate integration
- **Site-specific integration files** - Custom integrations for each website

### Backend Components
- **unified-lead-handler.js** - Lambda function for processing leads
- **connect-lead-lookup.js** - Lambda function for AWS Connect integration

### Infrastructure
- **unified-lead-stack.yaml** - CloudFormation template for AWS resources

## Project Structure

```
├── js/
│   ├── lead-schema.js            # Dynamic JSON schema definition
│   ├── trusted-forms.js          # TrustedForms integration
│   ├── form-api.js               # General form API integration
│   └── myinjuryclaimnow-integration.js # Site-specific integration
│
├── lambda/
│   ├── unified-lead-handler.js   # Main lead processing Lambda
│   ├── connect-lead-lookup.js    # AWS Connect integration Lambda
│   └── README.md                 # Lambda documentation
│
├── cloudformation/
│   ├── unified-lead-stack.yaml   # Main CloudFormation template
│   └── lead-capture-stack.yaml   # Original stack template
│
├── UNIFIED_LEAD_SYSTEM.md        # Detailed system documentation
├── MYINJURYCLAIMNOW_INTEGRATION.md # Site-specific integration guide
└── README-LEAD-SYSTEM.md         # This file
```

## Quick Start Guide

### 1. Deploy AWS Infrastructure

Deploy the CloudFormation template to create the necessary AWS resources:

```bash
aws cloudformation deploy \
  --template-file cloudformation/unified-lead-stack.yaml \
  --stack-name unified-lead-system \
  --parameter-overrides \
    Environment=prod \
    NotificationEmail=leads@example.com \
    TrustedFormsApiKey=ccdd54f8fb4dc3b495d85dd504abd5f3 \
  --capabilities CAPABILITY_IAM
```

### 2. Deploy Lambda Functions

Package and deploy the Lambda functions:

```bash
# Install dependencies
npm install

# Package Lambda functions
npm run package-lambda

# Upload to S3 (if needed)
aws s3 cp lambda-package.zip s3://your-deployment-bucket/lambda-package.zip

# Update Lambda code
aws lambda update-function-code \
  --function-name unified-lead-handler-prod \
  --s3-bucket your-deployment-bucket \
  --s3-key lambda-package.zip
```

### 3. Integrate with Websites

For each website:

1. Add the necessary JavaScript files
2. Update the API endpoint URL
3. Customize the integration as needed for the specific form structure

See site-specific integration guides for detailed instructions.

## Key Features

- **Dynamic JSON Schema** - Adapts to different form structures across sites
- **TrustedForms Integration** - Captures certificate URLs for compliance
- **Unified Storage** - Organizes all leads in a consistent S3 structure
- **AWS Connect Integration** - Displays lead data to call center agents
- **Tagging System** - Categorizes leads by funnel type, lead type, etc.

## Data Flow

1. User submits a form on one of our websites
2. Frontend JavaScript captures form data and TrustedForm certificate
3. Data is sent to the API Gateway endpoint
4. Lambda function processes and stores the lead
5. Lead is available to the call center through AWS Connect

## Lead Qualification

Each site has its own qualification criteria. The standard criteria include:

1. Accident occurred within a specific timeframe (usually 2 years)
2. User sought medical attention within a specified period
3. User was not primarily at fault
4. The incident involved a qualifying vehicle or situation

## TrustedForms Integration

TrustedForms certificates provide proof of consent and form submission. The integration:

1. Loads the TrustedForms script on page load
2. Captures a certificate URL when the form is submitted
3. Stores the URL with the lead data
4. Makes the URL available to the call center

## Adding a New Website

To add a new lead-generating website:

1. Copy and customize the site-specific integration JS file
2. Update form field selectors to match the site's HTML
3. Modify lead qualification logic as needed
4. Add the scripts to the website's HTML
5. Test the integration end-to-end

See `MYINJURYCLAIMNOW_INTEGRATION.md` for an example.

## AWS Connect Setup

To integrate with AWS Connect:

1. Create a Lambda function integration in your Connect instance
2. Configure the function to use `connect-lead-lookup.js`
3. Update contact flows to call the Lambda when a call comes in
4. Display the returned lead data in the agent interface

## Troubleshooting

Common issues and solutions:

1. **Form submission not captured**: Check form selectors and event listeners
2. **TrustedForms certificate missing**: Verify the TrustedForms script is loaded
3. **API errors**: Check API Gateway logs and Lambda function logs
4. **S3/DynamoDB errors**: Verify IAM roles and permissions

## Security & Compliance

- All data is encrypted in transit and at rest
- API Gateway endpoints require proper authentication
- S3 buckets are configured with appropriate access policies
- Data retention is managed via lifecycle policies
- TrustedForms certificates provide proof of consent 