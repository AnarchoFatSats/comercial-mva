// This file contains the API integration for form submission
// Include this after form.js

// Import API endpoint from config instead of hardcoding
import { API_ENDPOINT } from '../commercial-mva-lambda/config.js';

// Create global function to be accessed by form.js
window.submitFormToAPI = async function(formData) {
    try {
        // Get TrustedForm certificate URL if available
        let trustedFormCertUrl = null;
        if (typeof window.TrustedForm !== 'undefined') {
            trustedFormCertUrl = await new Promise((resolve) => {
                window.TrustedForm.getCertificateUrl((error, url) => {
                    if (error) {
                        console.error('Error getting TrustedForm certificate:', error);
                        resolve(null);
                    } else {
                        console.log('TrustedForm certificate URL:', url);
                        resolve(url);
                    }
                });
            });
        } else {
            console.warn('TrustedForm not loaded');
        }
        
        // Add TrustedForm URL to form data if available
        if (trustedFormCertUrl) {
            formData.trustedFormCertUrl = trustedFormCertUrl;
        }
        
        // Log the complete form data
        console.log('Form data with TrustedForm:', formData);
        
        // Using fetch API for form submission with API_ENDPOINT from config
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error submitting form:', error);
        // Still redirect to thank you page even if API fails
        window.location.href = 'thank-you.html';
        return null;
    }
};

// Update the submitForm function in form.js if it exists (will be executed when this script loads)
if (typeof submitForm === 'function') {
    const originalSubmitForm = submitForm;
    submitForm = async function() {
        console.log('Form data submitted:', formData);
        
        // Try to submit to API
        const apiResponse = await window.submitFormToAPI(formData);
        
        // Redirect to thank you page
        window.location.href = 'thank-you.html';
    };
} 