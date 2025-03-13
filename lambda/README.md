# Lead Capture System for Commercial MVA Website

This directory contains the AWS Lambda function and CloudFormation template for the lead capture system used by the Commercial MVA website.

## System Overview

The lead capture system consists of the following components:

1. **Frontend Form**: Collects user information and form responses
2. **API Gateway**: Receives form submissions from the frontend
3. **Lambda Function**: Processes form data and stores it in DynamoDB
4. **DynamoDB Table**: Stores lead information with proper tagging
5. **SNS Topic**: Sends notifications for qualified leads

## Deployment Instructions

### Prerequisites

- AWS CLI installed and configured
- Node.js and npm installed
- An AWS account with appropriate permissions

### Step 1: Package the Lambda Function

1. Navigate to the `lambda` directory:
   ```
   cd lambda
   ```

2. Install dependencies:
   ```
   npm install aws-sdk
   ```

3. Create a deployment package:
   ```
   zip -r lead-handler.zip lead-handler.js node_modules
   ```

### Step 2: Deploy the CloudFormation Stack

1. Navigate to the `cloudformation` directory:
   ```
   cd ../cloudformation
   ```

2. Deploy the stack:
   ```
   aws cloudformation deploy \
     --template-file lead-capture-stack.yaml \
     --stack-name commercial-mva-lead-capture \
     --parameter-overrides Environment=prod NotificationEmail=your-email@example.com \
     --capabilities CAPABILITY_IAM
   ```

3. Get the API endpoint:
   ```
   aws cloudformation describe-stacks \
     --stack-name commercial-mva-lead-capture \
     --query "Stacks[0].Outputs[?OutputKey=='LeadAPIEndpoint'].OutputValue" \
     --output text
   ```

### Step 3: Update the Lambda Function Code

1. Upload the Lambda deployment package:
   ```
   aws lambda update-function-code \
     --function-name commercial-mva-lead-handler-prod \
     --zip-file fileb://../lambda/lead-handler.zip
   ```

### Step 4: Update the Frontend Configuration

1. Update the API endpoint in the frontend code (`js/form.js`):
   ```javascript
   const API_ENDPOINT = 'https://your-api-endpoint.execute-api.region.amazonaws.com/prod/leads';
   ```

## Data Structure

The lead data stored in DynamoDB includes:

- **lead_id**: Unique identifier for the lead
- **source**: Website source (commercial-mva)
- **lead_type**: Type of lead (work_vehicle_accident)
- **qualified**: Boolean indicating if the lead is qualified
- **first_name**: Lead's first name
- **last_name**: Lead's last name
- **phone**: Lead's phone number
- **email**: Lead's email address
- **submission_date**: Date and time of submission
- **utm_source**, **utm_medium**, **utm_campaign**: UTM parameters for tracking
- **step_X_question**: Question text for each step
- **step_X_answer**: Answer text for each step
- **disqualification_reason**: Reason for disqualification (if applicable)
- **ttl**: Time-to-live for data retention (90 days)

## Monitoring and Maintenance

- **CloudWatch Logs**: Check Lambda function logs for errors
- **DynamoDB Console**: View and query stored leads
- **SNS Topic**: Manage email subscriptions for lead notifications

## Security Considerations

- The API Gateway endpoint is public but only accepts POST requests
- CORS is configured to allow requests from the website domain
- DynamoDB data is encrypted at rest
- TTL is set to automatically delete lead data after 90 days
- IAM roles follow the principle of least privilege 