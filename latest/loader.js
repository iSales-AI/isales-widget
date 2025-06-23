/**
 * iSales Widget Loader v1.0.6
 * Public CDN Distribution - Auto-generated
 */
(function(window, document) {
  'use strict';
  
  const CDN_BASE = 'https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest';
  const PREACT_URL = 'https://cdn.jsdelivr.net/npm/preact@10.26.9/dist/preact.min.js';
  const TIMEOUT = 10000;
  
  let loadingPromise = null;

  async function loadWidget(config) {
    if (!config?.apiKey) throw new Error('API key required');
    
    if (loadingPromise) return loadingPromise;
    
    loadingPromise = (async () => {
      try {
        // Load Preact first
        await loadScript(PREACT_URL);
        
        // Setup React compatibility
        if (window.preact && !window.React) {
          window.React = window.preact;
          window.ReactDOM = {
            render: window.preact.render,
            createRoot: (container) => ({
              render: (element) => window.preact.render(element, container)
            })
          };
        }
        
        // Load CSS (non-blocking)
        loadCSS(CDN_BASE + '/widget.css');
        
        // Load widget
        await loadScript(CDN_BASE + '/widget.js');
        
        // Initialize widget
        if (window.iSalesWidget?.init) {
          return window.iSalesWidget.init(config);
        } else {
          throw new Error('Widget not available after loading');
        }
      } catch (error) {
        console.error('[iSales Widget] Failed to load:', error);
        throw error;
      }
    })();

    return loadingPromise;
  }
  
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (src.includes('preact') && window.preact) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error('Script load timeout: ' + src));
      }, TIMEOUT);

      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error('Failed to load: ' + src));
      };
      
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    });
  }
  
  function loadCSS(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  
  // Widget API
  const api = {
    init: loadWidget,
    open: function() { console.warn('Widget not loaded yet'); },
    close: function() { console.warn('Widget not loaded yet'); },
    toggle: function() { console.warn('Widget not loaded yet'); },
    sendMessage: function() { console.warn('Widget not loaded yet'); },
    _version: '1.0.6'
  };
  
  // Initialize global API
  window.iSalesWidget = window.iSalesWidget || api;
  
  // Process existing queue
  if (Array.isArray(window.iSalesWidget)) {
    const queue = window.iSalesWidget;
    window.iSalesWidget = api;
    queue.forEach(cmd => {
      if (Array.isArray(cmd) && cmd[0] === 'init') {
        api.init(cmd[1]).catch(console.error);
      }
    });
  }
  
})(window, document);