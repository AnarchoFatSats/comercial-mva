// Commercial MVA Lead Processing Lambda Function
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

// Store API key securely as environment variable
// NEVER hardcode API keys in your code
const TRUSTED_FORM_API_KEY = process.env.TRUSTED_FORM_API_KEY;
const LEADS_BUCKET = process.env.LEADS_BUCKET || 'mva-lead-system-deployment';

// Initialize S3 client
const s3Client = new S3Client({ region: 'us-east-1' });

// Helper function for HTTPS requests (replacement for fetch)
function httpsRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({
              ok: true,
              json: () => Promise.resolve(JSON.parse(data)),
              text: () => Promise.resolve(data),
              statusCode: res.statusCode,
              statusText: res.statusMessage
            });
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP error: ${res.statusCode} ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Process TrustedForm certificate
async function processTrustedFormCertificate(certificateUrl) {
  if (!TRUSTED_FORM_API_KEY) {
    console.log('TrustedForm API key not configured, skipping certificate claim');
    return null;
  }
  
  if (!certificateUrl) {
    console.log('No TrustedForm certificate URL provided, skipping certificate claim');
    return null;
  }
  
  try {
    console.log(`Claiming TrustedForm certificate: ${certificateUrl}`);
    
    const options = {
      hostname: 'api.trustedform.com',
      path: '/certificates',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRUSTED_FORM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    const postData = JSON.stringify({
      certificate_url: certificateUrl,
      reference: `MVA_Lead_${new Date().toISOString()}`,
      vendor: 'MyInjuryClaimNow'
    });
    
    const response = await httpsRequest(options, postData);
    const data = await response.json();
    
    console.log('TrustedForm certificate claimed successfully:', JSON.stringify(data, null, 2));
    
    return {
      certificateId: data.id,
      certificateUrl: data.cert_url,
      created: data.created_at,
      claimed: data.claimed_at,
      expires: data.expires_at,
      fingerprintMatched: data.fingerprints ? data.fingerprints.matching : false
    };
  } catch (error) {
    console.error('Error claiming TrustedForm certificate:', error.message);
    // Return partial data so we still have the certificate URL
    return {
      certificateUrl: certificateUrl,
      error: error.message,
      claimed: false
    };
  }
}

exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse the form data from the body
    let formData;
    try {
        // If the body is a string, try to parse it as JSON
        if (typeof event.body === 'string') {
            formData = JSON.parse(event.body);
        } else {
            formData = event.body;
        }
        
        console.log("Parsed form data:", formData);
    } catch (error) {
        console.error("Error parsing form data:", error);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: false, message: "Invalid form data" })
        };
    }
    
    // Process TrustedForm certificate if available
    let trustedFormResult = null;
    
    // Check for TrustedForm certificate URL - try both possible field names
    const tfCertUrl = formData.trustedFormCertUrl || formData.xxTrustedFormCertUrl;
    
    if (tfCertUrl) {
        console.log("TrustedForm certificate URL provided:", tfCertUrl);
        try {
            trustedFormResult = await processTrustedFormCertificate(tfCertUrl);
        } catch (error) {
            console.warn("Error processing TrustedForm certificate:", error.message);
            // Continue processing even if TrustedForm verification fails
        }
    } else {
        console.log("No TrustedForm certificate URL provided, skipping certificate claim");
    }
    
    // Generate lead ID
    const leadId = uuidv4();
    console.log('Generated lead ID:', leadId);
    
    // Create lead JSON
    const leadData = {
      leadId,
      timestamp: new Date().toISOString(),
      sourceSite: "myinjuryclaimnow.com",
      funnelType: "CommercialMVA",
      leadType: "WorkVehicleAccident",
      formData
    };
    
    // Wait for TrustedForm processing to complete
    if (trustedFormResult) {
      leadData.trustedForm = trustedFormResult;
    }
    
    console.log('Prepared lead data:', JSON.stringify(leadData, null, 2));
    
    // Store in S3
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const key = `leads/${year}/${month}/${day}/${leadId}.json`;
    
    console.log(`Attempting to store lead at s3://${LEADS_BUCKET}/${key}`);
    
    // Use AWS SDK v3 to put object in S3
    const putCommand = new PutObjectCommand({
      Bucket: LEADS_BUCKET,
      Key: key,
      Body: JSON.stringify(leadData),
      ContentType: 'application/json'
    });
    
    await s3Client.send(putCommand);
    
    console.log(`Lead successfully stored at s3://${LEADS_BUCKET}/${key}`);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        message: "Your case details have been successfully submitted. A legal representative will contact you shortly.",
        leadId: leadId
      })
    };
  } catch (error) {
    console.error('Error processing lead:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        message: "Error processing your submission. Please try again later.",
        error: error.message 
      })
    };
  }
}; 