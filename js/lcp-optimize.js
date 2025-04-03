/**
 * LCP Optimization
 * Focuses on reducing Largest Contentful Paint time by prioritizing critical rendering
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    // The main LCP element selector
    lcpSelector: '.hero h1',
    // Any blocking resources to avoid
    blockingSelectors: '.non-critical-css, .non-critical-script',
    // Whether to apply hardware acceleration 
    useHardwareAcceleration: true,
    // Debug mode
    debug: false
  };

  // Log only in debug mode
  function log(message, data) {
    if (config.debug && console) {
      console.log(`[LCP Optimizer] ${message}`, data || '');
    }
  }

  // Force-optimize the LCP element to render as fast as possible
  function optimizeLCPElement() {
    const lcpElement = document.querySelector(config.lcpSelector);
    
    if (!lcpElement) {
      log('LCP element not found');
      return;
    }
    
    log('Optimizing LCP element', lcpElement);
    
    // Set initial visible state
    lcpElement.style.opacity = '1';
    
    // Add hardware acceleration hint if enabled
    if (config.useHardwareAcceleration) {
      lcpElement.style.transform = 'translateZ(0)';
      lcpElement.style.willChange = 'contents';
    }
    
    // Force layout calculation
    void lcpElement.getBoundingClientRect();
    
    // Log timing
    const perfEntries = performance.getEntriesByType('paint');
    const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      log('FCP timing:', fcpEntry.startTime);
    }
  }
  
  // Automatically run optimization at the most appropriate time
  function init() {
    // If document is still loading, attach to DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeLCPElement);
    } else {
      // Run immediately if DOM is already parsed
      optimizeLCPElement();
    }
    
    // Also run when everything is fully loaded (as a fallback)
    window.addEventListener('load', function() {
      setTimeout(optimizeLCPElement, 0);
    });
    
    // Delay non-critical elements loading
    if (config.blockingSelectors) {
      const nonCriticalResources = document.querySelectorAll(config.blockingSelectors);
      
      nonCriticalResources.forEach(resource => {
        // Delay loading non-critical resources
        if (resource.tagName === 'LINK' && resource.rel === 'stylesheet') {
          resource.media = 'print';
          resource.onload = () => {
            resource.media = 'all';
          };
        } else if (resource.tagName === 'SCRIPT') {
          resource.setAttribute('defer', '');
          resource.setAttribute('async', '');
        }
      });
    }
  }
  
  // Run at the earliest possible moment
  init();
})(); 