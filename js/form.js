document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('claim-form');
    const steps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicators = document.getElementById('step-indicators');
    const heroCta = document.getElementById('hero-cta');
    const mobileCta = document.getElementById('mobile-cta');
    
    // Form data storage
    let formData = {};
    
    // Current step tracking
    let currentStep = 0;
    let totalSteps = 0;
    let visibleSteps = [];
    
    // Initialize the form
    function initForm() {
        // Create step indicators
        createStepIndicators();
        
        // Set up event listeners
        setupEventListeners();
        
        // Show first step
        showStep(0);
        
        // Update progress bar
        updateProgress();
    }
    
    // Create step indicators based on the number of steps
    function createStepIndicators() {
        // Get all potential steps (excluding conditional steps)
        const mainSteps = [
            document.getElementById('step-1'),
            document.getElementById('step-2'),
            document.getElementById('step-3'),
            document.getElementById('step-4'),
            document.getElementById('step-5'),
            document.getElementById('step-6'),
            document.getElementById('step-7')
        ];
        
        totalSteps = mainSteps.length;
        visibleSteps = mainSteps;
        
        // Create indicators
        for (let i = 0; i < totalSteps; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('step-indicator');
            if (i === 0) indicator.classList.add('active');
            stepIndicators.appendChild(indicator);
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Hero CTA button
        if (heroCta) {
            heroCta.addEventListener('click', function() {
                document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Mobile CTA button
        if (mobileCta) {
            mobileCta.addEventListener('click', function() {
                document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Option buttons
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const step = this.closest('.form-step');
                const stepId = step.id;
                const value = this.getAttribute('data-value');
                
                // Store the selected value
                formData[stepId] = value;
                
                // Highlight selected button
                step.querySelectorAll('.option-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Handle conditional logic
                handleConditionalLogic(stepId, value);
                
                // Move to next step after a short delay
                setTimeout(() => {
                    nextStep();
                }, 300);
            });
        });
        
        // Next buttons
        const nextButtons = document.querySelectorAll('.next-button');
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const step = this.closest('.form-step');
                const inputs = step.querySelectorAll('input[required]');
                let isValid = true;
                
                // Validate required inputs
                inputs.forEach(input => {
                    if (!input.value) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                        // Store input value
                        formData[input.id] = input.value;
                    }
                });
                
                if (isValid) {
                    // Handle date validation for step-3
                    if (step.id === 'step-3') {
                        const dateInput = document.getElementById('accident-date');
                        const selectedDate = new Date(dateInput.value);
                        const twoYearsAgo = new Date();
                        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
                        
                        if (selectedDate < twoYearsAgo) {
                            // Disqualify if accident is older than 2 years
                            showDisqualification();
                            return;
                        }
                    }
                    
                    nextStep();
                }
            });
        });
        
        // Restart button
        const restartButton = document.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', function() {
                resetForm();
            });
        }
        
        // Form submission
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Collect final form data
                const finalInputs = document.querySelectorAll('#step-7 input');
                finalInputs.forEach(input => {
                    formData[input.id] = input.value;
                });
                
                // Submit the form data
                submitForm();
            });
        }
        
        // FAQ toggles
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const faqItem = this.parentElement;
                faqItem.classList.toggle('active');
            });
        });
    }
    
    // Show a specific step
    function showStep(stepIndex) {
        // Hide all steps
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Show the current step
        if (visibleSteps[stepIndex]) {
            visibleSteps[stepIndex].classList.add('active');
            currentStep = stepIndex;
            
            // Update step indicators
            updateStepIndicators();
            
            // Update progress bar
            updateProgress();
        }
    }
    
    // Move to the next step
    function nextStep() {
        if (currentStep < visibleSteps.length - 1) {
            showStep(currentStep + 1);
        }
    }
    
    // Update progress bar
    function updateProgress() {
        const progress = ((currentStep + 1) / visibleSteps.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Update step indicators
    function updateStepIndicators() {
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            if (index <= currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Handle conditional logic based on user responses
    function handleConditionalLogic(stepId, value) {
        switch (stepId) {
            case 'step-2': // Who was at fault?
                if (value === 'me') {
                    // Disqualify if user was at fault
                    showDisqualification();
                }
                break;
                
            case 'step-4': // Commercial vehicle involved?
                if (value === 'no') {
                    // Ask if another driver was involved
                    insertConditionalStep('step-4b', 4);
                }
                break;
                
            case 'step-4b': // Another driver involved?
                if (value === 'no') {
                    // Disqualify if no commercial vehicle and no other driver
                    showDisqualification();
                }
                break;
                
            case 'step-5': // Medical attention within 7 days?
                if (value === 'no') {
                    // Ask if medical attention within 14 days
                    insertConditionalStep('step-5b', 5);
                }
                break;
                
            case 'step-5b': // Medical attention within 14 days?
                if (value === 'no') {
                    // Disqualify if no medical attention within 14 days
                    showDisqualification();
                }
                break;
                
            case 'step-6': // Police report filed?
                if (value === 'yes') {
                    // Ask if they have a copy of the report
                    insertConditionalStep('step-6b', 6);
                }
                break;
        }
    }
    
    // Insert a conditional step
    function insertConditionalStep(stepId, afterIndex) {
        const conditionalStep = document.getElementById(stepId);
        if (conditionalStep) {
            // Update visible steps array
            visibleSteps.splice(afterIndex + 1, 0, conditionalStep);
            
            // Update total steps
            totalSteps = visibleSteps.length;
            
            // Show the conditional step next
            currentStep = afterIndex;
            nextStep();
        }
    }
    
    // Show disqualification message
    function showDisqualification() {
        // Hide all steps
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        // Show disqualification message
        const disqualification = document.getElementById('disqualification');
        if (disqualification) {
            disqualification.classList.add('active');
        }
        
        // Reset progress
        progressBar.style.width = '0%';
        
        // Reset step indicators
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
    }
    
    // Reset the form
    function resetForm() {
        // Clear form data
        formData = {};
        
        // Reset visible steps
        visibleSteps = [
            document.getElementById('step-1'),
            document.getElementById('step-2'),
            document.getElementById('step-3'),
            document.getElementById('step-4'),
            document.getElementById('step-5'),
            document.getElementById('step-6'),
            document.getElementById('step-7')
        ];
        
        // Reset total steps
        totalSteps = visibleSteps.length;
        
        // Show first step
        showStep(0);
        
        // Clear selected options
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.classList.remove('selected');
        });
        
        // Clear inputs
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
    }
    
    // Submit the form
    function submitForm() {
        // Here you would typically send the data to your server
        console.log('Form data submitted:', formData);
        
        // For demo purposes, redirect to thank you page
        window.location.href = 'thank-you.html';
    }
    
    // Initialize the form
    initForm();
}); 