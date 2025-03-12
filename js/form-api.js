// This file contains the API integration for form submission
// Include this after form.js

async function submitFormToAPI(formData) {
    try {
        // If using AWS Amplify API
        if (typeof API !== 'undefined' && typeof API.post === 'function') {
            const response = await API.post('formAPI', '/submit', {
                body: formData
            });
            return response;
        } else {
            // Fallback to fetch API
            const response = await fetch('https://REPLACE_WITH_YOUR_API_ENDPOINT/submit', {
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
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        // Still redirect to thank you page even if API fails
        window.location.href = 'thank-you.html';
        return null;
    }
}

// Update the submitForm function in form.js to use this API
const originalSubmitForm = submitForm;
submitForm = async function() {
    console.log('Form data submitted:', formData);
    
    // Try to submit to API
    const apiResponse = await submitFormToAPI(formData);
    
    // Redirect to thank you page
    window.location.href = 'thank-you.html';
}; 