/**
 * Image Optimization and Lazy Loading
 * Handles lazy loading, responsive images, and format switching
 */

(function() {
    'use strict';
    
    // Check for IntersectionObserver support
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // If it's a responsive image with srcset
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    
                    // Load the image src
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        
                        // Remove placeholder background once loaded
                        img.addEventListener('load', () => {
                            img.style.backgroundColor = 'transparent';
                            img.classList.add('loaded');
                        });
                    }
                    
                    // Stop observing the image
                    observer.unobserve(img);
                }
            });
        }, {
            // Start loading images when they're 10% visible
            threshold: 0.1,
            // Start loading images when they're 200px from viewport
            rootMargin: '0px 0px 200px 0px'
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        // Simple scroll-based lazy loading
        function lazyLoad() {
            lazyImages.forEach(img => {
                if (isInViewport(img)) {
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                }
            });
        }
        
        // Helper to check if element is in viewport
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 200 &&
                rect.bottom >= 0
            );
        }
        
        // Load images on scroll
        window.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
        window.addEventListener('orientationchange', lazyLoad);
        
        // Initial load
        lazyLoad();
    }
    
    // Optimize image formats if supported
    function checkWebpSupport() {
        const webpImg = new Image();
        webpImg.onload = function() {
            // WebP is supported, swap image formats where possible
            const images = document.querySelectorAll('img[data-webp]');
            images.forEach(img => {
                img.src = img.getAttribute('data-webp');
            });
        };
        webpImg.onerror = function() {
            // WebP not supported, use original formats
            console.log('WebP not supported');
        };
        webpImg.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    }
    
    // Check for WebP support
    checkWebpSupport();
    
    // Add loading="lazy" attribute to images that don't have it
    document.addEventListener('DOMContentLoaded', function() {
        // Skip images that are critical for LCP
        const criticalImages = document.querySelectorAll('img[fetchpriority="high"]');
        const criticalImageSrcs = Array.from(criticalImages).map(img => img.src);
        
        document.querySelectorAll('img').forEach(img => {
            // Don't modify critical images
            if (criticalImageSrcs.includes(img.src)) return;
            
            // Add lazy loading if not already present
            if (!img.hasAttribute('loading') && !img.hasAttribute('fetchpriority')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Add decoding async for better rendering performance
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
        });
    });
})(); 