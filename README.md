# 🚀 AI-First Website Widget to Convert Visitors into Sales

> **Stop Losing Visitors. Start Closing Deals.** Our AI-powered widget instantly engages every visitor with intelligent chat, AI-assisted voice calls, and seamless scheduling—all without them ever leaving your site. Turn passive traffic into active, qualified leads.

[![iSales.ai](https://img.shields.io/badge/🌐%20Visit-isales.ai-4f46e5?style=for-the-badge&logoColor=white)](https://isales.ai)

[![Latest Version](https://img.shields.io/github/v/tag/iSales-AI/isales-widget?label=version&color=blue)](https://github.com/iSales-AI/isales-widget/releases)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-%3C50KB-success)](https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/)
[![JSDelivr](https://img.shields.io/badge/CDN-JSDelivr-ff5722)](https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/)
[![Statically](https://img.shields.io/badge/CDN-Statically-4CAF50)](https://cdn.statically.io/gh/iSales-AI/isales-widget/main/)
[![GitHack](https://img.shields.io/badge/CDN-GitHack-9C27B0)](https://raw.githack.com/iSales-AI/isales-widget/main/)

[![Preact](https://img.shields.io/badge/Framework-Preact%2010.x-673AB7)](https://preactjs.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-FF6B35)](https://github.com/pmndrs/zustand)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF)](https://vitejs.dev/)

[![GitHub issues](https://img.shields.io/github/issues/iSales-AI/isales-widget)](https://github.com/iSales-AI/isales-widget/issues)
[![GitHub forks](https://img.shields.io/github/forks/iSales-AI/isales-widget)](https://github.com/iSales-AI/isales-widget/network)
[![GitHub stars](https://img.shields.io/github/stars/iSales-AI/isales-widget)](https://github.com/iSales-AI/isales-widget/stargazers)

[![Build Status](https://img.shields.io/github/actions/workflow/status/iSales-AI/isales-widget/ci.yml?branch=main&label=build)](https://github.com/iSales-AI/isales-widget/actions)
[![Uptime](https://img.shields.io/uptimerobot/ratio/7/iSales-AI_isales-widget?label=CDN%20uptime)](https://status.jsdelivr.com/)
[![jsDelivr hits](https://img.shields.io/jsdelivr/gh/hm/iSales-AI/isales-widget?label=CDN%20hits&color=orange)](https://www.jsdelivr.com/package/gh/iSales-AI/isales-widget)
[![GitHub last commit](https://img.shields.io/github/last-commit/iSales-AI/isales-widget)](https://github.com/iSales-AI/isales-widget/commits)
[![GitHub release date](https://img.shields.io/github/release-date/iSales-AI/isales-widget)](https://github.com/iSales-AI/isales-widget/releases)

<details>
<summary>📊 <strong>Badge Legend</strong></summary>

### 🔄 Status & Metrics
- **Version**: Current release version
- **Bundle Size**: Total gzipped size (target: <50KB)
- **Build Status**: CI/CD pipeline status
- **CDN Uptime**: JSDelivr availability
- **CDN Hits**: Monthly download count
- **Last Commit**: Development activity
- **Release Date**: Latest version release

### 🌐 CDN Availability  
- **JSDelivr**: Primary CDN (global edge network)
- **Statically**: Fast alternative CDN
- **GitHack**: Developer-friendly CDN

### 🛠️ Tech Stack
- **Preact**: Lightweight React alternative (3KB)
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Vite**: Fast build tool

### 📈 Community
- **Issues**: Bug reports and feature requests
- **Forks**: Community contributions
- **Stars**: Project popularity

</details>

## ✨ How You'll Win

Deploy a tireless AI sales agent that works 24/7. Watch your conversion rates and customer satisfaction soar.

### 🎯 **AI Chat That Sells While You Sleep**
Instantly answer questions, qualify prospects, and capture leads around the clock. Our AI guides visitors toward a sale, turning curiosity into conversion.
> **Result:** +38% more qualified leads captured overnight

### 📞 **First-Response Voice Calls (<10s)**
Connect hot prospects with human-like AI voice instantly. AI handles initial engagement, your reps focus on qualified leads only.
> **Result:** Triple your speed-to-lead, focus on high-value calls

### 📅 **One-Click Smart Scheduling**
Eliminate back-and-forth emails. Direct Calendly, Google Calendar & Cal.com integration. Your pipeline fills itself.
> **Result:** 40%+ increase in booked demos and sales meetings

### 🧭 **Proactive Site Navigator**
AI anticipates visitor needs, guides them to the right pages, resolves 80% of support queries instantly.
> **Result:** Slash support tickets, dramatically improve UX

## 🏆 Industry Success Stories

**🏠 Real Estate**: +47% qualified leads, 34% higher showing attendance  
**💻 SaaS**: +41% demo bookings, 28% more trial sign-ups  
**🛒 E-commerce**: +22% add-to-cart rate, 18% cart recovery  
**👤 Creators**: 2x session time, 31% more client bookings  

## 🚀 Get Your AI Widget Free in 60 Seconds

**Step 1:** Get your API key at [isales.ai](https://isales.ai)  
**Step 2:** Add this single line to your website:

```html
<script>
  window.iSalesWidget = window.iSalesWidget || [];
  window.iSalesWidget.push(['init', {
    // Required
    apiKey: 'YOUR_API_KEY',                    // ← Get yours at isales.ai
    
    // UI Configuration
    position: 'bottom-right',                  // 'bottom-right' | 'bottom-left'
    theme: 'light',                           // 'light' | 'dark' | 'auto'
    primaryColor: '#000000',                  // Hex color for branding
    locale: 'en-US',                          // Language locale (en-US, es-ES, fr-FR, etc.)
    
    // Social Media Integration (optional)
    instagram: 'https://instagram.com/yourhandle',     // Instagram profile URL with iSales AI Chatbot Agent
    telegram: 'https://t.me/yourusername',             // Telegram chat URL with iSales AI Chatbot Agent
    whatsapp: 'https://wa.me/1234567890',              // WhatsApp number URL with iSales AI Chatbot Agent
    
    // AI Voice Integration (optional)
    elevenlabs_agent_id: 'your-agent-id',             // ElevenLabs AI agent ID
    
    // Google Calendar Integration (optional)
    calendar_embedding_code: '<iframe src="..."></iframe>',  // Use and embed custom calendar HTML for Google Calendar, or direct links for Cal.com or Calendly or anything else
  }]);
</script>
<script async src="https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/loader.js"></script>
```

**Step 3:** Watch your conversions soar! 📈

> **💡 Pro Tip:** Start with our free tier - no credit card required.

## 📦 CDN URLs

### 🚀 Recommended CDNs (Auto-updating)

#### JSDelivr (Primary - Fastest Global CDN)
- **Latest**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/loader.js`
- **Major v1**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1/loader.js`

#### Statically (Fast Alternative)
- **Latest**: `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/latest/loader.js`
- **Major v1**: `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1/loader.js`

#### GitHack (Developer-Friendly)
- **Latest**: `https://raw.githack.com/iSales-AI/isales-widget/main/latest/loader.js`
- **Major v1**: `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1/loader.js`

#### GitHub Raw (Basic, No Caching)
- **Latest**: `https://raw.githubusercontent.com/iSales-AI/isales-widget/main/latest/loader.js`
- **Major v1**: `https://raw.githubusercontent.com/iSales-AI/isales-widget/main/versions/v1/loader.js`

### 📌 Version-Specific (Pinned)

#### JSDelivr
- **v1.0.22**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.22/loader.js`
- **Minor v1.0**: `https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0/loader.js`

#### Statically  
- **v1.0.22**: `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0.22/loader.js`
- **Minor v1.0**: `https://cdn.statically.io/gh/iSales-AI/isales-widget/main/versions/v1.0/loader.js`

#### GitHack
- **v1.0.22**: `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0.22/loader.js`
- **Minor v1.0**: `https://raw.githack.com/iSales-AI/isales-widget/main/versions/v1.0/loader.js`

### 🔄 CDN Comparison

| CDN | Speed | Reliability | Features | Best For |
|-----|-------|-------------|----------|----------|
| **JSDelivr** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Global edge, Auto-minify | Production |
| **Statically** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Fast, Simple | Alternative |
| **GitHack** | ⭐⭐⭐ | ⭐⭐⭐ | No rate limits | Development |
| **GitHub Raw** | ⭐⭐ | ⭐⭐⭐ | Direct, No caching | Testing |

### 🎯 CDN Selection Guide

Choose the right CDN for your use case:

```javascript
// 🚀 Production (Recommended)
<script src="https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/latest/loader.js"></script>

// 🔄 High Performance Alternative  
<script src="https://cdn.statically.io/gh/iSales-AI/isales-widget/main/latest/loader.js"></script>

// 🧪 Development/Testing
<script src="https://raw.githack.com/iSales-AI/isales-widget/main/latest/loader.js"></script>

// 📦 Version-Pinned (Production)
<script src="https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/versions/v1.0.22/loader.js"></script>
```

**Performance Tips:**
- Use JSDelivr for production (best global performance)
- Pin to specific versions for critical applications
- Test with GitHack during development
- Monitor CDN status at [JSDelivr Status](https://status.jsdelivr.com/)

## ⚙️ Configuration

### 📋 Complete Configuration Options

```javascript
window.iSalesWidget.push(['init', {
  // Required
  apiKey: 'your-api-key',                     // Your iSales.ai API key
  
  // UI Configuration
  position: 'bottom-right',                   // 'bottom-right' | 'bottom-left'
  theme: 'light',                            // 'light' | 'dark' | 'auto'
  primaryColor: '#000000',                   // Hex color for branding
  locale: 'en-US',                           // Language locale (en-US, es-ES, fr-FR, etc.)
  
  // Social Media Integration (optional)
  instagram: 'https://instagram.com/yourhandle',       // Instagram profile URL
  telegram: 'https://t.me/yourusername',               // Telegram chat URL  
  whatsapp: 'https://wa.me/1234567890',                // WhatsApp number URL
  
  // AI Voice Integration (optional)
  elevenlabs_agent_id: 'your-agent-id',               // ElevenLabs AI agent ID
  
  // Calendar Integration (optional)
  calendar_embedding_code: '<iframe src="..."></iframe>',      // Custom calendar HTML, or direct links for Cal.com or Calendly or anything else
}]);
```

### 🎯 Quick Start (Minimal)

```javascript
window.iSalesWidget.push(['init', {
  apiKey: 'your-api-key',
  position: 'bottom-right',
  theme: 'light'
}]);
```

### 🚀 Production Ready (Full Features)

```javascript
window.iSalesWidget.push(['init', {
  apiKey: 'your-api-key',
  position: 'bottom-right',
  theme: 'auto',
  primaryColor: '#4f46e5',
  locale: 'en-US',
  whatsapp: 'https://wa.me/1234567890',
  telegram: 'https://t.me/yoursupport',
  calendar_embedding_code: 'https://calendly.com/yourteam',
  elevenlabs_agent_id: 'agent-xyz123'
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

## 🎯 Ready to Transform Your Website?

**The numbers don't lie:** Websites with AI chat widgets see 40-60% higher conversion rates. Your competitors are already using AI to capture leads while you sleep.

### 🚀 **Get Started Now**
- **Free Tier**: 1,000 conversations/month, all features included
- **No Setup Fees**: Deploy in under 60 seconds
- **Cancel Anytime**: No contracts, no commitments

[![Start Free Trial](https://img.shields.io/badge/🚀%20Start%20Free%20Trial-isales.ai-success?style=for-the-badge)](https://isales.ai)

---

## 📊 Version Information

- **Latest Release**: v1.0.22 (2025-06-25)
- **Next-Gen AI**: Powered by advanced language models
- **Enterprise Ready**: 99.9% uptime, SOC2 compliant

## 🔗 Resources

- **🎮 Live Demo**: [Try the widget](https://cdn.jsdelivr.net/gh/iSales-AI/isales-widget@main/examples/demo.html)
- **📚 Full Documentation**: [Complete setup guide](https://isales.ai/docs/welcome-to-isales-chatbot)  
- **💬 Get Support**: [Help center](https://t.me/isales_ai)
- **🐛 Report Issues**: [GitHub Issues](https://github.com/iSales-AI/isales-widget/issues)