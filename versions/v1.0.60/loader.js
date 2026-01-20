/**
 * iSales AI Chat Widget Loader
 *
 * Usage:
 * <script src="https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/loader.js"></script>
 * <script>
 *   iSalesWidget.init({
 *     apiKey: 'your-api-key-here',
 *     position: 'bottom-right'
 *   });
 * </script>
 */

(function (window, document) {
  'use strict';

  // Configuration - stable CDN URLs to prevent issues
  const CONFIG = {
    VERSION: (function () {
      const placeholder = '1.0.60';
      const splitPlaceholder = '{{VER' + 'SION}}';
      return placeholder === splitPlaceholder ? 'dev' : placeholder;
    })(), // Will be replaced during build
    BUILD_TIME: (function () {
      const placeholder = '2026-01-20T12:23:04.346Z';
      const splitPlaceholder = '{{BUILD_' + 'TIME}}';
      return placeholder === splitPlaceholder ? new Date().toISOString() : placeholder;
    })(), // Will be replaced during build
    WIDGET_CDN: (function () {
      // ✅ FIXED: Use more reliable URL detection with fallback
      try {
        const currentScript = document.currentScript;
        if (currentScript && currentScript.src) {
          const url = new URL(currentScript.src);
          const pathParts = url.pathname.split('/').filter((p) => p);

          // Check for jsdelivr CDN pattern: /gh/owner/repo@version/dir/loader.js
          if (pathParts.length >= 5 && pathParts[0] === 'gh' && pathParts[2].includes('@')) {
            const [repoWithVersion, ...dirParts] = pathParts.slice(1);
            const [owner, repoAndVersion] = repoWithVersion.split('/');
            const [repo, version] = repoAndVersion.split('@');
            const dir = dirParts.join('/');

            if (owner && repo && version && dir) {
              return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${version}/${dir}/widget.js`;
            }
          }
        }
      } catch {
        console.warn('[iSales Widget Loader] Dynamic URL detection failed, using fallback');
      }

      // Fallback to default
      return 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/widget.js';
    })(),
    WIDGET_CSS: (function () {
      try {
        const currentScript = document.currentScript;
        if (currentScript && currentScript.src) {
          const url = new URL(currentScript.src);
          const pathParts = url.pathname.split('/').filter((p) => p);

          // Check for jsdelivr CDN pattern: /gh/owner/repo@version/dir/loader.js
          if (pathParts.length >= 5 && pathParts[0] === 'gh' && pathParts[2].includes('@')) {
            const [repoWithVersion, ...dirParts] = pathParts.slice(1);
            const [owner, repoAndVersion] = repoWithVersion.split('/');
            const [repo, version] = repoAndVersion.split('@');
            const dir = dirParts.join('/');

            if (owner && repo && version && dir) {
              return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${version}/${dir}/widget.css`;
            }
          }
        }
      } catch {
        console.warn('[iSales Widget Loader] Dynamic URL detection failed, using fallback');
      }

      return 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/widget.css';
    })(),
    SENTRY_CDN: 'https://js.sentry-cdn.com/a2bfb117449c28e80480c0becf8586b1.min.js',
    TIMEOUT: 15000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  };

  // CDN Fallbacks for reliability - stable fallbacks
  const CDN_FALLBACKS = (function () {
    // ✅ FIXED: Extract repo and path info more safely
    let repoPath = 'iSales-AI/isales-widget@main/latest';

    try {
      const currentScript = document.currentScript;
      if (currentScript && currentScript.src) {
        const url = new URL(currentScript.src);
        const pathParts = url.pathname.split('/').filter((p) => p);

        // Check for jsdelivr CDN pattern: /gh/owner/repo@version/dir/loader.js
        if (pathParts.length >= 5 && pathParts[0] === 'gh' && pathParts[2].includes('@')) {
          const [repoWithVersion, ...dirParts] = pathParts.slice(1);
          const [owner, repoAndVersion] = repoWithVersion.split('/');
          const [repo, version] = repoAndVersion.split('@');
          const dir = dirParts.join('/');

          if (owner && repo && version && dir) {
            repoPath = `${owner}/${repo}@${version}/${dir}`;
          }
        }
      }
    } catch {
      console.warn('[iSales Widget Loader] CDN fallback detection failed, using defaults');
    }

    return {
      WIDGET: [
        CONFIG.WIDGET_CDN,
        `https://cdn.statically.io/gh/${repoPath}/widget.js`,
        `https://raw.githack.com/${repoPath.replace('@', '/')}/widget.js`,
        'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/widget.js', // Final fallback
      ],
      CSS: [
        CONFIG.WIDGET_CSS,
        `https://cdn.statically.io/gh/${repoPath}/widget.css`,
        `https://raw.githack.com/${repoPath.replace('@', '/')}/widget.css`,
        'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/widget.css', // Final fallback
      ],
    };
  })();

  // State management
  let isWidgetLoaded = false;
  let loadingPromise = null;
  let initQueue = [];
  let loadingStartTime = null;
  let customCDNConfig = null;

  // Fetch polyfill for compatibility
  const safeFetch = (function () {
    if (typeof fetch !== 'undefined') {
      return fetch;
    }

    // Fallback for environments without fetch
    return function (url, options = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);

        // Set headers
        if (options.headers) {
          Object.keys(options.headers).forEach((key) => {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }

        xhr.onload = () => {
          const response = {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText)),
          };
          resolve(response);
        };

        xhr.onerror = () => reject(new Error('Network request failed'));
        xhr.ontimeout = () => reject(new Error('Request timeout'));

        // Set timeout
        xhr.timeout = 10000; // 10 second timeout

        xhr.send(options.body || null);
      });
    };
  })();

  // Performance monitoring
  function trackPerformance(event, duration = null) {
    try {
      if (!window.iSalesWidgetMetrics) window.iSalesWidgetMetrics = {};
      window.iSalesWidgetMetrics[event] = duration || performance.now();
    } catch {
      // Silent fail for performance tracking
    }
  }

  /**
   * Load script with promise, timeout, and retry logic
   */
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
            loadScriptWithRetry([currentSrc], attempt + 1)
              .then(resolve)
              .catch(reject);
          }, CONFIG.RETRY_DELAY * attempt);
        } else {
          reject(
            new Error(`Script load timeout after ${CONFIG.MAX_RETRIES} attempts: ${currentSrc}`)
          );
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
            loadScriptWithRetry([currentSrc], attempt + 1)
              .then(resolve)
              .catch(reject);
          }, CONFIG.RETRY_DELAY * attempt);
        } else {
          reject(
            new Error(`Failed to load script after ${CONFIG.MAX_RETRIES} attempts: ${currentSrc}`)
          );
        }
      };

      script.src = currentSrc;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    });
  }

  /**
   * Load CSS with fallback support
   */
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
            console.warn('[iSales Widget] Found preloaded CSS from different CDN:', href);
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

  /**
   * Load Sentry CDN for error monitoring (optional, non-blocking)
   */
  function loadSentryAsync() {
    try {
      // ✅ ENHANCED: Check if Sentry is already loaded to prevent duplicate loading
      if (window.Sentry) {
        if (window.iSalesWidgetMetrics) {
          window.iSalesWidgetMetrics.sentry_already_loaded = performance.now();
        }

        // Sentry already exists - let the widget handle configuration
        console.warn(
          '[iSales Widget Loader] Sentry already loaded - skipping loader initialization'
        );
        return;
      }

      // ✅ ENHANCED: Check if there's already a Sentry script loading
      const existingSentryScript = document.querySelector('script[src*="sentry"]');
      if (existingSentryScript) {
        console.warn(
          '[iSales Widget Loader] Sentry script already loading - skipping duplicate load'
        );
        return;
      }

      // ✅ CSP-Safe: Don't load Sentry if CSP might block it
      // Check if we're in a strict CSP environment
      if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        console.warn('[iSales Widget Loader] CSP detected - skipping Sentry to avoid violations');
        return;
      }

      // Configure Sentry before loading the script
      window.sentryOnLoad = function () {
        if (window.Sentry) {
          try {
            window.Sentry.init({
              dsn: 'https://a2bfb117449c28e80480c0becf8586b1@o1095910.ingest.us.sentry.io/4509562871087104',
              environment: 'production',
              release: CONFIG.VERSION,
              sampleRate: 1.0,
              tracesSampleRate: 0.1,
              beforeSend: function (event) {
                // Filter loader-specific events
                if (event.tags?.component !== 'widget') {
                  event.tags = event.tags || {};
                  event.tags.component = 'widget-loader';
                }
                return event;
              },
              initialScope: {
                tags: {
                  component: 'widget-loader',
                  version: CONFIG.VERSION,
                },
              },
            });

            // ✅ NEW: Mark that loader initialized Sentry
            window.iSalesLoaderSentryInit = true;

            // Track loader initialization
            window.Sentry.addBreadcrumb({
              category: 'loader',
              message: 'Widget loader initialized Sentry',
              level: 'info',
              data: {
                timestamp: Date.now(),
                version: CONFIG.VERSION,
                method: 'loader',
              },
            });

            if (window.iSalesWidgetMetrics) {
              window.iSalesWidgetMetrics.sentry_init_by_loader = performance.now();
            }
          } catch (error) {
            console.warn('[iSales Widget Loader] Sentry initialization failed:', error);
          }
        }
      };

      // Load Sentry script asynchronously with CSP error handling
      const script = document.createElement('script');
      script.src = CONFIG.SENTRY_CDN;
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.setAttribute('data-loaded-by', 'isales-loader'); // ✅ NEW: Mark script source

      script.onload = () => {
        trackPerformance('sentry_loaded');
        if (window.iSalesWidgetMetrics) {
          window.iSalesWidgetMetrics.sentry_script_loaded = performance.now();
        }
      };

      script.onerror = (_error) => {
        // ✅ ENHANCED: Better CSP error handling
        console.warn(
          '[iSales Widget Loader] Sentry failed to load (likely CSP) - continuing without monitoring'
        );
        if (window.iSalesWidgetMetrics) {
          window.iSalesWidgetMetrics.sentry_load_failed = performance.now();
          window.iSalesWidgetMetrics.sentry_block_reason = 'csp_or_network';
        }
      };

      document.head.appendChild(script);
    } catch (error) {
      // Silent fail - Sentry is optional
      console.warn('[iSales Widget Loader] Sentry initialization skipped:', error.message);
    }
  }

  /**
   * Preload resources strategically to avoid unused preload warnings
   */
  function preloadCriticalResources() {
    if (document.head && document.head.insertAdjacentHTML) {
      try {
        // Only preload script since it's the critical path blocker
        // CSS will be loaded immediately after anyway, so preloading it causes the warning
        document.head.insertAdjacentHTML(
          'beforeend',
          `<link rel="preload" href="${CDN_FALLBACKS.WIDGET[0]}" as="script" crossorigin="anonymous">`
        );
      } catch {
        // Ignore preload errors - not critical
      }
    }
  }

  /**
   * Load all dependencies with enhanced reliability
   */
  async function loadDependencies() {
    if (loadingPromise) {
      return loadingPromise;
    }

    loadingStartTime = performance.now();
    trackPerformance('load_start');

    // Define sources early so they're available in error handling
    const widgetSources = customCDNConfig?.widget
      ? [customCDNConfig.widget, ...CDN_FALLBACKS.WIDGET]
      : CDN_FALLBACKS.WIDGET;

    const cssSources = customCDNConfig?.css
      ? [customCDNConfig.css, ...CDN_FALLBACKS.CSS]
      : CDN_FALLBACKS.CSS;

    loadingPromise = (async () => {
      try {
        // Start Sentry loading early (optional, non-blocking)
        loadSentryAsync();

        // Preload only the script (critical path) - avoid CSS preload to prevent warnings
        preloadCriticalResources();

        // Start CSS loading immediately (in parallel with script)
        const cssPromise = loadCSSWithFallback(cssSources);

        // Load the main widget script
        if (!isWidgetLoaded) {
          console.warn('[iSales Widget Loader] Loading widget script from:', widgetSources[0]);
          await loadScriptWithRetry(widgetSources);
          isWidgetLoaded = true;
          console.warn('[iSales Widget Loader] Widget script loaded successfully');
        }

        // Wait for CSS to complete (non-critical, won't block script execution)
        await cssPromise;

        const loadTime = performance.now() - loadingStartTime;
        trackPerformance('total_load_time', loadTime);

        // Log success metrics - only warn if loading is slow
        if (loadTime >= 3000) {
          console.warn(`[iSales Widget] Slow loading detected: ${Math.round(loadTime)}ms`);
        }
      } catch (error) {
        const loadTime = performance.now() - loadingStartTime;
        trackPerformance('load_error', loadTime);
        console.error('[iSales Widget Loader] Failed to load dependencies:', error);

        // Track error in Sentry if available
        if (window.Sentry && window.Sentry.captureException) {
          window.Sentry.captureException(error, {
            tags: {
              component: 'widget-loader',
              error_type: 'load_failure',
            },
            contexts: {
              loader_context: {
                loadTime,
                widgetSources: widgetSources?.slice(0, 2), // Don't send all URLs
                cssSources: cssSources?.slice(0, 2),
                timestamp: Date.now(),
              },
            },
          });
        }

        throw error;
      }
    })();

    return loadingPromise;
  }

  /**
   * Inject critical CSS to prevent flash
   */
  function injectCriticalCSS() {
    if (document.getElementById('isales-critical-css')) return;

    const style = document.createElement('style');
    style.id = 'isales-critical-css';

    // Add !important to critical CSS rules to prevent host site interference
    style.textContent = `
      /* Widget-scoped critical CSS - Comprehensive floating button support */
      /* CRITICAL: Enhanced host site isolation */
      #isales-widget-root {
        /* Critical positioning and isolation */
        all: initial !important;
        position: fixed !important;
        z-index: 2147483647 !important; /* Maximum z-index */
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
        display: block !important;
        content: normal !important;

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
        font-family: var(--isw-font-family) !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        color: var(--isw-text-primary) !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
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
      #isales-widget-root .isw-floating-button-container {
        position: fixed !important;
        z-index: 999995 !important;
        transition: all var(--isw-transition-slow) ease-out !important;
        display: block !important;
      }
      #isales-widget-root .isw-floating-button-container-visible {
        transform: scale(1) !important;
        opacity: 1 !important;
      }
      #isales-widget-root .isw-floating-button-container-hidden {
        transform: scale(0) !important;
        opacity: 0 !important;
      }
      #isales-widget-root .isw-floating-button-bottom-right {
        bottom: 24px !important;
        right: 24px !important;
      }
      #isales-widget-root .isw-floating-button-bottom-left {
        bottom: 24px !important;
        left: 24px !important;
      }

      /* CRITICAL: Main Floating Button */
      #isales-widget-root .isw-main-button {
        width: var(--isw-floating-size) !important;
        height: var(--isw-floating-size) !important;
        border-radius: var(--isw-radius-full) !important;
        background-color: var(--isw-floating-bg-primary) !important;
        color: var(--isw-floating-text) !important;
        position: relative !important;
        box-shadow: var(--isw-floating-shadow) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all var(--isw-transition-normal) !important;
        cursor: pointer !important;
        border: none !important;
        outline: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      #isales-widget-root .isw-main-button:hover {
        background-color: var(--isw-floating-hover-primary) !important;
        transform: scale(1.1) !important;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15), 0px 8px 40px rgba(0, 0, 0, 0.25) !important;
      }
      #isales-widget-root .isw-main-button:active {
        transform: scale(0.95) !important;
      }

      /* CRITICAL: Icon Animation System */
      #isales-widget-root .isw-icon-animation-container {
        position: relative !important;
        width: var(--isw-floating-icon-size) !important;
        height: var(--isw-floating-icon-size) !important;
        display: block !important;
      }
      #isales-widget-root .isw-main-icon, 
      #isales-widget-root .isw-arrow-icon {
        position: absolute !important;
        inset: 0 !important;
        width: var(--isw-floating-icon-size) !important;
        height: var(--isw-floating-icon-size) !important;
        color: var(--isw-floating-text) !important;
        transition: all var(--isw-transition-slow) !important;
        display: block !important;
      }
      #isales-widget-root .isw-main-icon-visible, 
      #isales-widget-root .isw-arrow-icon-visible {
        opacity: 1 !important;
        transform: rotate(0deg) !important;
      }
      #isales-widget-root .isw-main-icon-hidden {
        opacity: 0 !important;
        transform: rotate(90deg) !important;
      }
      #isales-widget-root .isw-arrow-icon-hidden {
        opacity: 0 !important;
        transform: rotate(-90deg) !important;
      }

      /* CRITICAL: Main Content Area Pseudo-Elements */
      #isales-widget-root .isw-main-content-area::before {
        content: "" !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: -2 !important;
        background: linear-gradient(155deg, #233c68 5%, #0057ff 32%, #ffffff 70%) !important;
        pointer-events: none !important;
        border-radius: 18px 18px 0 0 !important;
        opacity: 1 !important;
        display: block !important;
      }
      #isales-widget-root .isw-main-content-area::after {
        content: "" !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: -1 !important;
        background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E") !important;
        mix-blend-mode: color-burn !important;
        filter: contrast(130%) brightness(120%) !important;
        opacity: 0.2 !important;
        pointer-events: none !important;
        border-radius: 18px 18px 0 0 !important;
        display: block !important;
      }

      /* CRITICAL: Unread Badge */
      #isales-widget-root .isw-unread-badge {
        position: absolute !important;
        top: -8px !important;
        right: -8px !important;
        background-color: var(--isw-badge-bg) !important;
        color: var(--isw-badge-text) !important;
        border-radius: var(--isw-radius-full) !important;
        min-width: 24px !important;
        height: 24px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        padding: 0 6px !important;
        border: 2px solid var(--isw-badge-border) !important;
        box-shadow: var(--isw-shadow-default) !important;
        font-family: var(--isw-font-family) !important;
      }

      /* CRITICAL: Widget Loading States */
      #isales-widget-root.isw-loading {
        visibility: hidden !important;
        opacity: 0 !important;
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out !important;
      }
      #isales-widget-root:not(.isw-loading) {
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* Critical reset for widget isolation - scoped to widget only */
      #isales-widget-root *,
      #isales-widget-root *::before,
      #isales-widget-root *::after {
        box-sizing: border-box; /* Removed !important to allow override if needed */
        /* Removed margin: 0 !important - components manage their own spacing */
        /* Removed padding: 0 !important - components manage their own spacing */
      }
      #isales-widget-root button {
        cursor: pointer !important;
        background: none !important;
        border: none !important;
        font: inherit !important;
        color: inherit !important;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        #isales-widget-root .isw-floating-button-bottom-right,
        #isales-widget-root .isw-floating-button-bottom-left {
          bottom: 16px !important;
          right: 16px !important;
          left: auto !important;
        }
      }

      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        #isales-widget-root .isw-floating-button-container,
        #isales-widget-root .isw-main-button,
        #isales-widget-root .isw-social-button,
        #isales-widget-root .isw-main-icon,
        #isales-widget-root .isw-arrow-icon {
          transition: none !important;
        }
        #isales-widget-root .isw-main-button:hover,
        #isales-widget-root .isw-social-button:hover {
          transform: none !important;
        }
      }
    `;

    // Inject at the very beginning of head to ensure highest priority
    if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.head.appendChild(style);
    }
  }

  /**
   * Apply theme early to prevent flash
   */
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
      const maxAttempts = 60; // Reduced for better performance
      const timeoutAttempts = 40; // Show widget after 2 seconds max

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

        if (hasBackground || hasContent || attempts > timeoutAttempts) {
          // CSS is loaded with pseudo-elements working, or fallback timeout
          removeLoadingState();
          if (attempts > timeoutAttempts) {
            console.warn('[iSales Widget] CSS detection timeout - showing widget anyway');
          }
        } else if (attempts < maxAttempts) {
          // Check again with shorter interval for better responsiveness
          setTimeout(() => checkCSSLoaded(attempts + 1), 50);
        } else {
          // Final fallback - show widget even if detection fails
          console.warn('[iSales Widget] CSS detection failed - showing widget anyway');
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

  /**
   * Initialize widget with config
   */
  async function init(config) {
    if (!config || !config.apiKey) {
      throw new Error('Widget requires apiKey');
    }

    trackPerformance('init_start');

    try {
      // Store custom CDN config if provided
      if (config.cdn) {
        customCDNConfig = {
          widget: config.cdn.widgetUrl || CONFIG.WIDGET_CDN,
          css: config.cdn.cssUrl || CONFIG.WIDGET_CSS,
        };
      }

      // Apply theme early to prevent flash
      applyEarlyTheme(config);

      await loadDependencies();

      // ✅ FIXED: Wait for actual widget to be ready with timeout and debugging
      const waitForWidget = async (maxAttempts = 50) => {
        console.warn('[iSales Widget Loader] Waiting for widget to initialize...');

        for (let i = 0; i < maxAttempts; i++) {
          // Debug info every 10 attempts
          if (i % 10 === 0 && i > 0) {
            console.warn(`[iSales Widget Loader] Still waiting... attempt ${i}/${maxAttempts}`);
            console.warn('Available objects:', {
              iSalesWidgetCore: !!window.iSalesWidgetCore,
              iSalesWidget: !!window.iSalesWidget,
              iSalesWidgetType: typeof window.iSalesWidget,
              hasInit: !!window.iSalesWidget?.init,
              isActualWidget: !!window.iSalesWidget?._isActualWidget,
              isOurInit: window.iSalesWidget?.init === init,
            });
          }

          // Check if actual widget is loaded (not the loader's proxy)
          if (window.iSalesWidgetCore && typeof window.iSalesWidgetCore.init === 'function') {
            console.warn('[iSales Widget Loader] Found iSalesWidgetCore, initializing...');
            return window.iSalesWidgetCore;
          }

          // Fallback: check if window.iSalesWidget is the actual widget (not our proxy)
          if (
            window.iSalesWidget &&
            typeof window.iSalesWidget.init === 'function' &&
            window.iSalesWidget.init !== init && // ✅ CRITICAL: Not our own init function
            window.iSalesWidget._isActualWidget
          ) {
            console.warn('[iSales Widget Loader] Found actual widget, initializing...');
            return window.iSalesWidget;
          }

          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Enhanced error with debug info
        const debugInfo = {
          iSalesWidgetCore: !!window.iSalesWidgetCore,
          iSalesWidget: !!window.iSalesWidget,
          iSalesWidgetType: typeof window.iSalesWidget,
          hasInit: !!window.iSalesWidget?.init,
          isActualWidget: !!window.iSalesWidget?._isActualWidget,
          isOurInit: window.iSalesWidget?.init === init,
          loadingPromise: !!loadingPromise,
          isWidgetLoaded: isWidgetLoaded,
        };

        console.error(
          '[iSales Widget Loader] Widget initialization timeout after 5 seconds:',
          debugInfo
        );
        throw new Error(`Widget initialization timeout. Debug info: ${JSON.stringify(debugInfo)}`);
      };

      // Initialize the actual widget
      const actualWidget = await waitForWidget();
      const initResult = await actualWidget.init(config);
      trackPerformance('init_complete');
      return initResult;
    } catch (error) {
      trackPerformance('init_error');
      console.error('[iSales Widget Loader] Initialization failed:', error);

      // Attempt graceful degradation
      if (typeof config.onError === 'function') {
        config.onError(error);
      }

      throw error;
    }
  }

  /**
   * Queue commands until widget is ready
   */
  function queueCommand(command, args) {
    initQueue.push([command, args]);
  }

  /**
   * Process queued commands
   */
  async function processQueue() {
    if (initQueue.length === 0) return;

    try {
      await loadDependencies();

      // ✅ FIXED: Process commands with actual widget, not loader proxy
      const actualWidget =
        window.iSalesWidgetCore ||
        (window.iSalesWidget?._isActualWidget ? window.iSalesWidget : null);

      if (actualWidget) {
        console.warn(`[iSales Widget Loader] Processing ${initQueue.length} queued commands...`);

        // Process all queued commands
        initQueue.forEach(([command, args]) => {
          if (typeof actualWidget[command] === 'function') {
            actualWidget[command](...args);
          } else {
            console.warn(`[iSales Widget Loader] Command not available: ${command}`);
          }
        });

        initQueue = [];
      } else {
        console.warn('[iSales Widget Loader] Widget not ready, keeping commands in queue');
      }
    } catch (error) {
      console.error('[iSales Widget Loader] Failed to process queue:', error);
    }
  }

  /**
   * Check for widget updates using safeFetch
   */
  async function checkForUpdates() {
    try {
      const manifestUrl = CONFIG.WIDGET_CDN.replace('/widget.js', '/manifest.json');

      console.warn('[iSales Widget] Checking for updates from:', manifestUrl);

      const response = await safeFetch(manifestUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const manifest = await response.json();
      const latestVersion = manifest.version;
      const currentVersion = CONFIG.VERSION;

      console.warn('[iSales Widget] Version check:', {
        current: currentVersion,
        latest: latestVersion,
        buildTime: CONFIG.BUILD_TIME,
      });

      if (latestVersion !== currentVersion) {
        console.warn(
          `[iSales Widget] New version available: ${latestVersion} (current: ${currentVersion})`
        );

        // Track update event
        trackPerformance('update_available');

        // Optional: Auto-reload if user has enabled it
        if (window.iSalesWidgetAutoUpdate !== false) {
          console.warn('[iSales Widget] Auto-updating to latest version...');
          setTimeout(() => {
            location.reload();
          }, 1000);
        }

        return {
          hasUpdate: true,
          currentVersion,
          latestVersion,
          manifest,
        };
      }

      return {
        hasUpdate: false,
        currentVersion,
        latestVersion,
        manifest,
      };
    } catch (error) {
      console.warn('[iSales Widget] Version check failed:', error.message);
      trackPerformance('version_check_error');

      return {
        hasUpdate: false,
        currentVersion: CONFIG.VERSION,
        error: error.message,
      };
    }
  }

  /**
   * Widget API proxy - Only includes methods that actually exist in the widget
   */
  const widgetAPI = {
    // Core methods
    init: init,
    open: (...args) => queueCommand('open', args),
    close: (...args) => queueCommand('close', args),
    toggle: (...args) => queueCommand('toggle', args),

    // Messaging
    sendMessage: (...args) => queueCommand('sendMessage', args),

    // User management
    identify: (...args) => queueCommand('identify', args),

    // Analytics
    track: (...args) => queueCommand('track', args),

    // Event handling
    on: (...args) => queueCommand('on', args),
    off: (...args) => queueCommand('off', args),

    // Navigation methods (that actually exist)
    navigateTo: (...args) => queueCommand('navigateTo', args),
    scrollToElement: (...args) => queueCommand('scrollToElement', args),
    sendCustomEvent: (...args) => queueCommand('sendCustomEvent', args),

    // Screenshot methods (that actually exist)
    captureElement: (...args) => queueCommand('captureElement', args),
    captureViewport: (...args) => queueCommand('captureViewport', args),

    // Utility methods
    destroy: (...args) => queueCommand('destroy', args),

    // Loader-specific methods
    getMetrics: () => window.iSalesWidgetMetrics || {},
    getHealth: () => ({
      version: CONFIG.VERSION,
      buildTime: CONFIG.BUILD_TIME,
      status: isWidgetLoaded ? 'loaded' : 'loading',
      loadingPromise: !!loadingPromise,
      timestamp: Date.now(),
    }),
    _version: CONFIG.VERSION,
    _buildTime: CONFIG.BUILD_TIME,

    // Version checking and auto-update
    checkForUpdates: async () => checkForUpdates(),
    getCurrentVersion: () => CONFIG.VERSION,
    getBuildTime: () => CONFIG.BUILD_TIME,

    // Auto-update control
    enableAutoUpdate: () => {
      window.iSalesWidgetAutoUpdate = true;
    },
    disableAutoUpdate: () => {
      window.iSalesWidgetAutoUpdate = false;
    },
    isAutoUpdateEnabled: () => window.iSalesWidgetAutoUpdate !== false,
  };

  // ✅ FIXED: Expose API without overwriting actual widget
  if (!window.iSalesWidget) {
    window.iSalesWidget = widgetAPI;
  } else if (Array.isArray(window.iSalesWidget)) {
    // Process existing queue if iSalesWidget is an array
    const existingQueue = window.iSalesWidget;
    window.iSalesWidget = widgetAPI;

    // Process existing commands
    existingQueue.forEach((cmd) => {
      if (Array.isArray(cmd) && cmd.length >= 2) {
        const [command, ...args] = cmd;
        if (typeof widgetAPI[command] === 'function') {
          widgetAPI[command](...args);
        }
      }
    });
  } else if (window.iSalesWidget && !window.iSalesWidget._isActualWidget) {
    // Only overwrite if it's not the actual widget
    window.iSalesWidget = widgetAPI;
  }

  // ✅ FIXED: Store loader API separately to avoid conflicts
  window.iSalesWidgetLoader = widgetAPI;

  // Auto-process queue when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processQueue);
  } else {
    setTimeout(processQueue, 0);
  }

  // Periodic version check (every 5 minutes, but not too aggressive)
  let versionCheckInterval;
  function startVersionCheck() {
    // Don't check too frequently
    if (versionCheckInterval) return;

    versionCheckInterval = setInterval(
      async () => {
        try {
          await checkForUpdates();
        } catch {
          // Silent fail - version checking is optional
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes
  }

  // Start version checking after widget is loaded
  setTimeout(startVersionCheck, 30000); // Wait 30 seconds before first check

  // Health check endpoint for monitoring
  if (typeof window !== 'undefined') {
    window.iSalesWidgetHealth = {
      version: CONFIG.VERSION,
      buildTime: CONFIG.BUILD_TIME,
      status: 'loading',
      loadingPromise: !!loadingPromise,
      timestamp: Date.now(),
      versionCheckActive: !!versionCheckInterval,
    };
  }
})(window, document);
