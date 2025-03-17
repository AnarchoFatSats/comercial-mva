/**
 * MyInjuryClaimNow.com Integration
 * This file integrates the myinjuryclaimnow.com website with our unified lead processing system
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize TrustedForms
    if (typeof initTrustedForms === 'function') {
        initTrustedForms();
    } else {
        console.error('TrustedForms initialization function not found. Make sure trusted-forms.js is loaded first.');
    }

    // Find the form element - adjust selector as needed for the site
    const form = document.querySelector('form') || document.getElementById('claim-form');
    
    if (!form) {
        console.error('Form not found on the page');
        return;
    }
    
    // Add form submission event listener
    form.addEventListener('submit', async function(event) {
        // Prevent default form submission
        event.preventDefault();
        
        // Collect form data
        const formData = collectFormData();
        
        // Submit to our API
        await submitToUnifiedApi(formData);
        
        // Allow the original form submission to continue if needed
        // or redirect the user to a thank you page
        window.location.href = 'thank-you.html';
    });
    
    /**
     * Collect data from the form
     * @returns {Object} Form data
     */
    function collectFormData() {
        // Initialize form data object
        const formData = {};
        
        // Extract vehicle type
        const vehicleTypeOptions = document.querySelectorAll('[name="vehicle-type"], [data-question="vehicle-type"]');
        vehicleTypeOptions.forEach(option => {
            if (option.checked) {
                formData.vehicle_type = option.value || option.textContent.trim();
            }
        });
        
        // Extract work purpose information
        const workPurposeOptions = document.querySelectorAll('[name="work-purpose"], [data-question="work-purpose"]');
        workPurposeOptions.forEach(option => {
            if (option.checked) {
                formData.work_purpose = option.value || option.textContent.trim();
            }
        });
        
        // Extract fault information
        const faultOptions = document.querySelectorAll('[name="fault"], [data-question="fault"]');
        faultOptions.forEach(option => {
            if (option.checked) {
                formData.fault = option.value || option.textContent.trim();
            }
        });
        
        // Extract accident date
        const dateInput = document.querySelector('[name="accident-date"], [data-question="accident-date"]');
        if (dateInput) {
            formData.accident_date = dateInput.value;
        }
        
        // Extract working status
        const workingStatusOptions = document.querySelectorAll('[name="working-status"], [data-question="working-status"]');
        workingStatusOptions.forEach(option => {
            if (option.checked) {
                formData.working_status = option.value || option.textContent.trim();
            }
        });
        
        // Extract other driver status
        const otherDriverOptions = document.querySelectorAll('[name="other-driver-status"], [data-question="other-driver-status"]');
        otherDriverOptions.forEach(option => {
            if (option.checked) {
                formData.other_driver_status = option.value || option.textContent.trim();
            }
        });
        
        // Extract medical attention timing
        const medicalOptions = document.querySelectorAll('[name="medical-attention"], [data-question="medical-attention"]');
        medicalOptions.forEach(option => {
            if (option.checked) {
                formData.medical_attention = option.value || option.textContent.trim();
            }
        });
        
        // Extract police report information
        const policeReportOptions = document.querySelectorAll('[name="police-report"], [data-question="police-report"]');
        policeReportOptions.forEach(option => {
            if (option.checked) {
                formData.police_report = option.value || option.textContent.trim();
            }
        });
        
        // Extract contact information
        const firstNameInput = document.querySelector('[name="first-name"], #first-name');
        const lastNameInput = document.querySelector('[name="last-name"], #last-name');
        const phoneInput = document.querySelector('[name="phone"], #phone');
        const emailInput = document.querySelector('[name="email"], #email');
        
        if (firstNameInput) formData.first_name = firstNameInput.value;
        if (lastNameInput) formData.last_name = lastNameInput.value;
        if (phoneInput) formData.phone = phoneInput.value;
        if (emailInput) formData.email = emailInput.value;
        
        // Determine if the lead is qualified based on responses
        formData.qualified = determineQualification(formData);
        
        return formData;
    }
    
    /**
     * Determine if the lead is qualified based on form responses
     * @param {Object} formData Form data
     * @returns {boolean} Whether the lead is qualified
     */
    function determineQualification(formData) {
        // Logic to determine qualification
        // This should match the site's qualification logic
        
        // Example qualification criteria:
        // 1. Accident occurred within the last 2 years
        // 2. Vehicle was being used for work purposes
        // 3. The other driver was primarily at fault
        // 4. Medical attention was sought within 14 days
        
        // Check accident date
        if (formData.accident_date) {
            const accidentDate = new Date(formData.accident_date);
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            
            if (accidentDate < twoYearsAgo) {
                return false;
            }
        }
        
        // Check if not qualified based on fault
        if (formData.fault === 'Me') {
            return false;
        }
        
        // Check work purposes
        if (formData.work_purpose === 'No, it was not for work') {
            return false;
        }
        
        // Check medical attention
        if (formData.medical_attention && 
            (formData.medical_attention.includes('after 14 days') || 
             formData.medical_attention.includes('not yet'))) {
            return false;
        }
        
        // Default to qualified if we don't have specific disqualification
        return true;
    }
    
    /**
     * Submit the form data to our unified API
     * @param {Object} formData Form data
     */
    async function submitToUnifiedApi(formData) {
        try {
            // Create a standardized lead data object using our schema
            const leadData = createLeadData(
                'myinjuryclaimnow', // sourceSite
                'MVA',              // funnelType 
                'work_vehicle_accident', // leadType
                'LegalAds'          // adCategory
            );
            
            // Fill in contact information
            leadData.contactInfo = {
                firstName: formData.first_name || '',
                lastName: formData.last_name || '',
                email: formData.email || '',
                phone: formData.phone || '',
            };
            
            // Set qualified flag
            leadData.qualified = formData.qualified;
            
            // Copy all the form-specific data to the formData section
            leadData.formData = { ...formData };
            
            // Get TrustedForm certificate if available
            try {
                const certificateUrl = await getTrustedFormCertificate();
                if (certificateUrl) {
                    leadData.trustedFormCertUrl = certificateUrl;
                }
            } catch (error) {
                console.error('Error getting TrustedForm certificate:', error);
                // Continue submission even if TrustedForms fails
            }
            
            console.log('Submitting standardized lead data:', leadData);
            
            // Send to unified API endpoint
            const response = await fetch('https://REPLACE_WITH_YOUR_UNIFIED_API_ENDPOINT/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leadData)
            });
            
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('API response:', responseData);
            
            return responseData;
        } catch (error) {
            console.error('Error submitting form:', error);
            // Still continue with redirection even if API fails
            return null;
        }
    }
});

/**
 * Utility function to get the value of a URL parameter
 * @param {string} name Parameter name
 * @returns {string} Parameter value
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
} 