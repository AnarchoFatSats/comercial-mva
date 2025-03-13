/**
 * Multi-step Form Implementation
 * Handles the logic for the multi-step lead capture form
 */
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('claim-form');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicators = document.getElementById('step-indicators');
    const heroCta = document.getElementById('hero-cta');
    const mobileCta = document.getElementById('mobile-cta');
    
    // Form steps
    const steps = document.querySelectorAll('.form-step');
    const totalSteps = 7; // Main steps (not counting conditional steps)
    
    // Current step tracking
    let currentStep = 0;
    let formData = {
        // Add site identification and lead type tags
        source: 'commercial-mva',
        lead_type: 'work_vehicle_accident',
        utm_source: getUrlParameter('utm_source') || 'direct',
        utm_medium: getUrlParameter('utm_medium') || '',
        utm_campaign: getUrlParameter('utm_campaign') || '',
        landing_page: window.location.href,
        submission_date: new Date().toISOString(),
        user_agent: navigator.userAgent
    };
    
    // Initialize the form
    initForm();
    
    // Get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Initialize the form
    function initForm() {
        // Create step indicators
        createStepIndicators();
        
        // Show first step
        showStep(0);
        
        // Add event listeners to option buttons
        document.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('click', handleOptionSelection);
        });
        
        // Add event listeners to next buttons
        document.querySelectorAll('.next-button').forEach(button => {
            button.addEventListener('click', () => {
                validateAndProceed();
            });
        });
        
        // Add event listener to restart button
        document.querySelector('.restart-button').addEventListener('click', restartForm);
        
        // Add event listener to form submission
        form.addEventListener('submit', handleSubmit);
        
        // Add event listeners to hero and mobile CTAs
        heroCta.addEventListener('click', () => {
            document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
        });
        
        mobileCta.addEventListener('click', () => {
            document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Set max date for accident date (2 years ago)
        const datePicker = document.getElementById('accident-date');
        const today = new Date();
        const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
        const maxDate = today.toISOString().split('T')[0];
        const minDate = twoYearsAgo.toISOString().split('T')[0];
        
        datePicker.setAttribute('max', maxDate);
        datePicker.setAttribute('min', minDate);
    }
    
    // Create step indicators
    function createStepIndicators() {
        for (let i = 0; i < totalSteps; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('step-indicator');
            indicator.textContent = i + 1;
            stepIndicators.appendChild(indicator);
        }
    }
    
    // Show a specific step
    function showStep(stepIndex) {
        // Hide all steps
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Show the current step
        steps[stepIndex].classList.add('active');
        
        // Update progress bar
        updateProgressBar(stepIndex, totalSteps - 1);
        
        // Update current step
        currentStep = stepIndex;
    }
    
    // Update progress bar
    function updateProgressBar(current, total) {
        const progress = (current / total) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Update step indicators
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            if (index <= current) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Handle option selection
    function handleOptionSelection(e) {
        const button = e.target;
        const stepElement = button.closest('.form-step');
        const stepButtons = stepElement.querySelectorAll('.option-button');
        
        // Remove selected class from all buttons in this step
        stepButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected class to clicked button
        button.classList.add('selected');
        
        // Store the selection with proper question text and answer
        const stepId = stepElement.id;
        const value = button.getAttribute('data-value');
        
        // Get the question text
        const questionText = stepElement.querySelector('h3').textContent;
        const answerText = button.textContent.trim();
        
        // Store both the raw value and human-readable Q&A
        formData[stepId] = value;
        formData[`${stepId}_question`] = questionText;
        formData[`${stepId}_answer`] = answerText;
        
        // Process conditional logic
        setTimeout(() => {
            processConditionalLogic(stepId, value);
        }, 300);
    }
    
    // Process conditional logic based on user selection
    function processConditionalLogic(stepId, value) {
        switch (stepId) {
            case 'step-1':
                if (value === 'unsure') {
                    // If unsure about the type of work vehicle, ask for confirmation
                    showStep(1); // Show step-1b
                } else {
                    // Otherwise, proceed to step 2
                    showStep(2);
                }
                break;
                
            case 'step-1b':
                if (value === 'no') {
                    // If not a work vehicle, disqualify
                    showDisqualification();
                } else {
                    // Otherwise, proceed to step 2
                    showStep(2);
                }
                break;
                
            case 'step-2':
                if (value === 'me') {
                    // If user was at fault, disqualify
                    showDisqualification();
                } else {
                    // Otherwise, proceed to step 3
                    showStep(3);
                }
                break;
                
            case 'step-3':
                // Date validation is handled in validateAndProceed
                break;
                
            case 'step-4':
                if (value === 'no') {
                    // If not on the clock, ask if other driver was in work vehicle
                    showStep(5); // Show step-4b
                } else {
                    // Otherwise, proceed to step 5
                    showStep(6);
                }
                break;
                
            case 'step-4b':
                if (value === 'no') {
                    // If not a work vehicle, disqualify
                    showDisqualification();
                } else if (value === 'unsure') {
                    // If unsure, still proceed but note this in the form data
                    formData['vehicle_confirmation'] = 'unsure';
                    showStep(6);
                } else {
                    // Otherwise, proceed to step 5
                    showStep(6);
                }
                break;
                
            case 'step-5':
                if (value === 'no') {
                    // If no medical attention within 7 days, ask if within 14 days
                    showStep(7); // Show step-5b
                } else {
                    // Otherwise, proceed to step 6
                    showStep(8);
                }
                break;
                
            case 'step-5b':
                if (value === 'no') {
                    // If no medical attention within 14 days, disqualify
                    showDisqualification();
                } else {
                    // Otherwise, proceed to step 6
                    showStep(8);
                }
                break;
                
            case 'step-6':
                if (value === 'yes') {
                    // If police report was filed, ask if they have a copy
                    showStep(9); // Show step-6b
                } else {
                    // Otherwise, proceed to final step
                    showStep(10);
                }
                break;
                
            case 'step-6b':
                // Regardless of answer, proceed to final step
                showStep(10);
                break;
                
            default:
                // For any other step, just go to the next one
                showStep(currentStep + 1);
                break;
        }
    }
    
    // Validate current step and proceed
    function validateAndProceed() {
        if (currentStep === 3) { // Date picker step
            const datePicker = document.getElementById('accident-date');
            if (!datePicker.value) {
                // Show error if date is not selected
                datePicker.classList.add('error');
                return;
            }
            
            // Check if date is more than 2 years ago
            const selectedDate = new Date(datePicker.value);
            const today = new Date();
            const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
            
            if (selectedDate < twoYearsAgo) {
                // If date is more than 2 years ago, disqualify
                showDisqualification();
                return;
            }
            
            // Store the date and proceed
            formData['accident-date'] = datePicker.value;
            
            // Get the question text
            const questionText = document.querySelector('#step-3 h3').textContent;
            formData['step-3_question'] = questionText;
            formData['step-3_answer'] = datePicker.value;
            
            showStep(4);
        }
    }
    
    // Show disqualification message
    function showDisqualification() {
        document.getElementById('disqualification').classList.add('active');
        
        // Hide all other steps
        steps.forEach(step => {
            if (step.id !== 'disqualification') {
                step.classList.remove('active');
            }
        });
        
        // Add disqualification reason to form data
        formData['qualified'] = false;
        formData['disqualification_reason'] = determineDisqualificationReason();
        
        // Submit disqualified lead data to DynamoDB
        submitToDynamoDB(formData);
    }
    
    // Determine the reason for disqualification
    function determineDisqualificationReason() {
        if (formData['step-1b'] === 'no') {
            return 'Not a work/commercial vehicle';
        } else if (formData['step-2'] === 'me') {
            return 'User was at fault';
        } else if (formData['step-4b'] === 'no') {
            return 'Vehicle not used for work purposes';
        } else if (formData['step-5b'] === 'no') {
            return 'No medical attention within 14 days';
        } else if (formData['accident-date']) {
            const selectedDate = new Date(formData['accident-date']);
            const today = new Date();
            const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
            
            if (selectedDate < twoYearsAgo) {
                return 'Accident occurred more than 2 years ago';
            }
        }
        
        return 'Unknown reason';
    }
    
    // Restart the form
    function restartForm() {
        // Clear form data except for source tracking info
        const sourceData = {
            source: formData.source,
            lead_type: formData.lead_type,
            utm_source: formData.utm_source,
            utm_medium: formData.utm_medium,
            utm_campaign: formData.utm_campaign,
            landing_page: formData.landing_page,
            user_agent: formData.user_agent
        };
        
        formData = sourceData;
        formData.submission_date = new Date().toISOString();
        
        // Reset all selected buttons
        document.querySelectorAll('.option-button').forEach(button => {
            button.classList.remove('selected');
        });
        
        // Reset all input fields
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        
        // Hide success container if it exists
        const successContainer = document.getElementById('success-container');
        if (successContainer) {
            successContainer.style.display = 'none';
        }
        
        // Show all steps (they'll be hidden by showStep)
        steps.forEach(step => {
            step.style.display = '';
        });
        
        // Show first step
        showStep(0);
    }
    
    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();
        
        // Validate final step
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        
        if (!firstName || !lastName || !phone || !email) {
            // Show error if any field is empty
            if (!firstName) document.getElementById('first-name').classList.add('error');
            if (!lastName) document.getElementById('last-name').classList.add('error');
            if (!phone) document.getElementById('phone').classList.add('error');
            if (!email) document.getElementById('email').classList.add('error');
            return;
        }
        
        // Validate phone format
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(phone)) {
            document.getElementById('phone').classList.add('error');
            return;
        }
        
        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            document.getElementById('email').classList.add('error');
            return;
        }
        
        // Store contact info
        formData['first_name'] = firstName;
        formData['last_name'] = lastName;
        formData['phone'] = phone;
        formData['email'] = email;
        formData['qualified'] = true;
        
        // Get the question text for contact info
        const contactQuestionText = document.querySelector('#step-7 h3').textContent;
        formData['contact_question'] = contactQuestionText;
        
        // Generate a unique lead ID
        formData['lead_id'] = generateLeadId(firstName, lastName, phone);
        
        // Submit the form data to DynamoDB
        submitToDynamoDB(formData)
            .then(() => {
                // Show success message with click-to-call CTA
                showSuccessWithCallCTA(phone);
            })
            .catch(error => {
                console.error('Error submitting to DynamoDB:', error);
                // Still show success to user even if there's an error
                showSuccessWithCallCTA(phone);
            });
    }
    
    // Generate a unique lead ID
    function generateLeadId(firstName, lastName, phone) {
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 10000);
        const nameInitials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        const lastFourDigits = phone.slice(-4);
        
        return `${nameInitials}${lastFourDigits}-${timestamp}-${randomNum}`;
    }
    
    // Submit data to DynamoDB via API Gateway
    async function submitToDynamoDB(data) {
        try {
            // Log the data being sent (for development purposes)
            console.log('Submitting to DynamoDB:', data);
            
            // Call the API Gateway endpoint
            const response = await fetch('https://REPLACE_WITH_YOUR_API_ENDPOINT/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('DynamoDB response:', responseData);
            
            return responseData;
        } catch (error) {
            console.error('Error submitting to DynamoDB:', error);
            // Re-throw the error so the calling function can handle it
            throw error;
        }
    }
    
    // Show success message with click-to-call CTA
    function showSuccessWithCallCTA(phone) {
        // Hide all steps
        steps.forEach(step => {
            step.style.display = 'none';
        });
        
        // Create success message container if it doesn't exist
        let successContainer = document.getElementById('success-container');
        if (!successContainer) {
            successContainer = document.createElement('div');
            successContainer.id = 'success-container';
            successContainer.className = 'form-step success-container';
            form.appendChild(successContainer);
        }
        
        // Format phone number for display
        const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        
        // Set success content with click-to-call button
        successContainer.innerHTML = `
            <div class="success-icon">✓</div>
            <h3>Your Case Has Been Submitted!</h3>
            <p>Thank you for providing your information. One of our specialists will review your case details shortly.</p>
            <p class="success-message">For immediate assistance, call us now:</p>
            <a href="tel:+1${phone}" class="call-cta-button">
                <span class="phone-icon">📞</span>
                <span>Call (${phone.substring(0,3)}) ${phone.substring(3,6)}-${phone.substring(6)}</span>
            </a>
            <p class="success-note">Our team is standing by to discuss your case and answer any questions.</p>
            <button type="button" class="restart-button">Submit Another Case</button>
        `;
        
        // Show success container
        successContainer.style.display = 'block';
        
        // Update progress bar to complete
        updateProgressBar(totalSteps, totalSteps);
        
        // Add event listener to restart button
        successContainer.querySelector('.restart-button').addEventListener('click', restartForm);
        
        // Track conversion
        trackConversion(formData);
    }
    
    // Track conversion for analytics
    function trackConversion(data) {
        // Google Analytics conversion tracking
        if (typeof gtag === 'function') {
            gtag('event', 'conversion', {
                'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
                'value': 1.0,
                'currency': 'USD',
                'transaction_id': data.lead_id
            });
        }
        
        // Facebook Pixel conversion tracking
        if (typeof fbq === 'function') {
            fbq('track', 'Lead', {
                content_name: 'Work Vehicle Accident Claim',
                content_category: 'Legal',
                value: 1.0,
                currency: 'USD',
                lead_id: data.lead_id
            });
        }
    }
    
    // Remove error class when input changes
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
}); 