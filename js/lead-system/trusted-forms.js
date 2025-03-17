/**
 * TrustedForms Integration
 * This file handles the integration with TrustedForms for lead certification
 */

// TrustedForms API key
const TRUSTED_FORMS_API_KEY = 'ccdd54f8fb4dc3b495d85dd504abd5f3';

/**
 * Initialize TrustedForms on page load
 * This embeds the TrustedForms tracking script
 */
function initTrustedForms() {
    // Only add the script if it's not already present
    if (!document.getElementById('trusted-forms-script')) {
        // Create trusted forms script element
        const script = document.createElement('script');
        script.id = 'trusted-forms-script';
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://certificates.trustedform.com/certificates.js';
        
        // Add script to the document
        document.head.appendChild(script);
        
        console.log('TrustedForms script loaded');
    }
}

/**
 * Get the TrustedForm certificate URL
 * This should be called when the form is submitted
 * @returns {Promise<string>} - Promise that resolves to the certificate URL
 */
async function getTrustedFormCertificate() {
    return new Promise((resolve, reject) => {
        try {
            // Check if TrustedForms is loaded
            if (typeof window.TrustedForm === 'undefined') {
                console.warn('TrustedForm not loaded, returning null certificate');
                resolve(null);
                return;
            }
            
            // Request the certificate using the TrustedForms API
            window.TrustedForm.getCertificateUrl((error, certificateUrl) => {
                if (error) {
                    console.error('Error getting TrustedForm certificate:', error);
                    resolve(null); // Resolve with null rather than reject to prevent form submission failure
                } else {
                    console.log('TrustedForm certificate URL:', certificateUrl);
                    resolve(certificateUrl);
                }
            });
        } catch (error) {
            console.error('Exception in getTrustedFormCertificate:', error);
            resolve(null); // Resolve with null rather than reject to prevent form submission failure
        }
    });
}

/**
 * Server-side verification of TrustedForm certificate
 * This should be called from your Lambda function
 * @param {string} certificateUrl - TrustedForm certificate URL
 * @returns {Promise<Object>} - Promise that resolves to the verification result
 */
async function verifyTrustedFormCertificate(certificateUrl) {
    // This is a placeholder for server-side code
    // In reality, this would be implemented in your Lambda function
    
    /*
    // Server-side Node.js code example:
    const axios = require('axios');
    
    try {
        const response = await axios.get(certificateUrl, {
            headers: {
                'Authorization': `Bearer ${TRUSTED_FORMS_API_KEY}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error verifying TrustedForm certificate:', error);
        throw error;
    }
    */
    
    // Return a placeholder for client-side
    return {
        verified: true,
        created_at: new Date().toISOString(),
        certificate_url: certificateUrl
    };
}

// Initialize TrustedForms when the document is loaded
document.addEventListener('DOMContentLoaded', initTrustedForms); 