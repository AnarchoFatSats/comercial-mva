document.addEventListener('DOMContentLoaded', function() {
    // Track form step progression
    function trackFormStep(stepNumber) {
        if (typeof gtag === 'function') {
            gtag('event', 'form_step', {
                'event_category': 'Form',
                'event_label': 'Step ' + stepNumber,
                'value': stepNumber
            });
        }
        
        if (typeof fbq === 'function') {
            fbq('trackCustom', 'FormStep', {
                step: stepNumber
            });
        }
    }
    
    // Track form submission
    function trackFormSubmission() {
        if (typeof gtag === 'function') {
            gtag('event', 'form_submission', {
                'event_category': 'Form',
                'event_label': 'Lead Submission'
            });
        }
        
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
        }
    }
    
    // Track disqualification
    function trackDisqualification(reason) {
        if (typeof gtag === 'function') {
            gtag('event', 'disqualification', {
                'event_category': 'Form',
                'event_label': reason
            });
        }
        
        if (typeof fbq === 'function') {
            fbq('trackCustom', 'Disqualification', {
                reason: reason
            });
        }
    }
    
    // Track CTA clicks
    function trackCtaClick(ctaId) {
        if (typeof gtag === 'function') {
            gtag('event', 'cta_click', {
                'event_category': 'Engagement',
                'event_label': ctaId
            });
        }
        
        if (typeof fbq === 'function') {
            fbq('trackCustom', 'CTAClick', {
                cta: ctaId
            });
        }
    }
    
    // Set up event listeners for tracking
    function setupTrackingEvents() {
        // Track hero CTA click
        const heroCta = document.getElementById('hero-cta');
        if (heroCta) {
            heroCta.addEventListener('click', function() {
                trackCtaClick('hero-cta');
            });
        }
        
        // Track mobile CTA click
        const mobileCta = document.getElementById('mobile-cta');
        if (mobileCta) {
            mobileCta.addEventListener('click', function() {
                trackCtaClick('mobile-cta');
            });
        }
        
        // Track form steps
        const form = document.getElementById('claim-form');
        if (form) {
            // Track when steps become visible
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class') {
                        const step = mutation.target;
                        if (step.classList.contains('active') && step.id.includes('step-')) {
                            const stepNumber = step.id.split('-')[1];
                            trackFormStep(stepNumber);
                        }
                    }
                });
            });
            
            const steps = document.querySelectorAll('.form-step');
            steps.forEach(function(step) {
                observer.observe(step, { attributes: true });
            });
            
            // Track form submission
            form.addEventListener('submit', function(e) {
                trackFormSubmission();
            });
        }
        
        // Track disqualification
        const disqualification = document.getElementById('disqualification');
        if (disqualification) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class' && 
                        disqualification.classList.contains('active')) {
                        // Try to determine the reason for disqualification
                        let reason = 'Unknown';
                        if (window.formData) {
                            if (window.formData['step-2'] === 'me') {
                                reason = 'User at fault';
                            } else if (window.formData['step-4'] === 'no' && 
                                      window.formData['step-4b'] === 'no') {
                                reason = 'No commercial vehicle or other driver';
                            } else if (window.formData['step-5'] === 'no' && 
                                      window.formData['step-5b'] === 'no') {
                                reason = 'No medical attention within 14 days';
                            } else if (window.formData['accident-date']) {
                                const selectedDate = new Date(window.formData['accident-date']);
                                const twoYearsAgo = new Date();
                                twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
                                
                                if (selectedDate < twoYearsAgo) {
                                    reason = 'Accident older than 2 years';
                                }
                            }
                        }
                        
                        trackDisqualification(reason);
                    }
                });
            });
            
            observer.observe(disqualification, { attributes: true });
        }
    }
    
    // Initialize tracking
    setupTrackingEvents();
}); 