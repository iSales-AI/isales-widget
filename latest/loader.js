/**
 * iSales Widget Loader v1.0.20
 * Public CDN Distribution
 */
(function(window, document) {
  'use strict';

  const CONFIG = {
    VERSION: '1.0.20',
    WIDGET_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/widget.js',
    CSS_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/widget.css',
    TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  };

  // CDN Fallbacks for reliability
  const CDN_FALLBACKS = {
    WIDGET: [
      CONFIG.WIDGET_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/latest/widget.js`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/latest/widget.js`
    ],
    CSS: [
      CONFIG.CSS_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/latest/widget.css`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/latest/widget.css`
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

      // Inject critical CSS to prevent flash
    function injectCriticalCSS() {
      if (document.getElementById('isales-critical-css')) return;

      const style = document.createElement('style');
      style.id = 'isales-critical-css';
      style.textContent = `
        /* Widget-scoped critical CSS - Comprehensive floating button support */
        #isales-widget-root {
          /* Critical positioning and isolation */
          position: fixed !important;
          z-index: 999999 !important;
          isolation: isolate !important;
          transform: none !important;
          filter: none !important;
          backdrop-filter: none !important;
          clip-path: none !important;
          mask: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
          outline: none !important;

          /* Essential Brand Colors */
          --isw-brand-primary: #0057ff;
          --isw-brand-secondary: #10b981;
          --isw-brand-accent: #ffc421;

          /* Surface Colors - Light Mode */
          --isw-surface-primary: #ffffff;
          --isw-surface-secondary: #f9fafb;
          --isw-surface-tertiary: #f3f4f6;
          --isw-surface-elevated: #ffffff;
          --isw-surface-overlay: rgba(255, 255, 255, 0.95);

          /* Text Colors */
          --isw-text-primary: #1f2937;
          --isw-text-secondary: #6b7280;
          --isw-text-tertiary: #9ca3af;
          --isw-text-inverse: #ffffff;
          --isw-text-accent: var(--isw-brand-primary);
          --isw-text-muted: #737376;

          /* Border Colors */
          --isw-border-subtle: #e5e7eb;
          --isw-border-default: #d1d5db;
          --isw-border-strong: #9ca3af;

          /* Interactive Colors - CRITICAL for floating button */
          --isw-interactive-primary: var(--isw-brand-primary);
          --isw-interactive-primary-hover: #2640cc;
          --isw-interactive-secondary: var(--isw-brand-secondary);
          --isw-interactive-secondary-hover: #059669;
          --isw-interactive-danger: #ef4444;
          --isw-interactive-danger-hover: #dc2626;
          --isw-interactive-success: #10b981;
          --isw-interactive-warning: #f59e0b;

          /* Shadow System */
          --isw-shadow-color: rgba(0, 0, 0, 0.1);
          --isw-shadow-color-prominent: rgba(26, 26, 26, 0.12);
          --isw-shadow-subtle: 0 1px 2px var(--isw-shadow-color);
          --isw-shadow-default: 0 4px 6px -1px var(--isw-shadow-color);
          --isw-shadow-prominent: 0 10px 15px -3px var(--isw-shadow-color);
          --isw-shadow-floating: 0px 1px 6px 0px rgba(0, 0, 0, 0.06), 0px 2px 32px 0px rgba(0, 0, 0, 0.16);

          /* Border Radius */
          --isw-radius-sm: 0.375rem;
          --isw-radius-md: 0.5rem;
          --isw-radius-lg: 0.75rem;
          --isw-radius-xl: 1rem;
          --isw-radius-full: 9999px;
          --isw-radius-button: 8px;

          /* Typography */
          --isw-font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

          /* Transitions - CRITICAL for animations */
          --isw-transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          --isw-transition-normal: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          --isw-transition-slow: 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          /* Floating Button Critical Variables */
          --isw-floating-size: 48px;
          --isw-floating-icon-size: 32px;
          --isw-floating-social-size: 48px;
          --isw-floating-social-icon-size: 24px;
          --isw-floating-bg-primary: var(--isw-interactive-primary);
          --isw-floating-bg-secondary: var(--isw-interactive-secondary);
          --isw-floating-bg-danger: var(--isw-interactive-danger);
          --isw-floating-hover-primary: var(--isw-interactive-primary-hover);
          --isw-floating-hover-secondary: var(--isw-interactive-secondary-hover);
          --isw-floating-hover-danger: var(--isw-interactive-danger-hover);
          --isw-floating-text: var(--isw-text-inverse);
          --isw-floating-shadow: var(--isw-shadow-floating);

          /* Badge Variables */
          --isw-badge-bg: var(--isw-interactive-danger);
          --isw-badge-text: var(--isw-text-inverse);
          --isw-badge-border: var(--isw-surface-primary);

          /* Tooltip Variables */
          --isw-tooltip-bg: var(--isw-surface-tertiary);
          --isw-tooltip-text: var(--isw-text-primary);
          --isw-tooltip-shadow: var(--isw-shadow-prominent);

          /* Base font properties */
          font-family: var(--isw-font-family);
          font-size: 14px;
          line-height: 1.5;
          color: var(--isw-text-primary);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Dark theme overrides */
        #isales-widget-root[data-theme="dark"] {
          --isw-surface-primary: #111827;
          --isw-surface-secondary: #1f2937;
          --isw-surface-tertiary: #374151;
          --isw-text-primary: #f9fafb;
          --isw-text-secondary: #d1d5db;
          --isw-text-tertiary: #9ca3af;
          --isw-text-inverse: #111827;
          --isw-border-subtle: #374151;
          --isw-border-default: #4b5563;
          --isw-shadow-color: rgba(0, 0, 0, 0.3);
          --isw-tooltip-bg: #374151;
        }

        /* CRITICAL: Floating Button Container */
        .isw-floating-button-container {
          position: fixed;
          z-index: 999995;
          transition: all var(--isw-transition-slow) ease-out;
        }
        .isw-floating-button-container-visible {
          transform: scale(1);
          opacity: 1;
        }
        .isw-floating-button-container-hidden {
          transform: scale(0);
          opacity: 0;
        }
        .isw-floating-button-bottom-right {
          bottom: 24px;
          right: 24px;
        }
        .isw-floating-button-bottom-left {
          bottom: 24px;
          left: 24px;
        }

        /* CRITICAL: Main Floating Button */
        .isw-main-button {
          width: var(--isw-floating-size);
          height: var(--isw-floating-size);
          border-radius: var(--isw-radius-full);
          background-color: var(--isw-floating-bg-primary);
          color: var(--isw-floating-text);
          position: relative;
          box-shadow: var(--isw-floating-shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--isw-transition-normal);
          cursor: pointer;
          border: none;
          outline: none;
        }
        .isw-main-button:hover {
          background-color: var(--isw-floating-hover-primary);
          transform: scale(1.1);
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15), 0px 8px 40px rgba(0, 0, 0, 0.25);
        }
        .isw-main-button:active {
          transform: scale(0.95);
        }

        /* CRITICAL: Icon Animation System */
        .isw-icon-animation-container {
          position: relative;
          width: var(--isw-floating-icon-size);
          height: var(--isw-floating-icon-size);
        }
        .isw-main-icon, .isw-arrow-icon {
          position: absolute;
          inset: 0;
          width: var(--isw-floating-icon-size);
          height: var(--isw-floating-icon-size);
          color: var(--isw-floating-text);
          transition: all var(--isw-transition-slow);
        }
        .isw-main-icon-visible, .isw-arrow-icon-visible {
          opacity: 1;
          transform: rotate(0deg);
        }
        .isw-main-icon-hidden {
          opacity: 0;
          transform: rotate(90deg);
        }
        .isw-arrow-icon-hidden {
          opacity: 0;
          transform: rotate(-90deg);
        }

        /* CRITICAL: Unread Badge */
        .isw-unread-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: var(--isw-badge-bg);
          color: var(--isw-badge-text);
          border-radius: var(--isw-radius-full);
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          padding: 0 6px;
          border: 2px solid var(--isw-badge-border);
          box-shadow: var(--isw-shadow-default);
          font-family: var(--isw-font-family);
        }

        /* CRITICAL: Social Media Buttons */
        .isw-social-buttons-container {
          position: absolute;
          display: flex;
          gap: 12px;
          bottom: 0;
        }
        .isw-social-button {
          width: var(--isw-floating-social-size);
          height: var(--isw-floating-social-size);
          border-radius: var(--isw-radius-full);
          box-shadow: var(--isw-floating-shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--isw-transition-normal) ease-out;
          position: absolute;
          cursor: pointer;
          border: none;
          outline: none;
        }
        .isw-social-button:hover {
          transform: scale(1.1);
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15), 0px 8px 40px rgba(0, 0, 0, 0.25);
        }

        /* CRITICAL: Widget Loading States */
        #isales-widget-root.isw-loading {
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        }
        #isales-widget-root:not(.isw-loading) {
          visibility: visible;
          opacity: 1;
        }

        /* Critical reset for widget isolation - scoped to widget only */
        #isales-widget-root *,
        #isales-widget-root *::before,
        #isales-widget-root *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          transition: var(--isw-transition-fast);
        }
        #isales-widget-root button {
          cursor: pointer;
          background: none;
          border: none;
          font: inherit;
          color: inherit;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .isw-floating-button-bottom-right,
          .isw-floating-button-bottom-left {
            bottom: 16px;
            right: 16px;
            left: auto;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .isw-floating-button-container,
          .isw-main-button,
          .isw-social-button,
          .isw-main-icon,
          .isw-arrow-icon {
            transition: none;
          }
          .isw-main-button:hover,
          .isw-social-button:hover {
            transform: none;
          }
        }
      `;
      document.head.appendChild(style);
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

    // Remove loading state once CSS is loaded
    const removeLoadingState = () => {
      root.classList.remove('isw-loading');
      trackPerformance('widget_visible');
    };

    const checkCSSLoaded = (attempts = 0) => {
      const maxAttempts = 50; // Max 5 seconds of checking
      
      // Check for CSS from any of our known sources or preloaded CSS
      const cssLoaded =
        document.querySelector('link[rel="stylesheet"][href*="widget.css"]') ||
        document.querySelector('link[rel="stylesheet"][href*="widget/v1/widget.css"]') ||
        document.querySelector('link[rel="stylesheet"][href*="isales-widget"]') ||
        document.querySelector('link[rel="stylesheet"][href*="widget.isales.ai"]');

      if (cssLoaded && cssLoaded.sheet) {
        // CSS is fully loaded and parsed
        removeLoadingState();
      } else if (attempts < maxAttempts) {
        // Check again in a short interval
        setTimeout(() => checkCSSLoaded(attempts + 1), 100);
      } else {
        // Fallback: show widget even if CSS detection fails
        console.warn('[iSales Widget Loader] CSS load detection timeout, showing widget anyway');
        removeLoadingState();
      }
    };

    // Start checking after a small delay
    setTimeout(() => checkCSSLoaded(0), 50);
  }

  // Widget API with enhanced error handling
  const api = {
    init: init,
    open: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    close: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    toggle: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    sendMessage: function() { console.warn('[iSales Widget] Not loaded yet - command queued'); },
    loadReactCalendly: loadReactCalendlyIfNeeded,
    getMetrics: function() { return window.iSalesWidgetMetrics || {}; },
    _version: CONFIG.VERSION,
    _buildTime: '2025-06-24T20:29:46.718Z',
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