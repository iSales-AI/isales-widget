# 🤖 iSales AI Chatbot Widget

> Lightweight, embeddable AI-powered customer support widget

[![Latest Version](https://img.shields.io/github/v/tag/iSales-AI/isales-widget?label=version)](https://github.com/iSales-AI/isales-widget/releases)
[![CDN](https://img.shields.io/badge/CDN-JSDelivr-orange)](https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Quick Start

```html
<script>
  window.iSalesWidget = window.iSalesWidget || [];
  window.iSalesWidget.push(['init', {
    apiKey: 'YOUR_API_KEY',
    position: 'bottom-right',
    theme: 'auto'
  }]);
</script>
<script async src="https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/loader.js"></script>
```

## 📦 CDN URLs

### Recommended (Auto-updating)
- **Latest**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/loader.js`
- **Major v1**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1/loader.js`

### Version-Specific (Pinned)
- **v1.0.6**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.6/loader.js`
- **Minor v1.0**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0/loader.js`

## ⚙️ Configuration

```javascript
window.iSalesWidget.push(['init', {
  apiKey: 'your-api-key',
  position: 'bottom-right',  // bottom-left, top-right, top-left
  theme: 'auto',             // light, dark, auto
  primaryColor: '#3047ec',
  user: {
    id: 'user123',
    email: 'user@example.com',
    name: 'John Doe'
  }
}]);
```

## 🎯 API Methods

```javascript
// Control widget
window.iSalesWidget.push(['open']);
window.iSalesWidget.push(['close']);
window.iSalesWidget.push(['toggle']);

// Send messages
window.iSalesWidget.push(['sendMessage', 'Hello!']);
```

## 📊 Version Information

- **Current version**: v1.0.6
- **Major version**: v1
- **Minor version**: v1.0
- **Generated**: 2025-06-23T13:15:38.070Z

## 🔗 Links

- **Demo**: [Try the widget](https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/examples/demo.html)
- **Documentation**: [Full docs](https://docs.isales.ai)
- **Issues**: [Report bugs](https://github.com/iSales-AI/isales-widget/issues)

## 📄 License
MIT License

---
*Auto-generated from private repository*