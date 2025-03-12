/**
 * Lazy loading implementation for images
 * This improves page load performance by only loading images when they're about to enter the viewport
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all images with data-src attribute (images to be lazy loaded)
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Set up the intersection observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the image is in view
            if (entry.isIntersecting) {
                const img = entry.target;
                // Replace the src with the data-src
                img.src = img.dataset.src;
                
                // If there's a data-srcset, set that too
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                
                // Remove the data attributes
                img.removeAttribute('data-src');
                img.removeAttribute('data-srcset');
                
                // Stop observing the image
                observer.unobserve(img);
            }
        });
    });
    
    // Observe each image
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}); 