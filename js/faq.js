/**
 * FAQ Section Functionality
 * Handles the toggling of FAQ questions and answers
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all FAQ question elements
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Add click event listener to each question
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Toggle the 'active' class on the parent faq-item
            const faqItem = this.parentElement;
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle the current FAQ item
            faqItem.classList.toggle('active');
        });
    });
}); 