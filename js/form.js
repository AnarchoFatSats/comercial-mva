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
    let formData = {};
    
    // Initialize the form
    initForm();
    
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
        const progress = (stepIndex / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Update step indicators
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            if (index <= stepIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // Update current step
        currentStep = stepIndex;
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
        
        // Store the selection
        const stepId = stepElement.id;
        const value = button.getAttribute('data-value');
        formData[stepId] = value;
        
        // Process conditional logic
        setTimeout(() => {
            processConditionalLogic(stepId, value);
        }, 300);
    }
    
    // Process conditional logic based on user selection
    function processConditionalLogic(stepId, value) {
        switch (stepId) {
            case 'step-1':
                if (value === 'personal') {
                    // If personal vehicle, ask if other vehicle was a work vehicle
                    showStep(1); // Show step-1b
                } else {
                    // Otherwise, proceed to step 2
                    showStep(2);
                }
                break;
                
            case 'step-1b':
                if (value === 'no') {
                    // If other vehicle was not a work vehicle, disqualify
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
                    // If other driver was not in work vehicle, disqualify
                    showDisqualification();
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
    }
    
    // Restart the form
    function restartForm() {
        // Clear form data
        formData = {};
        
        // Reset all selected buttons
        document.querySelectorAll('.option-button').forEach(button => {
            button.classList.remove('selected');
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
        const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;
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
        formData['first-name'] = firstName;
        formData['last-name'] = lastName;
        formData['phone'] = phone;
        formData['email'] = email;
        
        // Submit the form data
        console.log('Form data submitted:', formData);
        
        // Here you would typically send the data to your server
        // For now, we'll just show a success message
        alert('Thank you! Your case information has been submitted. We will contact you shortly.');
        
        // Reset the form
        restartForm();
    }
    
    // Remove error class when input changes
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
}); 