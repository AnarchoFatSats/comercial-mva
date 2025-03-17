# MyInjuryClaimNow.com Integration Guide

This guide provides instructions for integrating the myinjuryclaimnow.com website with our unified lead processing system.

## Overview

The integration enables the myinjuryclaimnow.com form submissions to:
1. Be captured in our standardized JSON format
2. Include TrustedForms certificates
3. Be stored in our unified S3 bucket and DynamoDB database
4. Be accessible to the call center through AWS Connect

## Files to Add

Add the following JavaScript files to the website:

1. **lead-schema.js** - Defines the standardized lead data structure
2. **trusted-forms.js** - Handles TrustedForms integration
3. **myinjuryclaimnow-integration.js** - Site-specific integration code

## Implementation Steps

### 1. Add Script References to HTML

Add the following script tags to the HTML, ideally before the closing `</body>` tag:

```html
<!-- Lead Processing System -->
<script src="/js/lead-schema.js"></script>
<script src="/js/trusted-forms.js"></script>
<script src="/js/myinjuryclaimnow-integration.js"></script>
```

### 2. Update API Endpoint

In the `myinjuryclaimnow-integration.js` file, update the API endpoint URL:

```javascript
// Find this line:
const response = await fetch('https://REPLACE_WITH_YOUR_UNIFIED_API_ENDPOINT/leads', {

// Replace with your actual API Gateway URL:
const response = await fetch('https://abc123def.execute-api.us-east-1.amazonaws.com/prod/leads', {
```

### 3. Verify Form Field Selectors

The integration script uses selectors to find form fields. Verify these match the actual HTML structure:

```javascript
// Example selectors in the script:
const vehicleTypeOptions = document.querySelectorAll('[name="vehicle-type"], [data-question="vehicle-type"]');
const workPurposeOptions = document.querySelectorAll('[name="work-purpose"], [data-question="work-purpose"]');
// etc.
```

Adjust these selectors if the form uses different attribute names or IDs.

### 4. Test the Integration

1. Open the website and submit a test form
2. Check the browser console for errors or success messages
3. Verify the lead appears in the DynamoDB table and S3 bucket
4. Test that the TrustedForm certificate URL is captured

## Form Mapping

The script maps form fields to our standardized schema as follows:

| Form Field | JSON Field | Notes |
|------------|------------|-------|
| Vehicle Type | formData.vehicle_type | "What type of work vehicle were you hit by?" |
| Work Purpose | formData.work_purpose | "Was the vehicle being used for work purposes?" |
| Fault | formData.fault | "Who was at fault in the accident?" |
| Accident Date | formData.accident_date | Date picker value |
| Working Status | formData.working_status | "Were you on the clock or working when the accident occurred?" |
| Other Driver Status | formData.other_driver_status | "Was the other driver in a work vehicle or on the job?" |
| Medical Attention | formData.medical_attention | Timing of medical attention |
| Police Report | formData.police_report | Whether a police report was filed |
| First Name | contactInfo.firstName | Contact form field |
| Last Name | contactInfo.lastName | Contact form field |
| Phone | contactInfo.phone | Contact form field |
| Email | contactInfo.email | Contact form field |

## Lead Qualification Logic

The script determines lead qualification based on these criteria:

1. Accident occurred within the last 2 years
2. Vehicle was being used for work purposes
3. The other driver was primarily at fault
4. Medical attention was sought within 14 days

If any of these criteria are not met, the lead is marked as not qualified.

## TrustedForms Implementation

The integration automatically:
1. Loads the TrustedForms script on page load
2. Requests a certificate when the form is submitted
3. Includes the certificate URL in the lead data

The TrustedForms API key (`ccdd54f8fb4dc3b495d85dd504abd5f3`) is already configured in the system.

## AWS Connect Integration

When a user from myinjuryclaimnow.com calls the call center:
1. AWS Connect identifies the caller by phone number
2. The caller's lead information is retrieved from DynamoDB/S3
3. Lead details are displayed to the agent, including the TrustedForm certificate URL

## Troubleshooting

If you encounter issues:

1. **Form fields not found:** Check the HTML and update selectors in myinjuryclaimnow-integration.js
2. **TrustedForms not working:** Ensure trusted-forms.js is loaded before myinjuryclaimnow-integration.js
3. **API submission errors:** Verify the API endpoint URL and ensure the API Gateway is deployed
4. **Form submission not intercepted:** Check that the script is properly attached to the form submit event 