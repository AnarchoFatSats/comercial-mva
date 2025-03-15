/**
 * Multi-step Form Implementation
 * Handles the logic for the multi-step lead capture form
 */
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('claim-form');
    const progressBar = document.getElementById('progress-bar');
    const heroCta = document.getElementById('hero-cta');
    
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
        timestamp: new Date().toISOString(),
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
        
        // Add event listener to form submission
        form.addEventListener('submit', handleSubmit);
        
        // Add event listener to hero CTA
        heroCta.addEventListener('click', () => {
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
        
        // Show calculation animation before submitting
        showCalculationAnimation(phone);
        
        // Submit the form data to DynamoDB after animation
        setTimeout(() => {
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
        }, 3000); // Wait for 3 seconds to show the calculation animation
    }
    
    // Show calculation animation
    function showCalculationAnimation(phone) {
        // Hide all steps
        steps.forEach(step => {
            step.style.display = 'none';
        });
        
        // Create calculation container if it doesn't exist
        let calculationContainer = document.getElementById('calculation-container');
        if (!calculationContainer) {
            calculationContainer = document.createElement('div');
            calculationContainer.id = 'calculation-container';
            calculationContainer.className = 'form-step calculation-container';
            form.appendChild(calculationContainer);
        }
        
        // Set calculation content with animation
        calculationContainer.innerHTML = `
            <div class="calculation-animation">
                <div class="calculation-progress">
                    <div class="calculation-bar"></div>
                </div>
                <h3>Analyzing Your Claim...</h3>
                <p>Please wait while we process your information.</p>
            </div>
        `;
        
        // Show calculation container
        calculationContainer.style.display = 'block';
        
        // Ensure container is visible and scrolled into view
        calculationContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Animate the calculation bar
        const calculationBar = calculationContainer.querySelector('.calculation-bar');
        calculationBar.style.width = '0%';
        
        // Animate to 100% over 2 seconds
        setTimeout(() => {
            calculationBar.style.width = '100%';
        }, 100);
        
        // Update text after calculation is complete
        setTimeout(() => {
            // Fade out the current content
            const currentAnimation = calculationContainer.querySelector('.calculation-animation');
            currentAnimation.style.opacity = '0';
            
            setTimeout(() => {
                calculationContainer.innerHTML = `
                    <div class="calculation-complete">
                        <div class="success-icon">✓</div>
                        <h3>Analysis Complete</h3>
                        <p>Your claim is being reviewed by our team.</p>
                        <p class="calculation-message">Preparing your results...</p>
                    </div>
                `;
                
                // Ensure updated content is visible
                calculationContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // After a short delay, show the approval animation
                setTimeout(() => {
                    // Get the success icon and apply the approved animation
                    const successIcon = calculationContainer.querySelector('.success-icon');
                    successIcon.style.animation = 'approved 1.5s forwards';
                    
                    // Fade out the text
                    const texts = calculationContainer.querySelectorAll('p, h3');
                    texts.forEach(text => {
                        text.style.opacity = '0.5';
                    });
                    
                    // After a short transition, update the text
                    setTimeout(() => {
                        calculationContainer.innerHTML = `
                            <div class="calculation-complete">
                                <div class="success-icon" style="background-color: #4CAF50;">✓</div>
                                <h3>Claim Approved!</h3>
                                <p>Congratulations! Your claim has been approved.</p>
                                <p class="calculation-message">Preparing your next steps...</p>
                            </div>
                        `;
                        
                        // After another short delay, transition to the final success screen
                        setTimeout(() => {
                            // Fade out the calculation container
                            calculationContainer.style.opacity = '0';
                            
                            setTimeout(() => {
                                // Remove the calculation container
                                calculationContainer.style.display = 'none';
                                
                                // Show the success message with call CTA
                                showSuccessWithCallCTA(phone);
                            }, 500);
                        }, 1500);
                    }, 500);
                }, 1500);
            }, 300);
        }, 2500);
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
        
        // Set success content with click-to-call button
        successContainer.innerHTML = `
            <div class="success-icon">✓</div>
            <h3>Your Claim is Approved! Call Now to Start Your Settlement!</h3>
            <p>Based on your file, we are elevating you to a case manager who can finalize your claim immediately.</p>
            <p class="success-message">One call starts your compensation process:</p>
            <a href="tel:+18339986932" class="call-cta-button">
                <span class="phone-icon">📞</span>
                <span>Call (833) 998-6932 Now</span>
            </a>
            <p class="success-note">Our settlement specialists are standing by to begin processing your claim immediately. Don't delay - approved claims that aren't initiated within 24 hours may require resubmission.</p>
        `;
        
        // Show success container
        successContainer.style.display = 'block';
        
        // Ensure container is visible and scrolled into view
        successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Update progress bar to complete
        updateProgressBar(totalSteps, totalSteps);
        
        // Track conversion
        trackConversion(formData);
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
            
            // Ensure lead_id is properly set as the partition key
            if (!data.lead_id) {
                data.lead_id = generateLeadId(data.first_name || '', data.last_name || '', data.phone || '');
            }
            
            // Update timestamp in ISO format
            data.timestamp = new Date().toISOString();
            
            // Add TTL for data retention (90 days)
            const ttl = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);
            data.ttl = ttl;
            
            // Add website identifier
            data.website = window.location.hostname;
            
            // Call the API Gateway endpoint
            const response = await fetch('https://qqvw1jnwx3.execute-api.us-east-1.amazonaws.com/prod/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'dHKgV9XLco5zYlq1EOft48ZcAEcJBMaO3MuZVLl9'
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