// Commercial MVA Lead Processing Lambda Function
const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Store API key securely as environment variable
// NEVER hardcode API keys in your code
const TRUSTED_FORM_API_KEY = process.env.TRUSTED_FORM_API_KEY;
const LEADS_BUCKET = process.env.LEADS_BUCKET || 'company-leads-prod';

exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse form data from event
    const formData = JSON.parse(event.body);
    
    // Generate lead ID
    const leadId = uuidv4();
    
    // Get TrustedForm certificate
    // Note: This is a simplified example - adjust according to TrustedForm API docs
    const tfResponse = await fetch('https://app.trustedform.com/certificates/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRUSTED_FORM_API_KEY}`
      }
    });
    
    if (!tfResponse.ok) {
      throw new Error(`TrustedForm API error: ${tfResponse.statusText}`);
    }
    
    const tfData = await tfResponse.json();
    
    // Create lead JSON
    const leadData = {
      leadId,
      sourceSite: "myinjuryclaimnow.com",
      timestamp: new Date().toISOString(),
      funnelType: "CommercialMVA",
      leadType: "WorkVehicleAccident",
      adCategory: "LegalServices",
      formData: {
        contactInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          emailAddress: formData.emailAddress
        },
        accidentDetails: {
          workVehicleType: formData.vehicleType,
          usedForWorkPurposes: formData.workPurposes,
          faultParty: formData.faultParty,
          accidentDate: formData.accidentDate,
          victimWorking: formData.victimWorking,
          otherDriverWorking: formData.otherDriverWorking,
          medicalAttentionWithin7Days: formData.medicalAttention7Days,
          medicalAttentionWithin14Days: formData.medicalAttention14Days,
          policeReportFiled: formData.policeReport,
          hasPoliceReportCopy: formData.hasPoliceReportCopy
        }
      },
      qualificationStatus: determineQualificationStatus(formData),
      trustedFormCertUrl: tfData.certificateUrl
    };
    
    // Store in S3
    const s3 = new AWS.S3();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const key = `funnelType=CommercialMVA/leadType=WorkVehicleAccident/${year}/${month}/${day}/myinjuryclaimnow_com_${date.toISOString().replace(/:/g, '-')}_${leadId}.json`;
    
    await s3.putObject({
      Bucket: LEADS_BUCKET,
      Key: key,
      Body: JSON.stringify(leadData),
      ContentType: 'application/json',
      Tagging: `funnelType=CommercialMVA&leadType=WorkVehicleAccident&adCategory=LegalServices`
    }).promise();
    
    console.log(`Lead successfully stored at s3://${LEADS_BUCKET}/${key}`);
    
    // Forward to AWS Connect if needed
    // This is where you would implement AWS Connect integration
    // Example: Create task in Connect for follow-up
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Update this for production
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        message: "Lead successfully submitted",
        leadId: leadId
      })
    };
  } catch (error) {
    console.error('Error processing lead:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Update this for production
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        message: "Error processing lead",
        error: error.message 
      })
    };
  }
};

function determineQualificationStatus(formData) {
  // Logic to determine if lead qualifies based on form answers
  // This is a simplified example - implement your qualification logic here
  
  // Example: Disqualify if accident happened more than 2 years ago
  const accidentDate = new Date(formData.accidentDate);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  if (accidentDate < twoYearsAgo) {
    return "Disqualified";
  }
  
  // Example: Disqualify if no medical attention within 14 days
  if (formData.medicalAttention14Days === "No, after 14 days or not yet") {
    return "Disqualified";
  }
  
  // Example: Disqualify if not a work vehicle
  if (formData.workPurposes === "No, it was not for work") {
    return "Disqualified";
  }
  
  // Default to qualified if no disqualifying factors
  return "Qualified";
} 