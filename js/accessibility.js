/**
 * Accessibility helper functions
 * Provides utilities for focus management, ARIA updates, and keyboard navigation
 */

(function() {
    'use strict';

    // Save reference to the element that had focus before a dialog was opened
    let lastFocusedElement;

    /**
     * Trap focus inside a specified container
     * @param {HTMLElement} container - The element to trap focus within
     */
    function trapFocus(container) {
        // Find all focusable elements
        const focusableElements = container.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Set focus on first element
        firstElement.focus();
        
        container.addEventListener('keydown', function(e) {
            // If Tab key is pressed
            if (e.key === 'Tab') {
                // If shift key is also pressed
                if (e.shiftKey) {
                    // If focus is on first element, move to last element
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // If focus is on last element, move to first element
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
            
            // If Escape key is pressed, close dialog
            if (e.key === 'Escape') {
                closeDialog(container);
            }
        });
    }
    
    /**
     * Show a dialog and manage focus
     * @param {HTMLElement} dialog - The dialog element to show
     */
    function showDialog(dialog) {
        // Save current focus
        lastFocusedElement = document.activeElement;
        
        // Show dialog
        dialog.removeAttribute('aria-hidden');
        dialog.setAttribute('aria-modal', 'true');
        
        // Trap focus inside dialog
        trapFocus(dialog);
        
        // Announce dialog to screen readers
        const announcer = document.getElementById('sr-announce');
        if (announcer) {
            announcer.textContent = 'Dialog opened. Press Escape to close.';
        }
    }
    
    /**
     * Close a dialog and restore focus
     * @param {HTMLElement} dialog - The dialog element to close
     */
    function closeDialog(dialog) {
        // Hide dialog
        dialog.setAttribute('aria-hidden', 'true');
        dialog.removeAttribute('aria-modal');
        
        // Restore focus
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
        
        // Announce dialog closure to screen readers
        const announcer = document.getElementById('sr-announce');
        if (announcer) {
            announcer.textContent = 'Dialog closed.';
        }
    }
    
    /**
     * Set up keyboard navigation for tab panels
     * @param {string} tabListSelector - Selector for the tab list container
     * @param {string} tabSelector - Selector for individual tabs
     * @param {string} panelSelector - Selector for tab panels
     */
    function setupTabKeyboardNavigation(tabListSelector, tabSelector, panelSelector) {
        const tabList = document.querySelector(tabListSelector);
        if (!tabList) return;
        
        const tabs = tabList.querySelectorAll(tabSelector);
        
        tabList.addEventListener('keydown', function(e) {
            // Get the index of the current tab
            const currentTab = document.activeElement;
            const currentIndex = Array.from(tabs).indexOf(currentTab);
            
            if (currentIndex < 0) return;
            
            let newIndex;
            
            switch (e.key) {
                case 'ArrowLeft':
                    newIndex = currentIndex - 1;
                    if (newIndex < 0) newIndex = tabs.length - 1;
                    break;
                case 'ArrowRight':
                    newIndex = currentIndex + 1;
                    if (newIndex >= tabs.length) newIndex = 0;
                    break;
                case 'Home':
                    newIndex = 0;
                    break;
                case 'End':
                    newIndex = tabs.length - 1;
                    break;
                default:
                    return;
            }
            
            e.preventDefault();
            tabs[newIndex].focus();
            tabs[newIndex].click();
        });
    }
    
    /**
     * Set up focus management for form steps
     * @param {HTMLElement} form - The form element
     * @param {string} stepSelector - Selector for form steps
     * @param {string} buttonSelector - Selector for next buttons
     */
    function setupFormStepFocus(form, stepSelector, buttonSelector) {
        if (!form) return;
        
        // When showing a new step, focus the first focusable element
        function focusFirstElement(step) {
            const focusableElements = step.querySelectorAll(
                'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                setTimeout(() => {
                    focusableElements[0].focus();
                }, 100);
            }
        }
        
        // Next button click handler
        const nextButtons = form.querySelectorAll(buttonSelector);
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Find the next visible step
                const currentStep = this.closest(stepSelector);
                const steps = Array.from(form.querySelectorAll(stepSelector));
                const currentIndex = steps.indexOf(currentStep);
                
                // Focus first element in next step when it becomes visible
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && 
                            mutation.attributeName === 'aria-hidden' && 
                            mutation.target.getAttribute('aria-hidden') === 'false') {
                            focusFirstElement(mutation.target);
                            observer.disconnect();
                        }
                    });
                });
                
                if (currentIndex < steps.length - 1) {
                    observer.observe(steps[currentIndex + 1], { 
                        attributes: true,
                        attributeFilter: ['aria-hidden'] 
                    });
                }
            });
        });
    }
    
    // Export utility functions to global scope
    window.a11yHelper = {
        trapFocus: trapFocus,
        showDialog: showDialog,
        closeDialog: closeDialog,
        setupTabKeyboardNavigation: setupTabKeyboardNavigation,
        setupFormStepFocus: setupFormStepFocus
    };
})(); 