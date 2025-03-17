#!/bin/bash
# Deployment script for the Unified Lead Processing System

# Configuration - update these values as needed
STACK_NAME="unified-lead-system"
ENVIRONMENT="dev"  # dev, staging, or prod
REGION="us-east-1"
NOTIFICATION_EMAIL="leads@example.com"
TRUSTED_FORMS_API_KEY="ccdd54f8fb4dc3b495d85dd504abd5f3"
DEPLOYMENT_BUCKET="your-deployment-bucket"  # S3 bucket for Lambda code

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Unified Lead Processing System Deployment =====${NC}"
echo "Stack Name: $STACK_NAME"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo

# 1. Install NPM dependencies
echo -e "${YELLOW}Installing NPM dependencies...${NC}"
npm install
cd lambda && npm install && cd ..

# 2. Package Lambda functions
echo -e "${YELLOW}Packaging Lambda functions...${NC}"
mkdir -p ./build
cd lambda
zip -r ../build/lambda-package.zip .
cd ..
echo -e "${GREEN}Lambda package created at ./build/lambda-package.zip${NC}"

# 3. Upload to S3 (if specified)
if [ "$DEPLOYMENT_BUCKET" != "your-deployment-bucket" ]; then
    echo -e "${YELLOW}Uploading Lambda package to S3...${NC}"
    aws s3 cp ./build/lambda-package.zip s3://$DEPLOYMENT_BUCKET/lambda-package.zip
    echo -e "${GREEN}Lambda package uploaded to s3://$DEPLOYMENT_BUCKET/lambda-package.zip${NC}"
    
    # Update Lambda code in CloudFormation template
    sed -i 's|CodeUri: .*|CodeUri: s3://'$DEPLOYMENT_BUCKET'/lambda-package.zip|g' cloudformation/unified-lead-stack.yaml
fi

# 4. Deploy CloudFormation stack
echo -e "${YELLOW}Deploying CloudFormation stack...${NC}"
aws cloudformation deploy \
  --template-file cloudformation/unified-lead-stack.yaml \
  --stack-name $STACK_NAME-$ENVIRONMENT \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    NotificationEmail=$NOTIFICATION_EMAIL \
    TrustedFormsApiKey=$TRUSTED_FORMS_API_KEY \
  --capabilities CAPABILITY_IAM \
  --region $REGION

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}CloudFormation stack deployed successfully!${NC}"
    
    # Get API Gateway URL from CloudFormation outputs
    API_URL=$(aws cloudformation describe-stacks \
      --stack-name $STACK_NAME-$ENVIRONMENT \
      --region $REGION \
      --query "Stacks[0].Outputs[?OutputKey=='LeadApiEndpoint'].OutputValue" \
      --output text)
    
    echo -e "${GREEN}API Gateway URL: $API_URL${NC}"
    
    # Update the API endpoint in the myinjuryclaimnow-integration.js file
    if [ -n "$API_URL" ]; then
        echo -e "${YELLOW}Updating API endpoint in myinjuryclaimnow-integration.js...${NC}"
        sed -i 's|https://REPLACE_WITH_YOUR_UNIFIED_API_ENDPOINT/leads|'$API_URL'|g' js/myinjuryclaimnow-integration.js
    fi
    
    # Create a deployment info file
    echo -e "${YELLOW}Creating deployment info file...${NC}"
    echo "Deployment Info ($(date))" > deployment-info.txt
    echo "API Gateway URL: $API_URL" >> deployment-info.txt
    echo "S3 Bucket: $(aws cloudformation describe-stacks --stack-name $STACK_NAME-$ENVIRONMENT --region $REGION --query "Stacks[0].Outputs[?OutputKey=='LeadsBucketName'].OutputValue" --output text)" >> deployment-info.txt
    echo "DynamoDB Table: $(aws cloudformation describe-stacks --stack-name $STACK_NAME-$ENVIRONMENT --region $REGION --query "Stacks[0].Outputs[?OutputKey=='DynamoDBTableName'].OutputValue" --output text)" >> deployment-info.txt
    echo "Notification Topic ARN: $(aws cloudformation describe-stacks --stack-name $STACK_NAME-$ENVIRONMENT --region $REGION --query "Stacks[0].Outputs[?OutputKey=='NotificationTopicARN'].OutputValue" --output text)" >> deployment-info.txt
    
    echo -e "${GREEN}Deployment info saved to deployment-info.txt${NC}"
    echo -e "${GREEN}Deployment complete!${NC}"
else
    echo -e "${RED}CloudFormation stack deployment failed!${NC}"
    echo "Check CloudFormation console for error details."
fi

echo -e "${YELLOW}===== Next Steps =====${NC}"
echo "1. Upload the JavaScript files to your website:"
echo "   - js/lead-schema.js"
echo "   - js/trusted-forms.js"
echo "   - js/myinjuryclaimnow-integration.js"
echo "2. Add the script tags to your HTML"
echo "3. Test the integration"
echo "4. Set up AWS Connect integration using the connect-lead-lookup.js Lambda" 