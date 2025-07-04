/**
 * iSales Widget Loader v1.0.30
 * Public CDN Distribution
 * Generated: 2025-07-04T14:21:03.891Z
 * 
 * CRITICAL CSS APPROACH:
 * - Only includes widget isolation and CSS variables in inline CSS
 * - Component styles come from full widget.css to prevent cascade conflicts
 * - CSS variables have no !important to allow proper theming
 */
(function(window, document) {
  'use strict';

  const CONFIG = {
    VERSION: '1.0.30',
    WIDGET_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0/widget.js',
    CSS_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0/widget.css',
    TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  };

  // CDN Fallbacks for reliability
  const CDN_FALLBACKS = {
    WIDGET: [
      CONFIG.WIDGET_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0/widget.js`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0/widget.js`
    ],
    CSS: [
      CONFIG.CSS_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0/widget.css`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0/widget.css`
    ],
    REACT: [
      'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js',
      'https://unpkg.com/react@18/umd/react.production.min.js'
    ],
    REACT_DOM: [
      'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js',
      'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
    ],
    REACT_CALENDLY: [
      'https://cdn.jsdelivr.net/npm/react-calendly@4.4.0/dist/index.umd.js',
      'https://unpkg.com/react-calendly@4.4.0/dist/index.umd.js',
      'https://cdn.skypack.dev/react-calendly@4.4.0'
    ]
  };

  let loadingPromise = null;
  let loadingStartTime = null;

  // Performance monitoring
  function trackPerformance(event, duration = null) {
    try {
      if (!window.iSalesWidgetMetrics) window.iSalesWidgetMetrics = {};
      window.iSalesWidgetMetrics[event] = duration || performance.now();
    } catch (e) {
      // Silent fail for performance tracking
    }
  }

  function loadScriptWithRetry(sources, attempt = 1) {
    return new Promise((resolve, reject) => {
      if (typeof sources === 'string') sources = [sources];
      
      const currentSrc = sources[0];
      if (!currentSrc) {
        reject(new Error('All CDN sources exhausted'));
        return;
      }

      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        script.remove();
        
        // Try next CDN or retry current
        if (sources.length > 1) {
          loadScriptWithRetry(sources.slice(1), 1).then(resolve).catch(reject);
        } else if (attempt < CONFIG.MAX_RETRIES) {
          setTimeout(() => {
            loadScriptWithRetry([currentSrc], attempt + 1).then(resolve).catch(reject);
          }, CONFIG.RETRY_DELAY * attempt);
        } else {
          reject(new Error(`Script load timeout after ${CONFIG.MAX_RETRIES} attempts: ${currentSrc}`));
        }
      }, CONFIG.TIMEOUT);

      script.onload = () => {
        clearTimeout(timeout);
        trackPerformance(`script_loaded_${attempt > 1 ? 'retry' : 'first'}`);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        
        // Try next CDN or retry current
        if (sources.length > 1) {
          loadScriptWithRetry(sources.slice(1), 1).then(resolve).catch(reject);
        } else if (attempt < CONFIG.MAX_RETRIES) {
          setTimeout(() => {
            loadScriptWithRetry([currentSrc], attempt + 1).then(resolve).catch(reject);
          }, CONFIG.RETRY_DELAY * attempt);
        } else {
          reject(new Error(`Failed to load script after ${CONFIG.MAX_RETRIES} attempts: ${currentSrc}`));
        }
      };

      script.src = currentSrc;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    });
  }

  function loadCSSWithFallback(sources) {
    return new Promise((resolve) => {
      if (typeof sources === 'string') sources = [sources];
      
      const currentSrc = sources[0];
      if (!currentSrc) {
        resolve(); // CSS is non-critical, don't fail
        return;
      }

      // Check if already loaded as stylesheet
      if (document.querySelector(`link[rel="stylesheet"][href="${currentSrc}"]`)) {
        resolve();
        return;
      }
      
      // Check if already preloaded - convert preload to stylesheet to avoid waste
      // First try exact match
      let preloadedLink = document.querySelector(
        `link[rel="preload"][href="${currentSrc}"][as="style"]`
      );
      
      // If no exact match, check for any preloaded widget.css from known domains
      if (!preloadedLink) {
        // Check for widget.css from any domain
        const preloadedLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
        for (const link of preloadedLinks) {
          const href = link.getAttribute('href');
          if (
            href &&
            (href.includes('/widget.css') ||
              href.includes('/widget/v1/widget.css') ||
              href.includes('isales-widget') ||
              href.includes('widget.isales.ai'))
          ) {
            preloadedLink = link;
            console.log('[iSales Widget] Found preloaded CSS from different CDN:', href);
            break;
          }
        }
      }
      
      if (preloadedLink) {
        // Convert preload to stylesheet
        preloadedLink.rel = 'stylesheet';
        
        // Remove the as attribute as it's no longer a preload
        preloadedLink.removeAttribute('as');
        
        // Set up load handlers
        const loadHandler = () => {
          trackPerformance('css_loaded_from_preload');
          resolve();
        };
        
        const errorHandler = () => {
          // Fallback to loading from our CDN if preloaded resource fails
          console.warn('[iSales Widget] Preloaded CSS failed to load, falling back to CDN');
          preloadedLink.remove(); // Clean up the failed preload
          
          // Create new link element with our CDN URL
          createNewStylesheet();
        };
        
        // Check if stylesheet is already loaded (for already converted preloads)
        if (preloadedLink.sheet) {
          loadHandler();
        } else {
          preloadedLink.onload = loadHandler;
          preloadedLink.onerror = errorHandler;
        }
        return;
      }

      // No preload found, create new stylesheet
      createNewStylesheet();
      
      function createNewStylesheet() {
        const link = document.createElement('link');
        let resolved = false;

        const resolveOnce = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };

        // CSS loading is non-blocking, timeout after reasonable time
        const timeout = setTimeout(() => {
          if (sources.length > 1) {
            loadCSSWithFallback(sources.slice(1)).then(resolveOnce);
          } else {
            resolveOnce(); // Don't fail on CSS load issues
          }
        }, 5000);

        link.onload = () => {
          clearTimeout(timeout);
          trackPerformance('css_loaded_fresh');
          resolveOnce();
        };

        link.onerror = () => {
          clearTimeout(timeout);
          if (sources.length > 1) {
            loadCSSWithFallback(sources.slice(1)).then(resolveOnce);
          } else {
            resolveOnce(); // Don't fail on CSS load issues
          }
        };

        link.rel = 'stylesheet';
        link.href = currentSrc;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  function loadReactCalendlyIfNeeded() {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.ReactCalendly) {
        resolve();
        return;
      }

      // Check if already loading
      if (window._reactCalendlyLoading) {
        window._reactCalendlyLoading.then(resolve);
        return;
      }

      // Load React dependencies first, then react-calendly
      window._reactCalendlyLoading = (async () => {
        try {
          // Load React if not already available
          if (!window.React) {
            await loadScriptWithRetry(CDN_FALLBACKS.REACT);
            trackPerformance('react_loaded');
          }

          // Load ReactDOM if not already available  
          if (!window.ReactDOM) {
            await loadScriptWithRetry(CDN_FALLBACKS.REACT_DOM);
            trackPerformance('react_dom_loaded');
          }

          // Now load react-calendly
          await loadScriptWithRetry(CDN_FALLBACKS.REACT_CALENDLY);
          trackPerformance('react_calendly_loaded');
          
          delete window._reactCalendlyLoading;
        } catch (error) {
          console.warn('[iSales Widget] Failed to load React Calendly dependencies:', error);
          delete window._reactCalendlyLoading;
          // Don't fail - calendar features will be disabled
          throw error;
        }
      })();

      window._reactCalendlyLoading.then(resolve).catch(() => resolve());
    });
  }

  async function loadDependencies() {
    if (loadingPromise) return loadingPromise;

    loadingStartTime = performance.now();
    trackPerformance('load_start');

    loadingPromise = (async () => {
      try {
        // Preload critical script only (not CSS to avoid unused preload warning)
        if (document.head && document.head.insertAdjacentHTML) {
          try {
            document.head.insertAdjacentHTML('beforeend', 
              `<link rel="preload" href="${CDN_FALLBACKS.WIDGET[0]}" as="script" crossorigin="anonymous">`
            );
          } catch (e) {
            // Ignore preload errors
          }
        }

        // Load CSS first (non-blocking)
        const cssPromise = loadCSSWithFallback(CDN_FALLBACKS.CSS);

        // Load widget (contains bundled Preact)
        await loadScriptWithRetry(CDN_FALLBACKS.WIDGET);

        // Wait for CSS (non-critical)
        await cssPromise;

        const loadTime = performance.now() - loadingStartTime;
        trackPerformance('total_load_time', loadTime);
        
        // Log success metrics
        if (loadTime < 3000) {
          console.log(`[iSales Widget] Loaded successfully in ${Math.round(loadTime)}ms`);
        }

      } catch (error) {
        const loadTime = performance.now() - loadingStartTime;
        trackPerformance('load_error', loadTime);
        console.error('[iSales Widget] Load failed after all retries:', error);
        throw error;
      }
    })();

    return loadingPromise;
  }

  async function init(config) {
    if (!config || !config.apiKey) {
      throw new Error('Widget requires apiKey');
    }

    trackPerformance('init_start');

    try {
      // Apply theme early to prevent flash
      applyEarlyTheme(config);
      
      await loadDependencies();
      
      if (window.iSalesWidget && window.iSalesWidget.init) {
        const initResult = await window.iSalesWidget.init(config);
        trackPerformance('init_complete');
        return initResult;
      } else {
        throw new Error('Widget not available after loading');
      }
    } catch (error) {
      trackPerformance('init_error');
      console.error('[iSales Widget] Init failed:', error);
      
      // Attempt graceful degradation
      if (typeof config.onError === 'function') {
        config.onError(error);
      }
      
      throw error;
    }
  }

  // Inject critical CSS - ONLY isolation and CSS variables to prevent cascade issues
  function injectCriticalCSS() {
    if (document.getElementById('isales-critical-css')) return;

    const style = document.createElement('style');
    style.id = 'isales-critical-css';
    
    // CRITICAL: Only includes essential widget isolation and CSS variables
    // Component styles are handled by the full widget.css to prevent cascade conflicts
    style.textContent = `#isales-widget-root {
  all: initial !important;
  position: fixed !important;
  z-index: 2147483647 !important;
  isolation: isolate !important;
  box-sizing: border-box !important;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  --isw-brand-primary: #0057ff;
  --isw-interactive-primary: var(--isw-brand-primary);
  --isw-text-inverse: #ffffff;
  --isw-surface-primary: #ffffff;
  --isw-transition-normal: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --isw-radius-full: 9999px;
}
#isales-widget-root[data-theme="dark"] {
  --isw-surface-primary: #111827;
  --isw-text-primary: #f9fafb;
}
#isales-widget-root *, #isales-widget-root *::before, #isales-widget-root *::after {
  box-sizing: border-box !important;
}`;
    
    // Inject at the very beginning of head to ensure highest priority
    if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.head.appendChild(style);
    }
  }

  // Apply theme early to prevent flash
  function applyEarlyTheme(config) {
    if (!config) return;
    
    // Inject critical CSS first
    injectCriticalCSS();

    // Create root element early if it doesn't exist
    let root = document.getElementById('isales-widget-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'isales-widget-root';
      root.style.position = 'fixed';
      root.style.zIndex = '999999';
      document.body.appendChild(root);
    }

    // Apply theme attribute
    const theme = config.theme || 'auto';
    if (theme === 'auto') {
      const prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Apply primary color if provided
    if (config.primaryColor) {
      root.style.setProperty('--isw-primary-color', config.primaryColor);
    }

    // Add loading state class to prevent layout shifts
    root.classList.add('isw-loading');

    // Enhanced CSS load detection for better reliability
    const removeLoadingState = () => {
      root.classList.remove('isw-loading');
      trackPerformance('widget_visible');
    };

    const checkCSSLoaded = (attempts = 0) => {
      const maxAttempts = 100; // Increased attempts for better detection
      
      try {
        // Enhanced CSS detection - check for critical pseudo-element styles
        const testElement = document.createElement('div');
        testElement.className = 'isw-main-content-area';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.visibility = 'hidden';
        root.appendChild(testElement);

        // Check if pseudo-element styles are applied
        const computedStyle = window.getComputedStyle(testElement, '::before');
        const hasBackground = computedStyle.background && computedStyle.background !== 'none';
        const hasContent = computedStyle.content && computedStyle.content !== 'none';
        
        root.removeChild(testElement);

        if (hasBackground || hasContent || attempts > 50) {
          // CSS is loaded with pseudo-elements working, or fallback timeout
          removeLoadingState();
          if (attempts > 50) {
            console.warn('[iSales Widget] CSS detection timeout - showing widget anyway');
          }
        } else if (attempts < maxAttempts) {
          // Check again with shorter interval for better responsiveness
          setTimeout(() => checkCSSLoaded(attempts + 1), 50);
        } else {
          // Final fallback - show widget even if detection fails
          console.warn('[iSales Widget] CSS pseudo-element detection failed - showing widget anyway');
          removeLoadingState();
        }
      } catch (error) {
        console.warn('[iSales Widget] CSS detection error:', error);
        removeLoadingState();
      }
    };

    // Start checking after a small delay to allow CSS to start loading
    setTimeout(() => checkCSSLoaded(0), 100);
  }

  // Widget API with enhanced error handling
  const api = {
    // Core methods
    init: init,
    open: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    close: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    toggle: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // Messaging
    sendMessage: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // User management
    identify: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // Analytics
    track: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // Event handling
    on: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    off: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // Navigation methods (that actually exist)
    navigateTo: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    scrollToElement: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    sendCustomEvent: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // Screenshot methods (that actually exist)
    captureElement: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    captureViewport: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // Utility methods
    destroy: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },

    // Loader-specific methods
    loadReactCalendly: loadReactCalendlyIfNeeded,
    getMetrics: function() { return window.iSalesWidgetMetrics || {}; },
    _version: CONFIG.VERSION,
    _buildTime: '2025-07-04T14:21:03.891Z',
  };

  // Initialize global API
  window.iSalesWidget = window.iSalesWidget || api;

  // Enhanced queue processing with error handling
  if (Array.isArray(window.iSalesWidget)) {
    const queue = window.iSalesWidget;
    window.iSalesWidget = api;
    
    queue.forEach((cmd, index) => {
      try {
        if (Array.isArray(cmd) && cmd.length >= 2) {
          const command = cmd[0];
          const args = cmd.slice(1);
          if (command === 'init') {
            api.init(args[0]).catch((error) => {
              console.error(`[iSales Widget] Queue command ${index} failed:`, error);
            });
          }
        }
      } catch (error) {
        console.error(`[iSales Widget] Queue processing error at index ${index}:`, error);
      }
    });
  }

  // Health check endpoint for monitoring
  if (typeof window !== 'undefined') {
    window.iSalesWidgetHealth = {
      version: CONFIG.VERSION,
      status: 'loading',
      loadingPromise: loadingPromise,
      timestamp: Date.now()
    };
  }

})(window, document);