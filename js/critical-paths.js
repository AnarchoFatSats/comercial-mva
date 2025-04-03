/**
 * Critical Paths Management
 * Handles loading of non-critical resources in the optimal order
 */

// Priority levels for resource loading
const PRIORITY = {
  CRITICAL: 1,  // Load immediately
  HIGH: 2,      // Load after first paint
  MEDIUM: 3,    // Load after first contentful paint
  LOW: 4,       // Load after page is interactive
  IDLE: 5       // Load during browser idle time
};

// List of resources to load, in order of priority
const resources = [
  // Critical resources - already loaded inline
  
  // High priority - load after first paint
  {
    type: 'script',
    src: 'js/accessibility.js',
    priority: PRIORITY.HIGH,
    attributes: { defer: true }
  },
  
  // Medium priority - load after first contentful paint
  {
    type: 'script',
    src: 'js/lcp-optimize.js',
    priority: PRIORITY.MEDIUM,
    attributes: { async: true }
  },
  {
    type: 'script',
    src: 'js/image-optimizer.js',
    priority: PRIORITY.MEDIUM,
    attributes: { defer: true }
  },
  {
    type: 'script',
    src: 'js/faq.js',
    priority: PRIORITY.MEDIUM,
    attributes: { defer: true }
  },
  
  // Low priority - load after page is interactive
  {
    type: 'script',
    src: 'js/tracking.js',
    priority: PRIORITY.LOW,
    attributes: { defer: true }
  },
  {
    type: 'script',
    src: 'js/minify.js',
    priority: PRIORITY.LOW,
    attributes: { defer: true }
  },
  
  // Idle priority - load during browser idle time
  {
    type: 'script',
    src: 'js/lead-system/lead-schema.js',
    priority: PRIORITY.IDLE,
    attributes: { defer: true, fetchpriority: 'low' }
  },
  {
    type: 'script',
    src: 'js/lead-system/trusted-forms.js',
    priority: PRIORITY.IDLE,
    attributes: { defer: true, fetchpriority: 'low' }
  },
  {
    type: 'script',
    src: 'js/lead-system/myinjuryclaimnow-integration.js',
    priority: PRIORITY.IDLE,
    attributes: { defer: true, fetchpriority: 'low' }
  }
];

/**
 * Load a resource dynamically
 * @param {Object} resource - Resource configuration
 */
function loadResource(resource) {
  // Skip if already loaded
  if (document.querySelector(`[src="${resource.src}"]`)) {
    return;
  }
  
  let element;
  
  // Create element based on type
  switch (resource.type) {
    case 'script':
      element = document.createElement('script');
      element.src = resource.src;
      break;
    case 'style':
      element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = resource.src;
      break;
    default:
      console.warn(`Unknown resource type: ${resource.type}`);
      return;
  }
  
  // Apply attributes
  if (resource.attributes) {
    Object.entries(resource.attributes).forEach(([key, value]) => {
      if (value === true) {
        element.setAttribute(key, '');
      } else if (value !== false) {
        element.setAttribute(key, value);
      }
    });
  }
  
  // Add to document
  document.head.appendChild(element);
}

/**
 * Load resources by priority
 * @param {number} priority - Priority level to load
 */
function loadResourcesByPriority(priority) {
  resources
    .filter(resource => resource.priority === priority)
    .forEach(loadResource);
}

// Load resources based on page lifecycle events
document.addEventListener('DOMContentLoaded', () => {
  // Load high priority resources immediately
  loadResourcesByPriority(PRIORITY.HIGH);
  
  // Load medium priority resources after first contentful paint
  // Use requestAnimationFrame to approximate FCP
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loadResourcesByPriority(PRIORITY.MEDIUM);
    });
  });
});

// Load low priority resources after page is interactive
window.addEventListener('load', () => {
  // Short delay to ensure critical interactions are not affected
  setTimeout(() => {
    loadResourcesByPriority(PRIORITY.LOW);
  }, 500);
  
  // Load idle priority resources when browser is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadResourcesByPriority(PRIORITY.IDLE);
      loadHeroBackgroundImage(); // Load hero bg during idle time
    }, { timeout: 5000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      loadResourcesByPriority(PRIORITY.IDLE);
      loadHeroBackgroundImage(); // Load hero bg after a delay
    }, 3000);
  }
});

/**
 * Load the hero background image progressively
 */
function loadHeroBackgroundImage() {
  const imgElement = document.querySelector('.hero-bg-image');
  if (!imgElement || imgElement.classList.contains('loaded')) {
    return; // Already loaded or not found
  }

  const dataSource = imgElement.dataset.src;
  const dataFormats = imgElement.dataset.formats ? JSON.parse(imgElement.dataset.formats) : {};

  // Determine the best format (simple check, could be enhanced)
  let imageUrl = dataSource; // Default to data-src
  if (dataFormats.jpg) {
    imageUrl = dataFormats.jpg; // Prefer JPG if available
  }

  if (imageUrl) {
    const tempImage = new Image();
    tempImage.onload = () => {
      imgElement.src = imageUrl;
      imgElement.classList.add('loaded');
      log('Hero background image loaded progressively');
    };
    tempImage.onerror = () => {
      log('Error loading hero background image progressively');
      // Optionally try another format or just leave the background color
    };
    tempImage.src = imageUrl;
  } else {
    log('No source found for hero background image');
  }
}

// Log function (add if not already present)
function log(message, data) {
  if (console) { // Basic check for console availability
    console.log(`[Resource Loader] ${message}`, data || '');
  }
} 