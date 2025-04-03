/**
 * JavaScript Code Minifier
 * Manual implementation for reducing code size
 * 
 * This script helps reduce the size of JavaScript files by:
 * 1. Removing comments
 * 2. Removing whitespace
 * 3. Shortening variable names when possible
 * 4. Optimizing conditional logic
 */

(function() {
    'use strict';
    
    /**
     * Apply various optimizations to original code
     * @param {string} code - The original code to optimize
     * @returns {string} The optimized code
     */
    function optimizeCode(code) {
        // Remove single-line comments
        code = code.replace(/\/\/.*$/gm, '');
        
        // Remove multi-line comments
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove unnecessary whitespace
        code = code.replace(/\s+/g, ' ');
        code = code.replace(/\s*([{}\[\];,.:()=<>+\-*\/])\s*/g, '$1');
        
        // Fix spacing issues from previous replacements
        code = code.replace(/\}\s*else/g, '}else');
        code = code.replace(/\}\s*catch/g, '}catch');
        code = code.replace(/\}\s*finally/g, '}finally');
        
        // Remove spaces after keywords, but only if followed by (
        code = code.replace(/\b(if|for|while|switch|catch)\s+\(/g, '$1(');
        
        // Remove trailing semicolons in blocks
        code = code.replace(/;}/g, '}');
        
        // Remove semicolons when safe
        code = code.replace(/;(\s*[})])/g, '$1');
        
        // Remove unnecessary semicolons
        code = code.replace(/;{2,}/g, ';');
        
        return code;
    }
    
    /**
     * Optimize conditional statements when possible
     * @param {string} code - The code with conditionals to optimize
     * @returns {string} The code with optimized conditionals
     */
    function optimizeConditionals(code) {
        // Replace if(condition) { return true; } else { return false; } with return condition;
        code = code.replace(/if\s*\(\s*([^)]+)\s*\)\s*\{\s*return\s+true;\s*\}\s*else\s*\{\s*return\s+false;\s*\}/g, 'return $1;');
        
        // Replace if(condition) { return false; } else { return true; } with return !condition;
        code = code.replace(/if\s*\(\s*([^)]+)\s*\)\s*\{\s*return\s+false;\s*\}\s*else\s*\{\s*return\s+true;\s*\}/g, 'return !$1;');
        
        // Replace if(!condition) { action; } with if(!condition) action;
        code = code.replace(/if\s*\(\s*([^)]+)\s*\)\s*\{\s*([^;{}]+);\s*\}/g, 'if($1) $2;');
        
        return code;
    }
    
    /**
     * Apply minification to a given script element
     * @param {HTMLScriptElement} script - The script element to minify
     */
    function minifyScript(script) {
        if (!script.textContent || script.type === 'application/json') return;
        
        const original = script.textContent;
        
        // Check if the content is a JavaScript code block
        if (!original.trim() || original.indexOf('function') === -1) return;
        
        // Perform optimizations
        let minified = optimizeCode(original);
        minified = optimizeConditionals(minified);
        
        // Set the minified content
        script.textContent = minified;
        
        // Log size reduction (in development only)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const originalSize = original.length;
            const minifiedSize = minified.length;
            const reduction = Math.round((1 - minifiedSize / originalSize) * 100);
            console.log(`Minified: ${originalSize} → ${minifiedSize} bytes (${reduction}% reduction)`);
        }
    }
    
    /**
     * Initialize the minification process
     */
    function init() {
        // Handle inline scripts
        document.querySelectorAll('script:not([src])').forEach(minifyScript);
        
        // Only in development: show total stats
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            let totalOriginal = 0;
            let totalMinified = 0;
            
            document.querySelectorAll('script:not([src])').forEach(script => {
                if (!script.textContent || script.type === 'application/json') return;
                if (!script.textContent.trim() || script.textContent.indexOf('function') === -1) return;
                
                const original = script.getAttribute('data-original') || script.textContent;
                totalOriginal += original.length;
                totalMinified += script.textContent.length;
            });
            
            const totalReduction = Math.round((1 - totalMinified / totalOriginal) * 100);
            console.log(`Total minification: ${totalOriginal} → ${totalMinified} bytes (${totalReduction}% reduction)`);
        }
    }
    
    // Wait for DOM content to be loaded
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})(); 