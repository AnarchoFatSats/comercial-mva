/**
 * FAQ Accordion with Accessibility Improvements
 * Handles show/hide functionality and keyboard interactions for the FAQ section
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        const faqButtons = document.querySelectorAll('.faq-question');
        
        if (!faqButtons.length) return;
        
        faqButtons.forEach(button => {
            // Set up click handler
            button.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                const answerId = this.getAttribute('aria-controls');
                const answerEl = document.getElementById(answerId);
                
                if (!answerEl) return;
                
                // Toggle expanded state
                this.setAttribute('aria-expanded', !isExpanded);
                
                // Toggle visibility
                if (isExpanded) {
                    answerEl.hidden = true;
                } else {
                    answerEl.hidden = false;
                    
                    // Announce to screen readers
                    const announcer = document.getElementById('sr-announce');
                    if (announcer) {
                        announcer.textContent = 'FAQ answer expanded.';
                    }
                }
            });
            
            // Add keyboard support
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Space' || e.key === 'Enter') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
        
        // Setup keyboard navigation between questions
        const faqSection = document.querySelector('.faq-section');
        if (faqSection) {
            faqSection.addEventListener('keydown', function(e) {
                if (e.target.classList.contains('faq-question')) {
                    const currentButton = e.target;
                    const allButtons = Array.from(faqButtons);
                    const currentIndex = allButtons.indexOf(currentButton);
                    
                    let nextButton;
                    
                    switch (e.key) {
                        case 'ArrowDown':
                            // Move to next question
                            nextButton = allButtons[currentIndex + 1] || allButtons[0];
                            e.preventDefault();
                            nextButton.focus();
                            break;
                            
                        case 'ArrowUp':
                            // Move to previous question
                            nextButton = allButtons[currentIndex - 1] || allButtons[allButtons.length - 1];
                            e.preventDefault();
                            nextButton.focus();
                            break;
                            
                        case 'Home':
                            // Move to first question
                            e.preventDefault();
                            allButtons[0].focus();
                            break;
                            
                        case 'End':
                            // Move to last question
                            e.preventDefault();
                            allButtons[allButtons.length - 1].focus();
                            break;
                    }
                }
            });
        }
    });
})(); 