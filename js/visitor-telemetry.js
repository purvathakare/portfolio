/**
 * Silent Visitor Telemetry Tracker (Public Portfolio)
 * Records real visitor public IP & geo-connection in the background for the Admin Portal.
 * Does NOT display any IP or telemetry information on the public site.
 */

class SilentVisitorTelemetry {
  constructor() {
    this.visitorData = {
      ip: '',
      city: '',
      region: '',
      country: '',
      isp: '',
      browser: 'Modern Browser',
      os: 'Modern OS',
      time: ''
    };
  }

  async init() {
    this.detectDeviceSpecs();
    await this.resolvePublicNetworkData();
    this.recordLocalVisit();
    this.dispatchCloudTelemetry();
    this.bindAdminShortcut();
  }

  detectDeviceSpecs() {
    const ua = navigator.userAgent;
    let browserName = "Modern Browser";
    let osName = "Modern OS";

    if (ua.indexOf("Firefox") > -1) browserName = "Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) browserName = "Samsung Internet";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browserName = "Opera";
    else if (ua.indexOf("Trident") > -1) browserName = "IE";
    else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) browserName = "Edge";
    else if (ua.indexOf("Chrome") > -1) browserName = "Chrome";
    else if (ua.indexOf("Safari") > -1) browserName = "Safari";

    if (ua.indexOf("Win") > -1) osName = "Windows";
    else if (ua.indexOf("Mac") > -1) osName = "macOS";
    else if (ua.indexOf("Linux") > -1) osName = "Linux";
    else if (ua.indexOf("Android") > -1) osName = "Android";
    else if (ua.indexOf("like Mac") > -1) osName = "iOS";

    this.visitorData.browser = browserName;
    this.visitorData.os = osName;
  }

  async resolvePublicNetworkData() {
    // Provider 1: ipapi.co
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.ip) {
          this.visitorData.ip = data.ip;
          this.visitorData.city = data.city || '';
          this.visitorData.region = data.region || '';
          this.visitorData.country = data.country_name || (data.country || 'Global');
          this.visitorData.isp = data.org || 'Verified ISP';
          return;
        }
      }
    } catch (e) {}

    // Provider 2: ipwho.is
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3500);
      const res2 = await fetch('https://ipwho.is/', { signal: controller2.signal });
      clearTimeout(timeoutId2);

      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.success && data2.ip) {
          this.visitorData.ip = data2.ip;
          this.visitorData.city = data2.city || '';
          this.visitorData.region = data2.region || '';
          this.visitorData.country = data2.country || 'Global';
          this.visitorData.isp = (data2.connection && data2.connection.isp) ? data2.connection.isp : 'Internet Service Provider';
          return;
        }
      }
    } catch (e) {}

    // Provider 3: api.ipify.org
    try {
      const res3 = await fetch('https://api.ipify.org?format=json');
      if (res3.ok) {
        const data3 = await res3.json();
        if (data3.ip) {
          this.visitorData.ip = data3.ip;
          this.visitorData.city = "Live Connection";
          this.visitorData.country = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Global';
          this.visitorData.isp = "Verified Public IP Client";
          return;
        }
      }
    } catch (e) {}
  }

  recordLocalVisit() {
    if (!this.visitorData.ip) return;

    let storedHistory = [];
    try {
      const raw = localStorage.getItem('purva_real_visitor_log');
      if (raw) storedHistory = JSON.parse(raw);
    } catch (e) {
      storedHistory = [];
    }

    const locString = [this.visitorData.city, this.visitorData.region, this.visitorData.country]
      .filter(Boolean)
      .join(', ');

    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const currentEntry = {
      ip: this.visitorData.ip,
      location: locString || 'Live Connection',
      isp: this.visitorData.isp || 'Verified Provider',
      os: `${this.visitorData.os} (${this.visitorData.browser})`,
      time: dateStr,
      date: dateStr,
      timestamp: Date.now()
    };

    // Filter out duplicates and keep latest 30 visits
    storedHistory = storedHistory.filter(item => item.ip !== this.visitorData.ip);
    storedHistory.unshift(currentEntry);
    if (storedHistory.length > 30) storedHistory = storedHistory.slice(0, 30);

    try {
      localStorage.setItem('purva_real_visitor_log', JSON.stringify(storedHistory));
    } catch (e) {}
  }

  async dispatchCloudTelemetry() {
    if (!this.visitorData.ip) return;

    // Prevent redundant ping in same tab session
    if (sessionStorage.getItem('purva_telemetry_sent') === this.visitorData.ip) {
      return;
    }

    const locString = [this.visitorData.city, this.visitorData.region, this.visitorData.country]
      .filter(Boolean)
      .join(', ');

    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const payload = {
      ip: this.visitorData.ip,
      location: locString || 'Live Connection',
      isp: this.visitorData.isp || 'Verified Client',
      os: `${this.visitorData.os} (${this.visitorData.browser})`,
      time: dateStr,
      timestamp: Date.now()
    };

    // 1. Send to cloud pub/sub topic for Admin Portal cross-device sync
    try {
      const topic = 'purva_portfolio_visitor_ips_2026';
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Title': `Visitor IP: ${payload.ip} (${payload.location})`,
          'Priority': 'default',
          'Tags': 'globe_with_meridians,round_pushpin'
        },
        body: JSON.stringify(payload)
      });
      sessionStorage.setItem('purva_telemetry_sent', this.visitorData.ip);
    } catch (e) {}

    // 2. Send to custom webhook if configured in admin settings
    try {
      const customWebhook = localStorage.getItem('purva_admin_custom_webhook');
      if (customWebhook && customWebhook.startsWith('http')) {
        const isDiscord = customWebhook.includes('discord.com/api/webhooks');
        const bodyContent = isDiscord ? JSON.stringify({
          content: `🚨 **New Portfolio Visitor Detected!**\n**IP:** \`${payload.ip}\`\n**Location:** ${payload.location}\n**Network:** ${payload.isp}\n**Device:** ${payload.os}\n**Time:** ${payload.time}`
        }) : JSON.stringify(payload);

        fetch(customWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyContent
        }).catch(() => {});
      }
    } catch (e) {}
  }

  bindAdminShortcut() {
    // Secret hotkey for site owner to jump directly to admin.html
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.href = 'admin.html';
      }
    });
  }
}

// Initialize silent telemetry on public page load
document.addEventListener('DOMContentLoaded', () => {
  const telemetry = new SilentVisitorTelemetry();
  telemetry.init();
});
