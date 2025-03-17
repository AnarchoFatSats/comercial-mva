/**
 * Dynamic JSON Schema for Lead Data
 * This file defines the standard structure for all lead data across different websites
 */

// Standard lead data schema - common across all websites
const leadSchema = {
    // Core identification fields
    leadId: '', // Unique identifier for the lead
    sourceSite: '', // Website where lead was generated
    timestamp: '', // ISO timestamp of submission
    
    // Categorization tags
    funnelType: '', // Type of funnel (e.g., MassTort, MVA, WorkInjury)
    leadType: '', // Type of lead (e.g., ProductLiability, CommercialAccident)
    adCategory: '', // Category of ad that generated the lead
    campaignId: '', // Identifier for the specific ad campaign
    
    // Contact information
    contactInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zipCode: '',
        state: '',
        bestTimeToCall: '',
    },
    
    // Qualification status
    qualified: false,
    disqualificationReason: '',
    
    // Tracking information
    tracking: {
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmTerm: '',
        utmContent: '',
        landingPage: '',
        userAgent: '',
        ipAddress: '',
        referrer: '',
    },
    
    // TrustedForm certification
    trustedFormCertUrl: '',
    
    // Dynamic form data - specific to each website/form
    formData: {
        // This will contain all form-specific fields
        // Structure will vary by form/website
    },
    
    // AWS metadata
    awsMeta: {
        ttl: 0, // Time-to-live for DynamoDB
        s3Path: '', // Path in S3 bucket
        connectContactId: '', // AWS Connect contact ID if available
    }
};

/**
 * Function to create a lead data object for a specific website
 * @param {string} siteId - Identifier for the website
 * @param {string} funnelType - Type of funnel
 * @param {string} leadType - Type of lead
 * @param {string} adCategory - Category of ad
 * @returns {Object} - Initialized lead data object
 */
function createLeadData(siteId, funnelType, leadType, adCategory) {
    const leadData = JSON.parse(JSON.stringify(leadSchema)); // Deep clone the schema
    
    // Set basic identification
    leadData.leadId = generateLeadId();
    leadData.sourceSite = siteId;
    leadData.timestamp = new Date().toISOString();
    
    // Set categorization tags
    leadData.funnelType = funnelType;
    leadData.leadType = leadType;
    leadData.adCategory = adCategory;
    
    // Set tracking parameters from URL
    leadData.tracking.utmSource = getUrlParameter('utm_source') || 'direct';
    leadData.tracking.utmMedium = getUrlParameter('utm_medium') || '';
    leadData.tracking.utmCampaign = getUrlParameter('utm_campaign') || '';
    leadData.tracking.utmTerm = getUrlParameter('utm_term') || '';
    leadData.tracking.utmContent = getUrlParameter('utm_content') || '';
    leadData.tracking.landingPage = window.location.href;
    leadData.tracking.userAgent = navigator.userAgent;
    leadData.tracking.referrer = document.referrer;
    
    return leadData;
}

/**
 * Generate a unique ID for a lead
 * @returns {string} - UUID for the lead
 */
function generateLeadId() {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Get parameter value from URL
 * @param {string} name - Parameter name
 * @returns {string} - Parameter value
 */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
} 