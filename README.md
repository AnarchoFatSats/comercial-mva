# Commercial MVA Lead Management System

This project implements a lead management system for commercial motor vehicle accident (MVA) claims. It processes form submissions from the website, stores the data in a standardized JSON format in Amazon S3, and integrates with AWS Connect for call center operations.

## Features

- Processes form submissions from myinjuryclaimnow.com
- Creates a standardized JSON format for lead data
- Stores leads in Amazon S3 with appropriate tagging and organization
- Integrates with TrustedForm for compliance certification
- Qualification logic to filter leads based on criteria
- Ready for AWS Connect integration

## Architecture

- AWS Lambda for processing form submissions
- Amazon S3 for secure lead storage
- Amazon API Gateway for handling form submission requests
- TrustedForm integration for compliance

## Setup Instructions

### Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured
- Node.js installed (for local testing)
- TrustedForm API key

### Local Development Setup

1. Clone this repository
2. Navigate to the `commercial-mva-lambda` directory
3. Install dependencies:
   ```
   npm install
   ```
4. Open `test-form.html` to test form submissions locally

### AWS Deployment

#### Option 1: Manual Deployment

1. Create Lambda deployment package:
   ```
   cd commercial-mva-lambda
   ./deploy.ps1  # For Windows
   ```

2. In the AWS Management Console:
   - Create S3 bucket: `company-leads-prod`
   - Create Lambda function: `commercial-mva-lead-processor`
   - Upload the `function.zip` file
   - Configure environment variables:
     - `TRUSTED_FORM_API_KEY`: Your TrustedForm API key
     - `LEADS_BUCKET`: `company-leads-prod`
   - Set up appropriate IAM permissions for S3 access
   - Create API Gateway and configure to trigger Lambda

#### Option 2: CloudFormation Deployment

1. Deploy using AWS CloudFormation:
   ```
   aws cloudformation create-stack \
     --stack-name commercial-mva-lead-system \
     --template-body file://commercial-mva-lambda/template.yaml \
     --parameters ParameterKey=TrustedFormApiKey,ParameterValue=YOUR_API_KEY \
     --capabilities CAPABILITY_IAM
   ```

2. Upload Lambda code:
   ```
   cd commercial-mva-lambda
   ./deploy.ps1
   aws lambda update-function-code \
     --function-name commercial-mva-lead-processor \
     --zip-file fileb://function.zip
   ```

### Testing

1. Update the API endpoint in `test-form.html` with your API Gateway URL
2. Open the form in a browser and submit test data
3. Check CloudWatch Logs for Lambda execution logs
4. Verify lead data in S3 bucket

## JSON Schema

The system uses a standardized JSON schema for storing lead data:

```json
{
  "leadId": "[uuid]",
  "sourceSite": "myinjuryclaimnow.com",
  "timestamp": "[iso-timestamp]",
  "funnelType": "CommercialMVA",
  "leadType": "WorkVehicleAccident",
  "adCategory": "LegalServices",
  "formData": {
    "contactInfo": {
      "firstName": "",
      "lastName": "",
      "phoneNumber": "",
      "emailAddress": ""
    },
    "accidentDetails": {
      "workVehicleType": "", 
      "usedForWorkPurposes": "",
      "faultParty": "",
      "accidentDate": "",
      "victimWorking": "",
      "otherDriverWorking": "",
      "medicalAttentionWithin7Days": "",
      "medicalAttentionWithin14Days": "",
      "policeReportFiled": "",
      "hasPoliceReportCopy": ""
    }
  },
  "qualificationStatus": "",
  "trustedFormCertUrl": ""
}
```

## S3 Storage Structure

Leads are stored with this folder structure:
```
s3://company-leads-prod/
   funnelType=CommercialMVA/leadType=WorkVehicleAccident/
       YYYY/MM/DD/
           myinjuryclaimnow_com_[timestamp]_[leadId].json
```

## Security Considerations

- API keys are stored as environment variables
- S3 bucket is configured with private access only
- TrustedForm API calls are made server-side only
- Data is tagged and organized for compliance

## Next Steps

- Implement AWS Connect integration for call center operations
- Add additional lead sources/websites
- Set up monitoring and alerting
- Implement lead analytics dashboard
