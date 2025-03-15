/**
 * FAQ Section Functionality
 * Handles the toggling of FAQ questions and answers with accessibility support
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all FAQ question elements
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Add click event listener to each question
    faqQuestions.forEach(question => {
        // Handle click events
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
        
        // Handle keyboard events for accessibility
        question.addEventListener('keydown', function(e) {
            // Toggle on Enter or Space key
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(this);
            }
        });
    });
    
    /**
     * Toggle FAQ item state and update ARIA attributes
     * @param {HTMLElement} questionElement - The FAQ question element
     */
    function toggleFAQ(questionElement) {
        // Get the parent faq-item
        const faqItem = questionElement.parentElement;
        
        // Get the answer element
        const answerId = questionElement.getAttribute('aria-controls');
        const answerElement = document.getElementById(answerId);
        
        // Check if this item is currently active
        const isExpanded = questionElement.getAttribute('aria-expanded') === 'true';
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                const itemQuestion = item.querySelector('.faq-question');
                const itemAnswerId = itemQuestion.getAttribute('aria-controls');
                const itemAnswer = document.getElementById(itemAnswerId);
                
                item.classList.remove('active');
                itemQuestion.setAttribute('aria-expanded', 'false');
                itemAnswer.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Toggle the current FAQ item
        faqItem.classList.toggle('active');
        
        // Update ARIA attributes
        if (isExpanded) {
            questionElement.setAttribute('aria-expanded', 'false');
            answerElement.setAttribute('aria-hidden', 'true');
        } else {
            questionElement.setAttribute('aria-expanded', 'true');
            answerElement.setAttribute('aria-hidden', 'false');
        }
        
        // Announce to screen readers (optional)
        const srAnnounce = document.getElementById('sr-announce');
        if (srAnnounce) {
            srAnnounce.textContent = isExpanded ? 'FAQ collapsed' : 'FAQ expanded';
        }
    }
}); 