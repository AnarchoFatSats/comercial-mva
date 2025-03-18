# PowerShell script to create Lambda deployment package

# Create a zip file of the Lambda function code
Write-Host "Creating Lambda deployment package..."
Compress-Archive -Path .\index.js, .\node_modules, .\package.json -DestinationPath .\function.zip -Force

Write-Host "Deployment package created: function.zip"
Write-Host "Next steps:"
Write-Host "1. Create S3 bucket: aws s3 mb s3://company-leads-prod --region us-east-1"
Write-Host "2. Configure S3 bucket privacy: aws s3api put-public-access-block --bucket company-leads-prod --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
Write-Host "3. Create Lambda function in AWS console with the following settings:"
Write-Host "   - Name: commercial-mva-lead-processor"
Write-Host "   - Runtime: Node.js 16.x"
Write-Host "   - Handler: index.handler"
Write-Host "   - Upload the function.zip file"
Write-Host "4. Set environment variables in the Lambda function:"
Write-Host "   - TRUSTED_FORM_API_KEY: Your TrustedForm API key"
Write-Host "   - LEADS_BUCKET: company-leads-prod"
Write-Host "5. Configure Lambda IAM role with S3 permissions"
Write-Host "6. Create API Gateway REST API and configure it to trigger the Lambda function"
Write-Host "7. Update test-form.html with your API Gateway URL"
Write-Host "8. Test your implementation" 