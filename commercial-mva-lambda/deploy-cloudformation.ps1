# PowerShell script to deploy the Commercial MVA Lead Management System using CloudFormation

# Set your AWS region
$region = "us-east-1"  # Change to your preferred AWS region

# Create the deployment package
Write-Host "Creating Lambda deployment package..."
Compress-Archive -Path .\index.js, .\node_modules, .\package.json -DestinationPath .\function.zip -Force

# Ask for TrustedForm API key
$trustedFormApiKey = Read-Host "Enter your TrustedForm API key" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($trustedFormApiKey)
$apiKeyPlainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Deploy CloudFormation stack
Write-Host "Deploying CloudFormation stack..."
aws cloudformation create-stack `
  --stack-name commercial-mva-lead-system `
  --template-body file://template.yaml `
  --parameters ParameterKey=TrustedFormApiKey,ParameterValue=$apiKeyPlainText `
                ParameterKey=LeadsBucketName,ParameterValue=company-leads-prod `
  --capabilities CAPABILITY_IAM `
  --region $region

# Wait for stack creation to complete
Write-Host "Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete `
  --stack-name commercial-mva-lead-system `
  --region $region

if ($LASTEXITCODE -eq 0) {
    # Get API endpoint from CloudFormation outputs
    $outputs = aws cloudformation describe-stacks `
      --stack-name commercial-mva-lead-system `
      --query "Stacks[0].Outputs" `
      --region $region | ConvertFrom-Json

    $apiEndpoint = ($outputs | Where-Object { $_.OutputKey -eq "ApiEndpoint" }).OutputValue

    # Update Lambda function code
    Write-Host "Updating Lambda function code..."
    aws lambda update-function-code `
      --function-name commercial-mva-lead-processor `
      --zip-file fileb://function.zip `
      --region $region

    # Update test form with API endpoint
    Write-Host "Updating test form with API endpoint..."
    $content = Get-Content -Path ..\test-form.html -Raw
    $updatedContent = $content -replace 'YOUR_API_GATEWAY_URL', $apiEndpoint
    Set-Content -Path ..\test-form.html -Value $updatedContent
    
    Write-Host "Deployment complete!"
    Write-Host "API Endpoint: $apiEndpoint"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Open test-form.html in a browser to test your implementation"
    Write-Host "2. Monitor CloudWatch logs for Lambda execution"
    Write-Host "3. Check your S3 bucket for stored leads"
} else {
    Write-Host "Stack creation failed. Check CloudFormation console for details."
} 