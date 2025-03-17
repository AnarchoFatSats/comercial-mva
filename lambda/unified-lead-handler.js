/**
 * Unified Lead Handler Lambda Function
 * This function processes leads from multiple websites,
 * stores them in S3 and DynamoDB, and integrates with AWS Connect
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const axios = require('axios');

// AWS resource names from environment variables
const LEADS_BUCKET = process.env.LEADS_BUCKET || 'company-leads-prod';
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'unified-leads';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:123456789012:lead-notifications';
const TRUSTED_FORMS_API_KEY = process.env.TRUSTED_FORMS_API_KEY || 'ccdd54f8fb4dc3b495d85dd504abd5f3';

// Trusted Forms verification toggle
const VERIFY_TRUSTED_FORMS = process.env.VERIFY_TRUSTED_FORMS === 'true';

/**
 * Main Lambda handler function
 */
exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Parse the lead data from the request
        let leadData = parseLeadData(event);
        
        // Validate required fields
        validateLeadData(leadData);
        
        // Add metadata for storage
        enrichLeadData(leadData);
        
        // Verify TrustedForms certificate if available and verification is enabled
        if (VERIFY_TRUSTED_FORMS && leadData.trustedFormCertUrl) {
            try {
                const verificationResult = await verifyTrustedFormCertificate(leadData.trustedFormCertUrl);
                leadData.trustedFormVerification = verificationResult;
            } catch (error) {
                console.warn('TrustedForm verification failed:', error.message);
                // Continue processing even if verification fails
            }
        }
        
        // Store lead in S3
        const s3Result = await storeLeadInS3(leadData);
        leadData.awsMeta.s3Path = s3Result.key;
        
        // Store lead in DynamoDB
        await storeLeadInDynamoDB(leadData);
        
        // Send notification for qualified leads
        if (leadData.qualified === true) {
            await sendNotification(leadData);
        }
        
        // Return success response
        return formatResponse(200, {
            message: 'Lead processed successfully',
            leadId: leadData.leadId,
            s3Path: leadData.awsMeta.s3Path
        });
    } catch (error) {
        console.error('Error processing lead:', error);
        return formatResponse(500, {
            message: 'Error processing lead',
            error: error.message
        });
    }
};

/**
 * Parse lead data from the Lambda event
 */
function parseLeadData(event) {
    let leadData;
    
    // Handle API Gateway proxy integration
    if (event.body) {
        leadData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } 
    // Handle direct invocation from other Lambda functions
    else if (event.Records && event.Records[0].s3) {
        // This is an S3 event - handle batch processing if needed
        throw new Error('S3 event processing not implemented');
    } 
    // Handle direct invocation with lead data
    else {
        leadData = event;
    }
    
    return leadData;
}

/**
 * Validate required fields in lead data
 */
function validateLeadData(leadData) {
    // Check for required fields
    if (!leadData.leadId) {
        throw new Error('Missing required field: leadId');
    }
    
    if (!leadData.sourceSite) {
        throw new Error('Missing required field: sourceSite');
    }
    
    if (!leadData.funnelType) {
        throw new Error('Missing required field: funnelType');
    }
    
    if (!leadData.leadType) {
        throw new Error('Missing required field: leadType');
    }
}

/**
 * Enrich lead data with additional metadata
 */
function enrichLeadData(leadData) {
    // Ensure timestamp exists
    if (!leadData.timestamp) {
        leadData.timestamp = new Date().toISOString();
    }
    
    // Add submission date in YYYY-MM-DD format for partitioning
    const submissionDate = leadData.timestamp.substring(0, 10);
    
    // Initialize AWS metadata if not present
    if (!leadData.awsMeta) {
        leadData.awsMeta = {};
    }
    
    // Add TTL for DynamoDB (90 days from now)
    const ttlInSeconds = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);
    leadData.awsMeta.ttl = ttlInSeconds;
    
    // Add submission date for range key
    leadData.submissionDate = submissionDate;
    
    // Add client IP address if available through event
    if (!leadData.tracking) {
        leadData.tracking = {};
    }
    
    // Add S3 path information
    const s3Path = getS3Path(leadData);
    leadData.awsMeta.s3PathPrefix = s3Path.prefix;
}

/**
 * Generate S3 path based on lead data
 */
function getS3Path(leadData) {
    // Extract date components from timestamp
    const date = new Date(leadData.timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    // Generate the prefix using the partitioning strategy
    const prefix = `funnelType=${leadData.funnelType}/leadType=${leadData.leadType}/adCategory=${leadData.adCategory || 'unknown'}/${year}/${month}/${day}/`;
    
    // Generate the file name using site and timestamp
    const timestamp = leadData.timestamp.replace(/[:.]/g, '');
    const siteName = leadData.sourceSite.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${siteName}_${timestamp}_${leadData.leadId}.json`;
    
    return {
        prefix,
        fileName,
        key: prefix + fileName
    };
}

/**
 * Store lead data in S3
 */
async function storeLeadInS3(leadData) {
    const s3Path = getS3Path(leadData);
    const key = s3Path.key;
    
    // Create tags for the S3 object
    const tagSet = `funnelType=${leadData.funnelType}&leadType=${leadData.leadType}&adCategory=${leadData.adCategory || 'unknown'}`;
    
    // Store the lead in S3
    const params = {
        Bucket: LEADS_BUCKET,
        Key: key,
        Body: JSON.stringify(leadData, null, 2),
        ContentType: 'application/json',
        Tagging: tagSet
    };
    
    await s3.putObject(params).promise();
    
    return {
        bucket: LEADS_BUCKET,
        key: key
    };
}

/**
 * Store lead data in DynamoDB
 */
async function storeLeadInDynamoDB(leadData) {
    // Prepare the DynamoDB item
    // Note: We're only storing essential fields in DynamoDB for quick access
    // The full lead data is stored in S3
    const item = {
        leadId: leadData.leadId,
        submissionDate: leadData.submissionDate,
        funnelType: leadData.funnelType,
        leadType: leadData.leadType,
        adCategory: leadData.adCategory || 'unknown',
        qualified: leadData.qualified === true,
        timestamp: leadData.timestamp,
        ttl: leadData.awsMeta.ttl,
        s3Path: leadData.awsMeta.s3Path,
        trustedFormCertUrl: leadData.trustedFormCertUrl || null,
        sourceSite: leadData.sourceSite
    };
    
    // Add contact info if available
    if (leadData.contactInfo) {
        item.contactName = `${leadData.contactInfo.firstName || ''} ${leadData.contactInfo.lastName || ''}`.trim();
        item.contactEmail = leadData.contactInfo.email;
        item.contactPhone = leadData.contactInfo.phone;
    }
    
    // Store in DynamoDB
    const params = {
        TableName: DYNAMODB_TABLE,
        Item: item
    };
    
    await dynamoDB.put(params).promise();
}

/**
 * Verify TrustedForms certificate
 */
async function verifyTrustedFormCertificate(certificateUrl) {
    try {
        // Call TrustedForms API to verify the certificate
        const response = await axios.get(certificateUrl, {
            headers: {
                'Authorization': `Bearer ${TRUSTED_FORMS_API_KEY}`
            }
        });
        
        // Check if verification was successful
        if (response.status !== 200) {
            throw new Error(`TrustedForm verification failed with status ${response.status}`);
        }
        
        return {
            verified: true,
            timestamp: new Date().toISOString(),
            data: response.data
        };
    } catch (error) {
        console.error('Error verifying TrustedForm certificate:', error);
        return {
            verified: false,
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
}

/**
 * Send notification for qualified leads
 */
async function sendNotification(leadData) {
    // Format a human-readable message
    const firstName = leadData.contactInfo?.firstName || '';
    const lastName = leadData.contactInfo?.lastName || '';
    const phone = leadData.contactInfo?.phone || '';
    const email = leadData.contactInfo?.email || '';
    
    const message = `
New Qualified Lead:
---------------------------
Lead ID: ${leadData.leadId}
Source Site: ${leadData.sourceSite}
Funnel Type: ${leadData.funnelType}
Lead Type: ${leadData.leadType}
Ad Category: ${leadData.adCategory || 'N/A'}

Contact Information:
Name: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}

Timestamp: ${leadData.timestamp}
S3 Path: s3://${LEADS_BUCKET}/${leadData.awsMeta.s3Path}
${leadData.trustedFormCertUrl ? `TrustedForm: ${leadData.trustedFormCertUrl}` : ''}
---------------------------
`;

    // Send the notification via SNS
    const params = {
        Message: message,
        Subject: `New Qualified Lead: ${firstName} ${lastName} (${leadData.funnelType})`,
        TopicArn: SNS_TOPIC_ARN
    };
    
    await sns.publish(params).promise();
}

/**
 * Format the Lambda response
 */
function formatResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
} 