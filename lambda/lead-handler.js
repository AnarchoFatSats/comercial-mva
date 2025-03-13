/**
 * AWS Lambda function for handling lead form submissions
 * This function receives lead data from the API Gateway and stores it in DynamoDB
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        // Log the incoming event for debugging
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Parse the request body if it's a string
        let leadData;
        if (typeof event.body === 'string') {
            leadData = JSON.parse(event.body);
        } else {
            leadData = event.body;
        }
        
        // Add timestamp if not present
        if (!leadData.submission_date) {
            leadData.submission_date = new Date().toISOString();
        }
        
        // Add a TTL for data retention (90 days)
        const ttl = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);
        leadData.ttl = ttl;
        
        // Prepare the DynamoDB params
        const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: leadData
        };
        
        // Store the lead data in DynamoDB
        await dynamoDB.put(params).promise();
        
        // Send notification if this is a qualified lead
        if (leadData.qualified === true) {
            await sendNotification(leadData);
        }
        
        // Return success response
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Lead data stored successfully',
                leadId: leadData.lead_id
            })
        };
    } catch (error) {
        // Log the error
        console.error('Error processing lead:', error);
        
        // Return error response
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Error storing lead data',
                error: error.message
            })
        };
    }
};

/**
 * Send notification for qualified leads
 * This function sends an SNS notification for immediate follow-up
 */
async function sendNotification(leadData) {
    const sns = new AWS.SNS();
    
    // Format the message
    const message = `
New Work Vehicle Accident Lead:
---------------------------
Name: ${leadData.first_name} ${leadData.last_name}
Phone: ${leadData.phone}
Email: ${leadData.email}
Vehicle Type: ${leadData.step_1_answer || 'Not specified'}
Accident Date: ${leadData['accident-date'] || 'Not specified'}
Medical Attention: ${leadData.step_5_answer || leadData.step_5b_answer || 'Not specified'}
Police Report: ${leadData.step_6_answer || 'Not specified'}
Lead ID: ${leadData.lead_id}
Source: ${leadData.source}
UTM Source: ${leadData.utm_source}
UTM Campaign: ${leadData.utm_campaign}
---------------------------
`;

    // Prepare the SNS params
    const params = {
        Message: message,
        Subject: `New Qualified Lead: ${leadData.first_name} ${leadData.last_name}`,
        TopicArn: process.env.SNS_TOPIC_ARN
    };
    
    // Send the notification
    await sns.publish(params).promise();
} 