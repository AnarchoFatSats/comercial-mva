/**
 * Commercial MVA Lead Management System - Site Integration Script
 * 
 * This script should be added to the myinjuryclaimnow.com website to send
 * form submissions to the lead processing API.
 */

// Configuration - Using the correct API Gateway URL
const API_ENDPOINT = 'https://bnmcip8xp5.execute-api.us-east-1.amazonaws.com/default/commercial-mva-lead-processor';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Find the claim form
    const form = document.querySelector('#claim-form');
    if (!form) {
        console.error('Form not found on page');
        return;
    }
    
    // Listen for form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading indicator or disable submit button
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
        }
        
        try {
            // Gather form data
            const formData = {
                // Vehicle information
                vehicleType: getSelectedValue('[data-question="vehicle-type"]') || '',
                workPurposes: getSelectedValue('[data-question="work-purpose"]') || '',
                faultParty: getSelectedValue('[data-question="fault"]') || '',
                
                // Accident details
                accidentDate: document.getElementById('accident-date')?.value || '',
                victimWorking: getSelectedValue('[data-question="victim-working"]') || '',
                otherDriverWorking: getSelectedValue('[data-question="other-driver-working"]') || '',
                
                // Medical information
                medicalAttention7Days: getSelectedValue('[data-question="medical-7-days"]') || '',
                medicalAttention14Days: getSelectedValue('[data-question="medical-14-days"]') || '',
                
                // Documentation
                policeReport: getSelectedValue('[data-question="police-report"]') || '',
                hasPoliceReportCopy: getSelectedValue('[data-question="police-report-copy"]') || '',
                
                // Contact information
                firstName: document.getElementById('first-name')?.value || '',
                lastName: document.getElementById('last-name')?.value || '',
                phoneNumber: document.getElementById('phone')?.value || '',
                emailAddress: document.getElementById('email')?.value || ''
            };
            
            console.log('Submitting form data:', formData);
            
            // Send data to API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success message or redirect
                console.log('Success:', data);
                
                // If form has a success message div, display it
                const successMessageDiv = document.getElementById('success-message');
                if (successMessageDiv) {
                    // Hide form
                    form.style.display = 'none';
                    
                    // Show success message
                    successMessageDiv.innerHTML = `
                        <h3>Thank you for your submission!</h3>
                        <p>Your claim has been received. Your reference ID is: ${data.leadId}</p>
                        <p>A representative will contact you soon.</p>
                    `;
                    successMessageDiv.style.display = 'block';
                } else {
                    // Otherwise, redirect to thank you page
                    window.location.href = '/thank-you.html';
                }
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Show error message
            alert('There was an error processing your submission. Please try again later.');
            
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit My Case Details';
            }
        }
    });
    
    // Helper function to get selected value from radio buttons or dropdowns
    function getSelectedValue(selector) {
        const selected = document.querySelector(`${selector}:checked`) || 
                         document.querySelector(`${selector} option:checked`);
        
        return selected ? (selected.value || selected.textContent.trim()) : '';
    }
}); 