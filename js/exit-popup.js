/**
 * Exit Intent Popup Implementation
 * Shows a popup when the user is about to leave the page
 */
document.addEventListener('DOMContentLoaded', function() {
    const exitPopup = document.getElementById('exit-popup');
    const exitPopupClose = document.getElementById('exit-popup-close');
    const exitPopupCta = document.getElementById('exit-popup-cta');
    
    let showOnce = false;
    let mouseLeft = false;
    
    // Show popup when mouse leaves the window (towards the top)
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY < 50 && !showOnce) {
            exitPopup.classList.add('show');
            showOnce = true;
            mouseLeft = true;
        }
    });
    
    // Close popup when clicking the close button
    exitPopupClose.addEventListener('click', function() {
        exitPopup.classList.remove('show');
    });
    
    // Scroll to form when clicking the CTA button
    exitPopupCta.addEventListener('click', function() {
        exitPopup.classList.remove('show');
        document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Show popup after 60 seconds if user hasn't triggered it yet
    setTimeout(function() {
        if (!mouseLeft && !showOnce) {
            exitPopup.classList.add('show');
            showOnce = true;
        }
    }, 60000);
    
    // Close popup when clicking outside the content
    exitPopup.addEventListener('click', function(e) {
        if (e.target === exitPopup) {
            exitPopup.classList.remove('show');
        }
    });
}); 