/**
 * Advanced Image Optimization Script
 * Implements best practices for image loading, format selection, and optimization
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        // Viewport sizes for responsive images
        breakpoints: {
            small: 640,
            medium: 1024,
            large: 1440
        },
        // Format support detection
        formats: {
            webp: false,
            avif: false
        }
    };
    
    // Detect modern image format support
    function detectImageFormatSupport() {
        // Check WebP support
        const webpImage = new Image();
        webpImage.onload = function() {
            config.formats.webp = true;
            applyOptimalFormats();
        };
        webpImage.onerror = function() {
            config.formats.webp = false;
        };
        webpImage.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
        
        // Check AVIF support
        const avifImage = new Image();
        avifImage.onload = function() {
            config.formats.avif = true;
            applyOptimalFormats();
        };
        avifImage.onerror = function() {
            config.formats.avif = false;
        };
        avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK';
    }
    
    // Apply best format based on browser support
    function applyOptimalFormats() {
        document.querySelectorAll('img[data-formats]').forEach(img => {
            const formats = JSON.parse(img.dataset.formats);
            
            // Choose best available format
            if (config.formats.avif && formats.avif) {
                img.src = formats.avif;
            } else if (config.formats.webp && formats.webp) {
                img.src = formats.webp;
            } else if (formats.png) {
                img.src = formats.png;
            } else if (formats.jpg) {
                img.src = formats.jpg;
            }
        });
    }
    
    // Setup lazy loading with IntersectionObserver
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        processImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '0px 0px 200px 0px', // Start loading 200px before image enters viewport
                threshold: 0.01 // Trigger when 1% of the image is visible
            });
            
            // Observe all lazily loaded images
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[loading="lazy"]').forEach(processImage);
        }
    }
    
    // Process an individual image for optimization
    function processImage(img) {
        // Handle srcset
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
        }
        
        // Handle responsive sources
        if (img.dataset.formats) {
            const formats = JSON.parse(img.dataset.formats);
            
            // Choose best available format
            if (config.formats.avif && formats.avif) {
                img.src = formats.avif;
            } else if (config.formats.webp && formats.webp) {
                img.src = formats.webp;
            } else if (formats.png) {
                img.src = formats.png;
            } else if (formats.jpg) {
                img.src = formats.jpg;
            }
        } else if (img.dataset.src) {
            img.src = img.dataset.src;
        }
        
        // Set proper width and height to prevent layout shifts
        if (img.dataset.width && img.dataset.height) {
            img.width = img.dataset.width;
            img.height = img.dataset.height;
        }
        
        // Add load event handler for animation
        img.addEventListener('load', () => {
            img.classList.add('loaded');
            img.style.backgroundColor = 'transparent';
        });
    }
    
    // Set up responsive images with proper attributes
    function setupResponsiveImages() {
        document.querySelectorAll('img[data-responsive="true"]').forEach(img => {
            if (!img.dataset.sources) return;
            
            try {
                const sources = JSON.parse(img.dataset.sources);
                let srcsetValues = [];
                
                // Create srcset attribute
                for (const breakpoint in sources) {
                    if (sources.hasOwnProperty(breakpoint)) {
                        srcsetValues.push(`${sources[breakpoint]} ${config.breakpoints[breakpoint]}w`);
                    }
                }
                
                if (srcsetValues.length > 0) {
                    img.srcset = srcsetValues.join(', ');
                    
                    // Add sizes attribute if not present
                    if (!img.sizes) {
                        img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
                    }
                }
            } catch (e) {
                console.error('Error parsing responsive image sources:', e);
            }
        });
    }
    
    // Initialize image optimization
    function init() {
        detectImageFormatSupport();
        setupLazyLoading();
        setupResponsiveImages();
        
        // Add event listeners for lazy loading on SPA navigation
        if ('pushState' in window.history) {
            window.addEventListener('popstate', setupLazyLoading);
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export public API
    window.ImageOptimizer = {
        refresh: setupLazyLoading,
        detectFormats: detectImageFormatSupport
    };
})(); 