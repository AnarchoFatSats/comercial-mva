/**
 * AWS Lambda function for integration with Amazon Connect
 * This function retrieves lead data for caller lookup in Amazon Connect
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// AWS resource names from environment variables
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'unified-leads-prod';
const LEADS_BUCKET = process.env.LEADS_BUCKET || 'company-leads-prod';

/**
 * Main Lambda handler for Amazon Connect integration
 * @param {Object} event - The event from Amazon Connect
 * @param {Object} context - Lambda context
 * @returns {Object} - The lead data for display in Connect
 */
exports.handler = async (event, context) => {
    console.log('Received Connect event:', JSON.stringify(event, null, 2));
    
    try {
        // Extract caller's phone number from Connect event
        const phoneNumber = getPhoneNumberFromEvent(event);
        
        if (!phoneNumber) {
            console.warn('No phone number found in the event');
            return formatEmptyResponse();
        }
        
        // Search for the lead in DynamoDB using phone as a query parameter
        const leadData = await findLeadByPhone(phoneNumber);
        
        if (!leadData) {
            console.log(`No lead found for phone number: ${phoneNumber}`);
            return formatEmptyResponse();
        }
        
        // If we have an S3 path, retrieve the full lead data from S3
        if (leadData.s3Path) {
            try {
                const fullLeadData = await getLeadFromS3(leadData.s3Path);
                // Merge the full data with the basic data
                return formatConnectResponse({
                    ...leadData,
                    fullData: fullLeadData
                });
            } catch (s3Error) {
                console.error('Error retrieving lead from S3:', s3Error);
                // Return the basic data from DynamoDB if S3 retrieval fails
                return formatConnectResponse(leadData);
            }
        }
        
        // Return the basic lead data from DynamoDB
        return formatConnectResponse(leadData);
    } catch (error) {
        console.error('Error handling Connect request:', error);
        return formatEmptyResponse();
    }
};

/**
 * Get phone number from Amazon Connect event
 * @param {Object} event - The Connect event
 * @returns {string|null} - Phone number or null if not found
 */
function getPhoneNumberFromEvent(event) {
    // Extract phone number from different possible locations
    
    // From CustomerEndpoint
    if (event.Details && 
        event.Details.ContactData && 
        event.Details.ContactData.CustomerEndpoint &&
        event.Details.ContactData.CustomerEndpoint.Address) {
        return normalizePhoneNumber(event.Details.ContactData.CustomerEndpoint.Address);
    }
    
    // From Parameters
    if (event.Details && 
        event.Details.Parameters && 
        event.Details.Parameters.phone) {
        return normalizePhoneNumber(event.Details.Parameters.phone);
    }
    
    // From Attributes
    if (event.Details && 
        event.Details.ContactData && 
        event.Details.ContactData.Attributes &&
        event.Details.ContactData.Attributes.phone) {
        return normalizePhoneNumber(event.Details.ContactData.Attributes.phone);
    }
    
    return null;
}

/**
 * Normalize phone number to standard format
 * @param {string} phone - The phone number to normalize
 * @returns {string} - Normalized phone number
 */
function normalizePhoneNumber(phone) {
    // Remove all non-numeric characters
    let normalized = phone.replace(/\D/g, '');
    
    // If US number with country code, remove the leading 1
    if (normalized.length === 11 && normalized.startsWith('1')) {
        normalized = normalized.substring(1);
    }
    
    return normalized;
}

/**
 * Find lead by phone number in DynamoDB
 * @param {string} phone - The phone number to search for
 * @returns {Object|null} - Lead data or null if not found
 */
async function findLeadByPhone(phone) {
    // We need to scan the table since phone isn't a key attribute
    // In a production environment, you might want to create a GSI on phone
    // or use a more efficient query method
    const params = {
        TableName: DYNAMODB_TABLE,
        FilterExpression: 'contactPhone = :phone',
        ExpressionAttributeValues: {
            ':phone': phone
        },
        Limit: 10 // Limit to most recent leads if multiple exist
    };
    
    try {
        const result = await dynamoDB.scan(params).promise();
        
        if (result.Items && result.Items.length > 0) {
            // Sort by timestamp descending to get most recent first
            result.Items.sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            return result.Items[0]; // Return the most recent lead
        }
        
        return null;
    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        throw error;
    }
}

/**
 * Get full lead data from S3
 * @param {string} s3Path - S3 path to the lead JSON file
 * @returns {Object} - Full lead data
 */
async function getLeadFromS3(s3Path) {
    const params = {
        Bucket: LEADS_BUCKET,
        Key: s3Path
    };
    
    try {
        const response = await s3.getObject(params).promise();
        return JSON.parse(response.Body.toString('utf-8'));
    } catch (error) {
        console.error('Error retrieving from S3:', error);
        throw error;
    }
}

/**
 * Format the response for Amazon Connect
 * @param {Object} leadData - Lead data to format
 * @returns {Object} - Formatted response for Connect
 */
function formatConnectResponse(leadData) {
    // Format the response as needed for Amazon Connect
    // These will be available as contact attributes in Connect
    return {
        leadId: leadData.leadId || '',
        firstName: leadData.contactInfo?.firstName || leadData.fullData?.contactInfo?.firstName || '',
        lastName: leadData.contactInfo?.lastName || leadData.fullData?.contactInfo?.lastName || '',
        email: leadData.contactInfo?.email || leadData.fullData?.contactInfo?.email || '',
        phone: leadData.contactInfo?.phone || leadData.fullData?.contactInfo?.phone || '',
        funnelType: leadData.funnelType || '',
        leadType: leadData.leadType || '',
        qualified: leadData.qualified === true ? 'Yes' : 'No',
        submissionDate: leadData.submissionDate || '',
        trustedFormUrl: leadData.trustedFormCertUrl || leadData.fullData?.trustedFormCertUrl || '',
        // Add other fields that might be useful for the agent
    };
}

/**
 * Format empty response when no lead is found
 * @returns {Object} - Empty lead response
 */
function formatEmptyResponse() {
    return {
        leadId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        funnelType: '',
        leadType: '',
        qualified: 'Unknown',
        submissionDate: '',
        trustedFormUrl: '',
        notFound: 'true'
    };
} 