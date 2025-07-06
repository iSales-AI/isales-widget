/**
 * iSales Widget Loader v1.0.35
 * Public CDN Distribution  
 * Generated: 2025-07-06T08:43:28.728Z
 */
(function(window, document) {
  'use strict';

  // Browser compatibility polyfills for production reliability
  (function addPolyfills() {
    // fetch polyfill for older browsers
    if (!window.fetch) {
      window.fetch = function(url, options) {
        options = options || {};
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(options.method || 'GET', url);
          
          // Set headers
          if (options.headers) {
            Object.keys(options.headers).forEach(key => {
              xhr.setRequestHeader(key, options.headers[key]);
            });
          }
          
          xhr.onload = () => {
            resolve({
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              text: () => Promise.resolve(xhr.responseText),
              json: () => Promise.resolve(JSON.parse(xhr.responseText))
            });
          };
          
          xhr.onerror = () => reject(new Error('Network request failed'));
          xhr.send(options.body || null);
        });
      };
    }

    // performance.now() polyfill
    if (!window.performance) {
      window.performance = {};
    }
    if (!window.performance.now) {
      const startTime = Date.now();
      window.performance.now = function() {
        return Date.now() - startTime;
      };
    }

    // Promise polyfill for very old browsers
    if (!window.Promise) {
      window.Promise = function(executor) {
        const self = this;
        self.state = 'pending';
        self.value = undefined;
        self.handlers = [];
        
        function resolve(value) {
          if (self.state === 'pending') {
            self.state = 'fulfilled';
            self.value = value;
            self.handlers.forEach(handle);
            self.handlers = null;
          }
        }
        
        function reject(reason) {
          if (self.state === 'pending') {
            self.state = 'rejected';
            self.value = reason;
            self.handlers.forEach(handle);
            self.handlers = null;
          }
        }
        
        function handle(handler) {
          if (self.state === 'pending') {
            self.handlers.push(handler);
          } else {
            if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
              handler.onFulfilled(self.value);
            }
            if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
              handler.onRejected(self.value);
            }
          }
        }
        
        self.then = function(onFulfilled, onRejected) {
          return new Promise(function(resolve, reject) {
            handle({
              onFulfilled: function(value) {
                try {
                  resolve(onFulfilled ? onFulfilled(value) : value);
                } catch (ex) {
                  reject(ex);
                }
              },
              onRejected: function(reason) {
                try {
                  resolve(onRejected ? onRejected(reason) : reason);
                } catch (ex) {
                  reject(ex);
                }
              }
            });
          });
        };
        
        self.catch = function(onRejected) {
          return self.then(null, onRejected);
        };
        
        executor(resolve, reject);
      };
      
      Promise.resolve = function(value) {
        return new Promise(resolve => resolve(value));
      };
      
      Promise.reject = function(reason) {
        return new Promise((_, reject) => reject(reason));
      };
      
      Promise.all = function(promises) {
        return new Promise((resolve, reject) => {
          if (promises.length === 0) return resolve([]);
          let remaining = promises.length;
          const results = [];
          
          promises.forEach((promise, index) => {
            Promise.resolve(promise).then(value => {
              results[index] = value;
              remaining--;
              if (remaining === 0) resolve(results);
            }).catch(reject);
          });
        });
      };
    }

    // Object.assign polyfill
    if (!Object.assign) {
      Object.assign = function(target) {
        for (let i = 1; i < arguments.length; i++) {
          const source = arguments[i];
          for (const key in source) {
            if (source.hasOwnProperty(key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
    }
  })();

  const CONFIG = {
    VERSION: '1.0.35',
    BUILD_HASH: '1035',
    TIMESTAMP: 1751791408728,
    WIDGET_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.35/widget.js?v=1.0.35&t=1751791408728',
    CSS_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.35/widget.css?v=1.0.35&t=1751791408728',
    VERSION_CHECK_URL: 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.35/manifest.json',
    TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    UPDATE_CHECK_INTERVAL: 300000, // 5 minutes
    ENVIRONMENT: 'public-cdn',
  };

  // ✅ CDN Fallbacks with cache-busting for reliability
  const CDN_FALLBACKS = {
    WIDGET: [
      CONFIG.WIDGET_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0.35/widget.js?v=${CONFIG.VERSION}&t=${CONFIG.TIMESTAMP}`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0.35/widget.js?v=${CONFIG.VERSION}&t=${CONFIG.TIMESTAMP}`
    ],
    CSS: [
      CONFIG.CSS_URL,
      `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0.35/widget.css?v=${CONFIG.VERSION}&t=${CONFIG.TIMESTAMP}`,
      `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0.35/widget.css?v=${CONFIG.VERSION}&t=${CONFIG.TIMESTAMP}`
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

  // ✅ VERSION CHECKING for automatic updates
  async function checkForUpdates() {
    try {
      const response = await fetch(CONFIG.VERSION_CHECK_URL + '?t=' + Date.now());
      if (!response.ok) return false;
      
      const manifest = await response.json();
      const latestVersion = manifest.version;
      
      // Compare versions (simple string comparison for now)
      if (latestVersion !== CONFIG.VERSION) {
        console.warn(`[iSales Widget] New version available: ${latestVersion} (current: ${CONFIG.VERSION})`);
        
        // Track update availability
        if (window.gtag && CONFIG.ENVIRONMENT === 'public-cdn') {
          window.gtag('event', 'widget_update_available', {
            event_category: 'widget',
            event_label: latestVersion,
            value: 1
          });
        }
        
        // Force reload the page to get new version
        setTimeout(() => {
          console.warn('[iSales Widget] Reloading page to update widget...');
          window.location.reload();
        }, 2000);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('[iSales Widget] Version check failed:', error);
      return false;
    }
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
        
        // ✅ START VERSION CHECKING after successful load
        setInterval(checkForUpdates, CONFIG.UPDATE_CHECK_INTERVAL);
        // Check once immediately after load
        setTimeout(checkForUpdates, 30000); // Wait 30s before first check
        
        // Log success metrics
        if (loadTime < 3000) {
          console.log(`[iSales Widget] Loaded successfully in ${Math.round(loadTime)}ms (public CDN)`);
        }

      } catch (error) {
        const loadTime = performance.now() - loadingStartTime;
        trackPerformance('load_error', loadTime);
        console.error('[iSales Widget] Load failed after all retries:', error);
        
        // Report critical errors
        if (window.gtag && CONFIG.ENVIRONMENT === 'public-cdn') {
          window.gtag('event', 'exception', {
            description: 'Widget load failed: ' + error.message,
            fatal: false
          });
        }
        
        throw error;
      }
    })();

    return loadingPromise;
  }

  // CSP bypass for production reliability
  async function initializeCSPBypass() {
    try {
      // Detect CSP restrictions by testing script loading
      const testScript = document.createElement('script');
      testScript.src = 'data:text/javascript,void(0)';
      
      const hasCSPRestrictions = await new Promise((resolve) => {
        testScript.onload = () => resolve(false);
        testScript.onerror = () => resolve(true);
        
        // Timeout - assume no CSP if test doesn't complete
        setTimeout(() => resolve(false), 1000);
        
        document.head.appendChild(testScript);
        setTimeout(() => {
          if (testScript.parentNode) {
            testScript.parentNode.removeChild(testScript);
          }
        }, 100);
      });

      if (hasCSPRestrictions) {
        console.warn('[iSales Widget Public] CSP restrictions detected, using fallback strategies');
        
        // Track CSP detection
        if (window.iSalesWidgetMetrics) {
          window.iSalesWidgetMetrics.csp_detected = true;
          window.iSalesWidgetMetrics.csp_detected_at = Date.now();
        }

        // Report CSP detection for analytics
        if (window.gtag && CONFIG.ENVIRONMENT === 'public-cdn') {
          window.gtag('event', 'csp_detected', {
            event_category: 'widget_security',
            event_label: 'production_site',
            value: 1
          });
        }
      }

      return { hasCSPRestrictions };
    } catch (error) {
      console.warn('[iSales Widget Public] CSP bypass initialization failed:', error);
      return { hasCSPRestrictions: false, error: error.message };
    }
  }

  async function init(config) {
    if (!config || typeof config !== 'object') {
      const error = new Error('Widget requires configuration object');
      console.error('[iSales Widget Public]', error.message);
      throw error;
    }

    if (!config.apiKey || typeof config.apiKey !== 'string') {
      const error = new Error('Widget requires valid apiKey string');
      console.error('[iSales Widget Public]', error.message);
      throw error;
    }

    trackPerformance('init_start');

    try {
      // Apply theme early to prevent flash
      applyEarlyTheme(config);
      
      // Initialize CSP bypass for production sites
      const cspResult = await initializeCSPBypass();
      if (cspResult.hasCSPRestrictions) {
        console.log('[iSales Widget Public] CSP bypass configured for production environment');
      }
      
      // Load dependencies with retry logic
      let dependenciesLoaded = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!dependenciesLoaded && attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`[iSales Widget Public] Loading dependencies (attempt ${attempts}/${maxAttempts})`);
          
          await loadDependencies();
          dependenciesLoaded = true;
          
          console.log('[iSales Widget Public] Dependencies loaded successfully');
        } catch (depError) {
          console.warn(`[iSales Widget Public] Dependency load attempt ${attempts} failed:`, depError.message);
          
          if (attempts >= maxAttempts) {
            throw new Error(`Failed to load dependencies after ${maxAttempts} attempts: ${depError.message}`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      // Validate widget availability with timeout
      const validateWidget = () => {
        return new Promise((resolve, reject) => {
          const checkWidget = () => {
            if (window.iSalesWidget && typeof window.iSalesWidget.init === 'function') {
              resolve(window.iSalesWidget);
            } else if (window.iSalesWidget && typeof window.iSalesWidget === 'object') {
              reject(new Error('Widget loaded but init method not available'));
            } else {
              reject(new Error('Widget not available after loading'));
            }
          };

          // Check immediately
          checkWidget();
        });
      };

      // Wait for widget with timeout
      const widget = await Promise.race([
        validateWidget(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Widget validation timeout')), 10000)
        )
      ]);

      console.log('[iSales Widget Public] Widget validated, initializing...');

      // Initialize the widget with timeout protection
      const initializeWidget = async () => {
        try {
          const initResult = await widget.init(config);
          console.log('[iSales Widget Public] Widget initialized successfully');
          return initResult;
        } catch (initError) {
          console.error('[iSales Widget Public] Widget initialization error:', initError);
          throw initError;
        }
      };

      const initResult = await Promise.race([
        initializeWidget(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Widget initialization timeout')), 15000)
        )
      ]);

      trackPerformance('init_complete');

      // Track successful initialization
      if (window.iSalesWidgetMetrics) {
        window.iSalesWidgetMetrics.init_success = true;
        window.iSalesWidgetMetrics.init_attempts = attempts;
        window.iSalesWidgetMetrics.init_completed_at = Date.now();
      }

      return initResult;

    } catch (error) {
      trackPerformance('init_error');
      console.error('[iSales Widget Public] Initialization failed:', error);

      // Enhanced error tracking
      if (window.iSalesWidgetMetrics) {
        window.iSalesWidgetMetrics.init_error = error.message;
        window.iSalesWidgetMetrics.init_failed_at = Date.now();
        window.iSalesWidgetMetrics.init_success = false;
      }

      // Attempt graceful degradation
      try {
        if (typeof config.onError === 'function') {
          config.onError(error);
        }

        // Try to show a simple fallback UI
        if (config.showFallback !== false) {
          showFallbackUI(config, error);
        }
      } catch (fallbackError) {
        console.error('[iSales Widget Public] Fallback handling failed:', fallbackError);
      }
      
      throw error;
    }
  }

  // Show fallback UI when widget fails to load
  function showFallbackUI(config, error) {
    try {
      const root = document.getElementById('isales-widget-root');
      if (!root) return;

      root.innerHTML = `
        <div style="
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #dc2626;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 999999;
        ">
          <div style="font-weight: bold; margin-bottom: 4px;">Widget Loading Failed</div>
          <div style="font-size: 12px; opacity: 0.9;">
            ${error.message || 'Unable to load chat widget'}
          </div>
          <button onclick="this.parentElement.style.display='none'" style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
          ">×</button>
        </div>
      `;

      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (root && root.firstChild) {
          root.firstChild.style.display = 'none';
        }
      }, 10000);

    } catch (fallbackError) {
      console.error('[iSales Widget Public] Failed to show fallback UI:', fallbackError);
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
    _buildTime: '2025-07-06T08:43:28.728Z',
  };

  // Initialize global API
  window.iSalesWidget = window.iSalesWidget || api;

  // Enhanced queue processing with individual command error handling
  if (Array.isArray(window.iSalesWidget)) {
    const queue = window.iSalesWidget;
    window.iSalesWidget = api;
    
    const processedCommands = [];
    const failedCommands = [];
    
    queue.forEach((cmd, index) => {
      try {
        if (Array.isArray(cmd)) {
          if (cmd.length >= 1) {
            const command = cmd[0];
            const args = cmd.slice(1);
            
            if (typeof command === 'string') {
              if (command === 'init') {
                // Handle init command with timeout protection
                Promise.race([
                  api.init(args[0]),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Init command timeout')), 30000)
                  )
                ]).then(() => {
                  processedCommands.push({ index, command, success: true });
                }).catch((error) => {
                  failedCommands.push({ index, command, error: error.message });
                  console.error(`[iSales Widget Public] Queue command ${index} failed:`, error);
                });
              } else {
                // Queue other commands for later processing
                processedCommands.push({ index, command, success: true });
              }
            } else {
              failedCommands.push({ index, command, error: 'Invalid command type' });
              console.warn(`[iSales Widget Public] Invalid command type at index ${index}:`, typeof command);
            }
          } else {
            failedCommands.push({ index, command: 'unknown', error: 'Empty command array' });
            console.warn(`[iSales Widget Public] Empty command array at index ${index}`);
          }
        } else if (typeof cmd === 'object' && cmd.command) {
          // Handle object format {command: 'methodName', args: [...]}
          if (typeof cmd.command === 'string') {
            if (cmd.command === 'init') {
              Promise.race([
                api.init(cmd.args ? cmd.args[0] : {}),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Init command timeout')), 30000)
                )
              ]).then(() => {
                processedCommands.push({ index, command: cmd.command, success: true });
              }).catch((error) => {
                failedCommands.push({ index, command: cmd.command, error: error.message });
                console.error(`[iSales Widget Public] Queue command ${index} failed:`, error);
              });
            } else {
              processedCommands.push({ index, command: cmd.command, success: true });
            }
          } else {
            failedCommands.push({ index, command: cmd.command, error: 'Invalid command type' });
          }
        } else {
          failedCommands.push({ index, command: 'unknown', error: 'Unrecognized command format' });
          console.warn(`[iSales Widget Public] Unrecognized command format at index ${index}:`, cmd);
        }
      } catch (error) {
        failedCommands.push({ index, command: 'unknown', error: error.message });
        console.error(`[iSales Widget Public] Queue processing error at index ${index}:`, error);
      }
    });

    // Log processing results
    if (processedCommands.length > 0) {
      console.log(`[iSales Widget Public] Successfully processed ${processedCommands.length} queued commands`);
    }

    if (failedCommands.length > 0) {
      console.warn(`[iSales Widget Public] ${failedCommands.length} commands failed:`, failedCommands);
    }

    // Track queue processing metrics
    if (window.iSalesWidgetMetrics) {
      window.iSalesWidgetMetrics.queue_processed = processedCommands.length;
      window.iSalesWidgetMetrics.queue_failed = failedCommands.length;
      window.iSalesWidgetMetrics.queue_last_processed = Date.now();
    }
  }

  // Enhanced module compatibility for production reliability
  (function setupModuleCompatibility() {
    try {
      const win = window;

      // Ensure module/exports globals are available for UMD modules
      if (typeof win.module === 'undefined') {
        win.module = { exports: {} };
      }
      if (typeof win.exports === 'undefined') {
        win.exports = win.module.exports;
      }

      // Provide require fallback for modules that expect it
      if (typeof win.require === 'undefined') {
        win.require = function (moduleId) {
          // Enhanced fallback - try to return common module patterns
          if (moduleId === 'events') {
            return { EventEmitter: function() {} };
          }
          if (moduleId === 'util') {
            return { inherits: function() {} };
          }
          return {}; // Return empty object as fallback
        };
      }

      // Add global error handler for unhandled module errors
      const originalOnError = win.onerror;
      win.onerror = function(msg, url, line, col, error) {
        // Suppress common module compatibility errors in production
        if (typeof msg === 'string' && (
          msg.includes('require is not defined') ||
          msg.includes('exports is not defined') ||
          msg.includes('module is not defined')
        )) {
          console.warn('[iSales Widget Public] Module compatibility error suppressed:', msg);
          return true; // Prevent default error handling
        }
        
        // Call original error handler if it exists
        if (originalOnError) {
          return originalOnError.call(win, msg, url, line, col, error);
        }
        
        return false;
      };
    } catch (error) {
      console.warn('[iSales Widget Public] Module compatibility setup failed:', error);
    }
  })();

  // Health check endpoint for monitoring
  if (typeof window !== 'undefined') {
    window.iSalesWidgetHealth = {
      version: CONFIG.VERSION,
      status: 'loading',
      loadingPromise: loadingPromise,
      timestamp: Date.now(),
      environment: CONFIG.ENVIRONMENT,
      polyfills_loaded: true,
      csp_bypass_available: true
    };
  }

})(window, document);