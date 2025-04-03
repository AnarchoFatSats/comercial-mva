/**
 * Multi-step Form Implementation
 * Handles the logic for the multi-step lead capture form
 * With enhanced accessibility features
 */
document.addEventListener('DOMContentLoaded', function() {
    // Immediately scroll to top (fixes auto-scrolling issue)
    window.scrollTo(0, 0);
    
    // Form elements
    const form = document.getElementById('claim-form');
    const progressBar = document.querySelector('.progress-bar');
    const heroCta = document.getElementById('hero-cta');
    
    // Accessibility announcement element for screen readers
    let ariaLiveRegion;
    
    // Create aria-live region for screen reader announcements
    function createAriaLiveRegion() {
        ariaLiveRegion = document.createElement('div');
        ariaLiveRegion.setAttribute('aria-live', 'polite');
        ariaLiveRegion.setAttribute('aria-atomic', 'true');
        ariaLiveRegion.classList.add('sr-only'); // Screen reader only
        document.body.appendChild(ariaLiveRegion);
    }
    
    // Announce messages to screen readers
    function announceToScreenReader(message) {
        if (ariaLiveRegion) {
            ariaLiveRegion.textContent = message;
        }
    }
    
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
        // Create aria-live region for accessibility
        createAriaLiveRegion();
        
        // Add role="form" and aria-label to the form
        form.setAttribute('role', 'form');
        form.setAttribute('aria-label', 'Work Vehicle Accident Claim Qualification Form');
        
        // Show first step
        showStep(0);
        
        // Add event listeners to option buttons
        document.querySelectorAll('.option-button').forEach((button, index) => {
            // Add accessibility attributes
            button.setAttribute('role', 'radio');
            button.setAttribute('aria-checked', 'false');
            button.setAttribute('tabindex', '0');
            
            // Add event listeners with debugging
            button.addEventListener('click', function(e) {
                console.log('Button clicked:', button.textContent.trim());
                handleOptionSelection(e);
            });
            
            // Add keyboard support
            button.addEventListener('keydown', function(e) {
                // Enter or Space to select
                if (e.key === 'Enter' || e.key === ' ') {
                    console.log('Button activated via keyboard:', button.textContent.trim());
                    e.preventDefault();
                    handleOptionSelection({ target: button });
                }
            });
        });
        
        // Add event listeners to next buttons
        document.querySelectorAll('.next-button').forEach(button => {
            button.addEventListener('click', () => {
                validateAndProceed();
            });
            
            // Add keyboard support
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    validateAndProceed();
                }
            });
        });
        
        // Add event listener to form submission
        form.addEventListener('submit', handleSubmit);
        
        // Add event listener to hero CTA - only scroll when clicked
        if (heroCta) {
            heroCta.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default link behavior
                const formSection = document.getElementById('form-section');
                if (formSection) {
                    // Explicitly scroll to the form section only when clicked
                    formSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        // Set max date for accident date (2 years ago)
        const datePicker = document.getElementById('accident-date');
        const today = new Date();
        const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
        const maxDate = today.toISOString().split('T')[0];
        const minDate = twoYearsAgo.toISOString().split('T')[0];
        
        datePicker.setAttribute('max', maxDate);
        datePicker.setAttribute('min', minDate);
        
        // Add accessibility attributes to date picker
        datePicker.setAttribute('aria-label', 'Date of accident');
        datePicker.setAttribute('aria-required', 'true');
        datePicker.setAttribute('aria-describedby', 'date-hint');
        
        // Add accessibility attributes to input fields
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
            input.setAttribute('aria-required', 'true');
            
            // Add descriptive labels for screen readers
            const labelText = input.previousElementSibling ? input.previousElementSibling.textContent : '';
            if (labelText) {
                input.setAttribute('aria-label', labelText.trim());
            }
        });
        
        // Make progress bar accessible
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.setAttribute('role', 'progressbar');
            progressContainer.setAttribute('aria-valuemin', '0');
            progressContainer.setAttribute('aria-valuemax', '100');
            progressContainer.setAttribute('aria-valuenow', '0');
            progressContainer.setAttribute('aria-label', 'Form completion progress');
        }
    }
    
    // Show a specific step
    function showStep(stepIndex) {
        // Hide all steps
        steps.forEach(step => {
            step.classList.remove('active');
            step.setAttribute('aria-hidden', 'true');
        });
        
        // Show the current step
        steps[stepIndex].classList.add('active');
        steps[stepIndex].setAttribute('aria-hidden', 'false');
        
        // For more accurate progress calculation, determine visible steps only
        const visibleStepCount = getVisibleStepCount();
        const currentVisibleStep = getVisibleStepNumber(stepIndex);
        
        // Check if this is the contact information step (final step)
        const isFinalStep = steps[stepIndex].id === 'step-7';
        
        // Update progress bar with visible step count
        // If it's the final step, treat as last step for progress purposes
        if (isFinalStep) {
            updateProgressBar(visibleStepCount - 1, visibleStepCount - 1);
        } else {
            updateProgressBar(currentVisibleStep, visibleStepCount - 1);
        }
        
        // Update current step
        currentStep = stepIndex;
        
        // Set focus to the first focusable element in the step
        const focusableElements = steps[stepIndex].querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            setTimeout(() => {
                focusableElements[0].focus();
            }, 100);
        }
        
        // Announce step change to screen readers
        const stepTitle = steps[stepIndex].querySelector('h3');
        if (stepTitle) {
            announceToScreenReader(`Step ${getVisibleStepNumber(stepIndex) + 1} of ${visibleStepCount}: ${stepTitle.textContent}`);
        }
    }
    
    // Get the count of visible steps (excluding conditional steps)
    function getVisibleStepCount() {
        // These are the main steps (not conditional)
        const mainStepIds = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7'];
        return mainStepIds.length;
    }
    
    // Get the visible step number for a given index
    function getVisibleStepNumber(stepIndex) {
        // Map the actual step index to a visible step number
        // This converts conditional step indices to their corresponding main step number
        const stepElement = steps[stepIndex];
        
        if (!stepElement) return 0;
        
        const stepId = stepElement.id;
        
        // Determine which main step this belongs to
        if (stepId === 'step-1' || stepId === 'step-1b') return 0;
        if (stepId === 'step-2') return 1;
        if (stepId === 'step-3') return 2;
        if (stepId === 'step-4' || stepId === 'step-4b') return 3;
        if (stepId === 'step-5' || stepId === 'step-5b') return 4;
        if (stepId === 'step-6' || stepId === 'step-6b') return 5;
        if (stepId === 'step-7') return 6;
        
        // Default case
        return 0;
    }
    
    // Update progress bar
    function updateProgressBar(current, total) {
        // Use a more progressive scale for the progress bar
        let progress;
        
        // Make sure the step is properly tracked
        console.log(`Progress bar update: Step ${current+1} of ${total+1}`);
        
        if (current === total) {
            // Last step - show 100%
            progress = 100;
        } else if (current === total - 1) {
            // Second to last step - show 90%
            progress = 90;
        } else {
            // Scale other steps between 0-85% proportionally
            progress = (current / (total - 1)) * 85;
        }
        
        // Add null check for progressBar
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            console.log(`Setting progress bar width to ${progress}%`);
        } else {
            console.warn('Progress bar element not found');
        }
        
        // Update ARIA attributes for accessibility
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.setAttribute('aria-valuenow', progress);
            progressContainer.setAttribute('aria-valuetext', `Step ${current + 1} of ${total + 1}, ${Math.round(progress)}% complete`);
        }
    }
    
    // Handle option selection
    function handleOptionSelection(e) {
        const button = e.target;
        console.log('handleOptionSelection called for:', button.textContent.trim());
        
        // Ensure we have the button element
        if (!button || !button.classList.contains('option-button')) {
            console.error('Invalid button element:', button);
            return;
        }
        
        const stepElement = button.closest('.form-step');
        if (!stepElement) {
            console.error('Could not find parent step element');
            return;
        }
        
        const stepButtons = stepElement.querySelectorAll('.option-button');
        
        // Remove selected class from all buttons in this step
        stepButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-checked', 'false');
        });
        
        // Add selected class to clicked button
        button.classList.add('selected');
        button.setAttribute('aria-checked', 'true');
        
        // Store the selection with proper question text and answer
        const stepId = stepElement.id;
        const value = button.getAttribute('data-value');
        
        console.log('Step ID:', stepId, 'Value:', value);
        
        // Get the question text
        const questionText = stepElement.querySelector('h3').textContent;
        const answerText = button.textContent.trim();
        
        // Store both the raw value and human-readable Q&A
        formData[stepId] = value;
        formData[`${stepId}_question`] = questionText;
        formData[`${stepId}_answer`] = answerText;
        
        // Announce selection to screen readers
        announceToScreenReader(`Selected: ${answerText}`);
        
        // Process conditional logic with a slight delay to ensure UI updates first
        setTimeout(() => {
            console.log('Processing conditional logic for step:', stepId, 'with value:', value);
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
                    // Show early lead capture
                    showStep(2); // Show step-1c (early lead capture)
                }
                break;
                
            case 'step-1b':
                if (value === 'no') {
                    // If not a work vehicle, disqualify
                    showDisqualification();
                } else {
                    // Show early lead capture
                    showStep(2); // Show step-1c (early lead capture)
                }
                break;
                
            case 'step-1c':
                // After collecting early lead info, proceed to fault question
                showStep(3); // Show step-2 (fault question)
                break;
                
            case 'step-2':
                if (value === 'me') {
                    // If user was at fault, disqualify
                    showDisqualification();
                } else {
                    // Otherwise, proceed to step 3
                    showStep(4);
                }
                break;
                
            case 'step-3':
                // Date validation is handled in validateAndProceed
                break;
                
            case 'step-4':
                if (value === 'no') {
                    // If not on the clock, ask if other driver was in work vehicle
                    showStep(6); // Show step-4b
                } else {
                    // Otherwise, proceed to step 5
                    showStep(7);
                }
                break;
                
            case 'step-4b':
                if (value === 'no') {
                    // If not a work vehicle, disqualify
                    showDisqualification();
                } else if (value === 'unsure') {
                    // If unsure, still proceed but note this in the form data
                    formData['vehicle_confirmation'] = 'unsure';
                    showStep(7);
                } else {
                    // Otherwise, proceed to step 5
                    showStep(7);
                }
                break;
                
            case 'step-5':
                if (value === 'no') {
                    // If no medical attention within 7 days, ask if within 14 days
                    showStep(8); // Show step-5b
                } else {
                    // Otherwise, proceed to step 6
                    showStep(9);
                }
                break;
                
            case 'step-5b':
                if (value === 'no') {
                    // If no medical attention within 14 days, disqualify
                    showDisqualification();
                } else {
                    // Otherwise, proceed to step 6
                    showStep(9);
                }
                break;
                
            case 'step-6':
                if (value === 'yes') {
                    // If police report was filed, ask if they have a copy
                    showStep(10); // Show step-6b
                } else {
                    // Otherwise, proceed to final step
                    showStep(11);
                }
                break;
                
            case 'step-6b':
                // Regardless of answer, proceed to final step
                showStep(11);
                break;
                
            default:
                // For any other step, just go to the next one
                showStep(currentStep + 1);
                break;
        }
    }
    
    // Validate current step and proceed
    function validateAndProceed() {
        if (currentStep === 2) { // Early lead capture step
            const earlyFirstName = document.getElementById('early-first-name').value;
            const earlyEmail = document.getElementById('early-email').value;
            
            if (!earlyFirstName || !earlyEmail) {
                // Show error if fields are empty
                if (!earlyFirstName) document.getElementById('early-first-name').classList.add('error');
                if (!earlyEmail) document.getElementById('early-email').classList.add('error');
                return;
            }
            
            // Validate email format
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(earlyEmail)) {
                document.getElementById('early-email').classList.add('error');
                return;
            }
            
            // Store the early lead info
            formData['early_first_name'] = earlyFirstName;
            formData['early_email'] = earlyEmail;
            formData['partial_lead'] = true;
            
            // Submit early lead data to database in the background
            submitEarlyLead(formData);
            
            // Continue to next step
            showStep(3);
        } else if (currentStep === 4) { // Date picker step (adjusted for new flow)
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
            
            showStep(5);
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
    async function handleSubmit(e) {
        e.preventDefault();
        
        // Validate final step
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const tcpaConsent = document.getElementById('tcpa-consent').checked;
        
        if (!firstName || !lastName || !phone || !email || !tcpaConsent) {
            // Show error if any field is empty
            if (!firstName) document.getElementById('first-name').classList.add('error');
            if (!lastName) document.getElementById('last-name').classList.add('error');
            if (!phone) document.getElementById('phone').classList.add('error');
            if (!email) document.getElementById('email').classList.add('error');
            if (!tcpaConsent) {
                const tcpaCheckbox = document.getElementById('tcpa-consent');
                tcpaCheckbox.parentElement.classList.add('error');
                announceToScreenReader("TCPA consent is required");
            }
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
        
        // Set progress bar to 100% - form is complete
        if (progressBar) {
            progressBar.style.width = '100%';
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
        
        // Get TrustedForm certificate URL if available
        try {
            if (typeof window.TrustedForm !== 'undefined') {
                const trustedFormCertUrl = await new Promise((resolve) => {
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
                
                if (trustedFormCertUrl) {
                    formData['trustedFormCertUrl'] = trustedFormCertUrl;
                }
            }
        } catch (error) {
            console.error('Error with TrustedForm:', error);
        }
        
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
            step.setAttribute('aria-hidden', 'true');
        });
        
        // Create calculation container if it doesn't exist
        let calculationContainer = document.getElementById('calculation-container');
        if (!calculationContainer) {
            calculationContainer = document.createElement('div');
            calculationContainer.id = 'calculation-container';
            calculationContainer.className = 'form-step calculation-container';
            calculationContainer.setAttribute('role', 'status');
            calculationContainer.setAttribute('aria-live', 'polite');
            form.appendChild(calculationContainer);
        }
        
        // Remove any existing success container to prevent stacking
        const existingSuccessContainer = document.getElementById('success-container');
        if (existingSuccessContainer) {
            existingSuccessContainer.remove();
        }
        
        // Set up the animation sequence
        let currentScreen = 0;
        const screens = [
            // Screen 1: Processing
            {
                content: `
                    <div class="calculation-animation">
                        <div class="calculation-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Processing progress">
                            <div class="calculation-bar"></div>
                        </div>
                        <h3 id="processing-status">Processing Your Information...</h3>
                        <p>Please wait while we review your claim details.</p>
                    </div>
                `,
                duration: 4000,
                ariaAnnouncement: "Processing your information. Please wait while we review your claim details.",
                onStart: () => {
                    // Animate the calculation bar
                    setTimeout(() => {
                        const calculationBar = calculationContainer.querySelector('.calculation-bar');
                        const progressBar = calculationContainer.querySelector('.calculation-progress');
                        if (calculationBar) {
                            calculationBar.style.width = '100%';
                            if (progressBar) {
                                progressBar.setAttribute('aria-valuenow', '100');
                            }
                        }
                    }, 300);
                }
            },
            // Screen 2: Information Received
            {
                content: `
                    <div class="calculation-complete">
                        <div class="success-icon" aria-hidden="true">✓</div>
                        <h3 id="info-received-status">Information Received</h3>
                        <p>Your claim details have been successfully submitted.</p>
                        <p class="calculation-message">Analyzing your eligibility...</p>
                    </div>
                `,
                duration: 4000,
                ariaAnnouncement: "Information received. Your claim details have been successfully submitted. Now analyzing your eligibility."
            },
            // Screen 3: Analysis Complete
            {
                content: `
                    <div class="calculation-complete">
                        <div class="success-icon" aria-hidden="true">✓</div>
                        <h3 id="analysis-complete-status">Claim Analysis Complete</h3>
                        <p>We've reviewed the information you provided.</p>
                        <p class="calculation-message">Determining your qualification status...</p>
                    </div>
                `,
                duration: 4000,
                ariaAnnouncement: "Claim analysis complete. We've reviewed the information you provided. Now determining your qualification status."
            },
            // Screen 4: Claim Approved
            {
                content: `
                    <div class="calculation-complete">
                        <div class="success-icon" style="animation: approved 2s forwards;" aria-hidden="true">✓</div>
                        <h3 id="claim-approved-status">Your Claim is Approved!</h3>
                        <p>Congratulations! Based on your information, you qualify for our settlement program.</p>
                        <p class="calculation-message">Preparing your next steps...</p>
                    </div>
                `,
                duration: 3000,
                ariaAnnouncement: "Your claim is approved! Congratulations! Based on your information, you qualify for our settlement program. Now preparing your next steps."
            },
            // Screen 5: Ready to Proceed
            {
                content: `
                    <div class="calculation-complete">
                        <div class="success-icon" style="background-color: #4CAF50;" aria-hidden="true">✓</div>
                        <h3 id="ready-to-proceed-status">Your Claim is Ready to Proceed</h3>
                        <p>To complete your settlement process, you need to speak with a claim specialist.</p>
                        <p class="calculation-message">Loading your contact options...</p>
                    </div>
                `,
                duration: 3000,
                ariaAnnouncement: "Your claim is ready to proceed. To complete your settlement process, you need to speak with a claim specialist. Loading your contact options."
            }
        ];
        
        // Function to show a specific screen
        function showScreen(index) {
            if (index >= screens.length) {
                // We've reached the end of the animation sequence
                // Fade out the calculation container
                calculationContainer.style.opacity = '0';
                calculationContainer.setAttribute('aria-hidden', 'true');
                
                // Announce transition to final step
                announceToScreenReader("Preparing final instructions for your approved claim.");
                
                // After fade out, hide calculation container and show success screen
                setTimeout(() => {
                    calculationContainer.style.display = 'none';
                    showSuccessWithCallCTA(phone);
                }, 500);
                return;
            }
            
            // Set the content for the current screen
            calculationContainer.innerHTML = screens[index].content;
            
            // Make sure the container is visible
            calculationContainer.style.display = 'block';
            calculationContainer.style.opacity = '1';
            calculationContainer.setAttribute('aria-hidden', 'false');
            
            // Announce the current screen to screen readers
            if (screens[index].ariaAnnouncement) {
                announceToScreenReader(screens[index].ariaAnnouncement);
            }
            
            // Scroll to the container
            calculationContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Run the onStart function if it exists
            if (screens[index].onStart) {
                screens[index].onStart();
            }
            
            // Schedule the next screen
            setTimeout(() => {
                // Fade out
                calculationContainer.style.opacity = '0';
                
                // After fade out, show the next screen
                setTimeout(() => {
                    showScreen(index + 1);
                }, 500);
            }, screens[index].duration);
        }
        
        // Start the animation sequence
        showScreen(0);
    }
    
    // Show success message with click-to-call CTA
    function showSuccessWithCallCTA(phone) {
        // Hide all steps
        steps.forEach(step => {
            step.style.display = 'none';
            step.setAttribute('aria-hidden', 'true');
        });
        
        // Remove any existing calculation container
        const existingCalculationContainer = document.getElementById('calculation-container');
        if (existingCalculationContainer) {
            existingCalculationContainer.remove();
        }
        
        // Create success message container if it doesn't exist
        let successContainer = document.getElementById('success-container');
        if (!successContainer) {
            successContainer = document.createElement('div');
            successContainer.id = 'success-container';
            successContainer.className = 'form-step success-message';
            successContainer.setAttribute('role', 'alert');
            successContainer.setAttribute('aria-live', 'assertive');
            form.appendChild(successContainer);
        } else {
            // Clear any existing content
            successContainer.innerHTML = '';
        }
        
        // Set initial opacity to 0 for fade-in effect
        successContainer.style.opacity = '0';
        successContainer.style.display = 'block';
        successContainer.setAttribute('aria-hidden', 'false');
        
        // Format phone number for better screen reader pronunciation
        const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        
        // Set success content with click-to-call button
        successContainer.innerHTML = `
            <div class="success-icon">
                <div class="success-circle">
                    <span class="checkmark">✓</span>
                </div>
            </div>
            <h2 id="success-heading">Your Claim is Approved!</h2>
            <p>Your claim has been successfully submitted and approved. To complete your settlement process, you must speak with a claim specialist.</p>
            <p class="call-instruction" id="call-instruction">Call now to finalize your settlement:</p>
            <a href="tel:+18339986932" class="phone-number" role="button" aria-labelledby="call-instruction">
                <span class="phone-icon">📱</span>(833) 998-6932
            </a>
            <p class="success-note" id="urgency-note">Our settlement specialists are standing by to begin processing your claim immediately. Don't delay - approved claims that aren't initiated within 24 hours may require resubmission.</p>
        `;
        
        // Fade in the success container
        setTimeout(() => {
            successContainer.style.opacity = '1';
        }, 100);
        
        // Ensure container is visible and scrolled into view
        successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Set focus to the call button for keyboard users
        setTimeout(() => {
            const callButton = successContainer.querySelector('.phone-number');
            if (callButton) {
                callButton.focus();
            }
        }, 600);
        
        // Announce success to screen readers
        announceToScreenReader("Your claim has been approved! To complete your settlement process, call (833) 998-6932 now to speak with a claim specialist.");
        
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
            
            // For checkboxes, also remove error class from parent
            if (this.type === 'checkbox') {
                this.parentElement.classList.remove('error');
            }
        });
    });
    
    // Debug click events
    function setupClickDebugger() {
        console.log('Setting up click debugger');
        
        // Create a debug overlay for mobile testing
        const debugOverlay = document.createElement('div');
        debugOverlay.style.position = 'fixed';
        debugOverlay.style.bottom = '10px';
        debugOverlay.style.right = '10px';
        debugOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        debugOverlay.style.color = 'white';
        debugOverlay.style.padding = '10px';
        debugOverlay.style.borderRadius = '5px';
        debugOverlay.style.zIndex = '9999';
        debugOverlay.style.fontSize = '12px';
        debugOverlay.style.maxWidth = '300px';
        debugOverlay.style.display = 'none';
        debugOverlay.id = 'debug-overlay';
        document.body.appendChild(debugOverlay);
        
        // Add a toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Debug';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '10px';
        toggleButton.style.right = '10px';
        toggleButton.style.zIndex = '10000';
        toggleButton.style.padding = '5px 10px';
        toggleButton.addEventListener('click', function() {
            const overlay = document.getElementById('debug-overlay');
            overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
        });
        document.body.appendChild(toggleButton);
        
        // Listen for all clicks on the document
        document.addEventListener('click', function(e) {
            const target = e.target;
            const overlay = document.getElementById('debug-overlay');
            
            // Log click information
            const clickInfo = `
                <strong>Click detected:</strong><br>
                Element: ${target.tagName}<br>
                Class: ${target.className}<br>
                ID: ${target.id}<br>
                Text: ${target.textContent ? target.textContent.substring(0, 30) : 'none'}<br>
                Position: ${e.clientX}, ${e.clientY}<br>
                Time: ${new Date().toLocaleTimeString()}
            `;
            
            console.log('Click detected:', {
                element: target.tagName,
                class: target.className,
                id: target.id,
                text: target.textContent ? target.textContent.substring(0, 30) : 'none',
                position: `${e.clientX}, ${e.clientY}`
            });
            
            overlay.innerHTML = clickInfo;
        }, true);
        
        // Add special debugging for option buttons
        document.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('touchstart', function(e) {
                console.log('Touchstart on button:', button.textContent.trim());
            });
            
            button.addEventListener('touchend', function(e) {
                console.log('Touchend on button:', button.textContent.trim());
            });
        });
    }
    
    // Initialize the debugger in development environments
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.search.includes('debug=true')) {
        setupClickDebugger();
    }
    
    // Submit early lead data to the backend
    async function submitEarlyLead(data) {
        try {
            // Create a copy of the data with just the essential fields
            const earlyLeadData = {
                lead_id: generateLeadId(data.early_first_name, '', data.early_email),
                first_name: data.early_first_name,
                email: data.early_email,
                lead_type: 'work_vehicle_accident_partial',
                source: 'commercial-mva',
                utm_source: data.utm_source,
                utm_medium: data.utm_medium,
                utm_campaign: data.utm_campaign,
                landing_page: data.landing_page,
                timestamp: new Date().toISOString(),
                user_agent: data.user_agent,
                vehicle_type: data[`step-1`] || '',
                is_work_vehicle: data[`step-1b`] || ''
            };
            
            // Log the early lead data (for development purposes)
            console.log('Submitting early lead data:', earlyLeadData);
            
            // In production, you would send this to your API
            // Example commented out to avoid actual API calls during development
            /*
            const response = await fetch('https://qqvw1jnwx3.execute-api.us-east-1.amazonaws.com/prod/early-leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'dHKgV9XLco5zYlq1EOft48ZcAEcJBMaO3MuZVLl9'
                },
                body: JSON.stringify(earlyLeadData)
            });
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('Early lead submission response:', responseData);
            */
            
        } catch (error) {
            console.error('Error submitting early lead data:', error);
            // Continue with the form regardless of the error
        }
    }
}); 