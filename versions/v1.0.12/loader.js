/**
 * iSales Widget Loader v1.0.12
 * Public CDN Distribution
 */
(function(window, document) {
  'use strict';

  const CONFIG = {
    VERSION: '1.0.12',
    WIDGET_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.12/widget.js',
    CSS_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.12/widget.css',
    TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  };

  // CDN Fallbacks for reliability
  const CDN_FALLBACKS = {
    WIDGET: [
      CONFIG.WIDGET_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0.12/widget.js`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0.12/widget.js`
    ],
    CSS: [
      CONFIG.CSS_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0.12/widget.css`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0.12/widget.css`
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

      // Check if already loaded
      if (document.querySelector(`link[href="${currentSrc}"]`)) {
        resolve();
        return;
      }

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
        trackPerformance('css_loaded');
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
        // Preload critical resources (non-blocking)
        if (document.head && document.head.insertAdjacentHTML) {
          try {
            document.head.insertAdjacentHTML('beforeend', 
              `<link rel="preload" href="${CDN_FALLBACKS.WIDGET[0]}" as="script" crossorigin="anonymous">
               <link rel="preload" href="${CDN_FALLBACKS.CSS[0]}" as="style" crossorigin="anonymous">`
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
    _buildTime: '2025-06-24T08:37:19.571Z',
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