# Manual AWS Setup Guide for Commercial MVA Lead Processing

This guide provides step-by-step instructions for manually setting up the AWS resources needed for the Commercial MVA lead processing system.

## Prerequisites

1. An AWS account with appropriate permissions
2. Your TrustedForm API key: `ccdd54f8fb4dc3b495d85dd504abd5f3`
3. The `function.zip` deployment package (already created)

## Step 1: Create S3 Bucket

1. Open the [Amazon S3 console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Enter bucket name: `company-leads-prod`
4. Select your preferred AWS Region
5. Under **Object Ownership**, select **ACLs disabled**
6. Under **Block Public Access settings for this bucket**, check all boxes to block all public access
7. Enable **Bucket Versioning**
8. Click **Create bucket**

## Step 2: Set Up IAM Role for Lambda

1. Open the [IAM console](https://console.aws.amazon.com/iam/)
2. In the navigation pane, click **Roles**, then **Create role**
3. Select **AWS service** as the trusted entity, and **Lambda** as the service
4. Click **Next: Permissions**
5. Attach the following policies:
   - `AWSLambdaBasicExecutionRole` (for CloudWatch Logs)
   - Create a custom policy with the following JSON:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:PutObjectTagging"
               ],
               "Resource": "arn:aws:s3:::company-leads-prod/*"
           }
       ]
   }
   ```
6. Name the role `commercial-mva-lead-processor-role` and click **Create role**

## Step 3: Create Lambda Function

1. Open the [AWS Lambda console](https://console.aws.amazon.com/lambda/)
2. Click **Create function**
3. Select **Author from scratch**
4. Enter function name: `commercial-mva-lead-processor`
5. Select runtime: **Node.js 16.x**
6. Under **Permissions**, select **Use an existing role** and choose the `commercial-mva-lead-processor-role` you created
7. Click **Create function**
8. In the **Code** tab, click **Upload from** and select **.zip file**
9. Upload the `function.zip` file
10. Click **Save**

## Step 4: Configure Lambda Function

1. In the Lambda function page, scroll down to **Environment variables**
2. Click **Edit** and add the following environment variables:
   - Key: `TRUSTED_FORM_API_KEY`, Value: `ccdd54f8fb4dc3b495d85dd504abd5f3`
   - Key: `LEADS_BUCKET`, Value: `company-leads-prod`
3. Scroll to **Basic settings** and click **Edit**
4. Set **Timeout** to 30 seconds
5. Click **Save**

## Step 5: Create API Gateway

1. Open the [API Gateway console](https://console.aws.amazon.com/apigateway/)
2. Click **Create API**
3. Select **REST API** and click **Build**
4. Select **New API** and enter API name: `CommercialMvaLeadApi`
5. Click **Create API**

### Create Resources and Methods

1. In the Resources pane, click **Actions** > **Create Resource**
2. Enter Resource Name: `leads`
3. Click **Create Resource**
4. With the `/leads` resource selected, click **Actions** > **Create Resource**
5. Enter Resource Name: `commercial-mva`
6. Click **Create Resource**
7. With the `/leads/commercial-mva` resource selected, click **Actions** > **Create Method**
8. Select **POST** and click the checkmark
9. Set Integration type to **Lambda Function**
10. Check **Use Lambda Proxy integration**
11. Select the region where you created your Lambda function
12. Enter Lambda Function name: `commercial-mva-lead-processor`
13. Click **Save**

### Enable CORS

1. With the `/leads/commercial-mva` resource selected, click **Actions** > **Enable CORS**
2. For **Access-Control-Allow-Origin**, enter `*` (or your specific domain)
3. Check **Access-Control-Allow-Headers** and include: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
4. Check **Access-Control-Allow-Methods** and select: `OPTIONS,POST`
5. Click **Enable CORS and replace existing CORS headers**
6. Click **Yes, replace existing values**

### Deploy API

1. Click **Actions** > **Deploy API**
2. For **Deployment stage**, select **[New Stage]**
3. Enter Stage name: `prod`
4. Click **Deploy**
5. Note the **Invoke URL** at the top of the page - this is your API endpoint

## Step 6: Update Test Form

1. Open the `test-form.html` file
2. Find this line in the script section:
   ```javascript
   const response = await fetch('YOUR_API_GATEWAY_URL', {
   ```
3. Replace `YOUR_API_GATEWAY_URL` with your API Gateway Invoke URL + `/leads/commercial-mva`
4. Save the file

## Step 7: Test the Implementation

1. Open `test-form.html` in a web browser
2. Fill out the form and submit
3. Check the Lambda CloudWatch logs for execution logs
4. Verify lead data in the S3 bucket

## Connecting the Commercial MVA Site

To connect the actual myinjuryclaimnow.com website:

1. Add the following script to the site's form submission handler:

```javascript
document.getElementById('claimForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Gather form data
    const formData = {
        vehicleType: document.getElementById('vehicleType').value,
        workPurposes: document.getElementById('workPurposes').value,
        faultParty: document.getElementById('faultParty').value,
        // Add all other form fields here
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        emailAddress: document.getElementById('emailAddress').value
    };
    
    try {
        // Call your API endpoint
        const response = await fetch('YOUR_API_GATEWAY_URL/leads/commercial-mva', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Handle successful submission
            console.log('Lead submitted successfully');
        } else {
            // Handle error
            console.error('Lead submission failed:', data.message);
        }
    } catch (error) {
        console.error('Error submitting lead:', error);
    }
});
```

2. Replace `YOUR_API_GATEWAY_URL` with your actual API Gateway Invoke URL

## Next Steps

After successfully setting up the system, you can:

1. Monitor form submissions in CloudWatch Logs
2. Add AWS Connect integration for call center operations
3. Set up additional websites using the same pattern
4. Create a dashboard to track lead performance 