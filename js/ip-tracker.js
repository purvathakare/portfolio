/**
 * Real-Time Visitor IP Address & Live Radar Tracker
 * Detects visitor's actual public IP address and connection telemetry in real time.
 * No made-up or synthetic visitor data.
 */

class VisitorRadarTracker {
  constructor() {
    this.sessionStartTime = Date.now();
    this.visitorData = {
      ip: 'Detecting...',
      city: 'Detecting...',
      region: '',
      country: 'Detecting...',
      isp: 'Detecting...',
      protocol: 'IPv4 / HTTPS',
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'Unknown OS',
      screenRes: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      visitorCount: 1
    };
  }

  async init() {
    this.updateDeviceSpecs();
    this.startSessionTimer();
    this.trackVisitorCount();
    await this.fetchVisitorNetworkData();
    this.recordRealVisit();
    this.dispatchCloudTelemetry();
    this.renderToDOM();
    this.renderVisitorRadarLog();
    this.initRadarScopeBlips();
  }

  updateDeviceSpecs() {
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

  // Live real-time public IP fetch with multi-provider fallback
  async fetchVisitorNetworkData() {
    // Provider 1: ipapi.co (Full Geo + ISP + Real IP)
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
          this.visitorData.protocol = data.version || 'IPv4';
          return;
        }
      }
    } catch (err) {
      console.warn("ipapi.co failed, trying ipwho.is...", err);
    }

    // Provider 2: ipwho.is (Fast, open CORS, full Geo + ISP)
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
          this.visitorData.protocol = data2.type || 'IPv4';
          return;
        }
      }
    } catch (err2) {
      console.warn("ipwho.is failed, trying ipify...", err2);
    }

    // Provider 3: api.ipify.org (Reliable Real-Time Public IP)
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
    } catch (err3) {
      console.warn("ipify fallback failed:", err3);
    }

    // If fully offline (airplane mode or sandbox test with no network)
    this.visitorData.ip = "Offline / Localhost";
    this.visitorData.city = "Localhost Interface";
    this.visitorData.country = "Local Dev Machine";
    this.visitorData.isp = "Local Loopback";
  }

  trackVisitorCount() {
    let visits = localStorage.getItem('purva_real_visit_count');
    if (!visits) {
      visits = 1;
    } else {
      visits = parseInt(visits, 10) + 1;
    }
    localStorage.setItem('purva_real_visit_count', visits);
    this.visitorData.visitorCount = visits;
  }

  recordRealVisit() {
    // Only record real IPs (skip placeholder / detecting strings)
    if (!this.visitorData.ip || this.visitorData.ip === 'Detecting...') return;

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
      location: locString || 'Detected Online',
      isp: this.visitorData.isp,
      os: `${this.visitorData.os} (${this.visitorData.browser})`,
      time: 'ACTIVE NOW',
      date: dateStr,
      isCurrent: true
    };

    // Filter out previous entries of the same IP so current shows at top
    storedHistory = storedHistory.filter(item => item.ip !== this.visitorData.ip);

    // Save with past entries having their recorded date
    storedHistory.forEach(item => { item.isCurrent = false; });
    storedHistory.unshift(currentEntry);

    // Keep up to 20 real visits
    if (storedHistory.length > 20) storedHistory = storedHistory.slice(0, 20);

    try {
      localStorage.setItem('purva_real_visitor_log', JSON.stringify(storedHistory));
    } catch (e) {}
  }

  // Cross-device cloud telemetry dispatch
  async dispatchCloudTelemetry() {
    if (!this.visitorData.ip || this.visitorData.ip === 'Detecting...' || this.visitorData.ip.includes('Offline')) {
      return;
    }

    // Prevent redundant dispatches in same browser tab/session
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

    // 1. Post to free open CORS pub/sub channel for cross-device visitor sync & mobile notifications
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
    } catch (err) {
      console.warn('Cloud telemetry notice:', err);
    }

    // 2. Post to custom webhook if configured by site owner (e.g. Discord / Telegram / Custom API)
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

  startSessionTimer() {
    const timerElem = document.getElementById('visitor-session-timer');
    if (!timerElem) return;

    setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      const minutes = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const seconds = String(elapsedSec % 60).padStart(2, '0');
      timerElem.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  renderToDOM() {
    // Top Telemetry Pill
    const hudIpElem = document.getElementById('hud-visitor-ip');
    if (hudIpElem) {
      hudIpElem.textContent = `IP: ${this.visitorData.ip}`;
      hudIpElem.title = `Your IP: ${this.visitorData.ip} | ${this.visitorData.city}, ${this.visitorData.country}`;
    }

    // Terminal / Radar Section Fields
    const ipDisplay = document.getElementById('terminal-visitor-ip');
    if (ipDisplay) ipDisplay.textContent = this.visitorData.ip;

    const locDisplay = document.getElementById('terminal-visitor-location');
    const locFull = [this.visitorData.city, this.visitorData.region, this.visitorData.country].filter(Boolean).join(', ');
    if (locDisplay) locDisplay.textContent = locFull || 'Detecting...';

    const ispDisplay = document.getElementById('terminal-visitor-isp');
    if (ispDisplay) ispDisplay.textContent = this.visitorData.isp;

    const osDisplay = document.getElementById('terminal-visitor-os');
    if (osDisplay) osDisplay.textContent = `${this.visitorData.os} (${this.visitorData.browser})`;

    const resDisplay = document.getElementById('terminal-visitor-res');
    if (resDisplay) resDisplay.textContent = this.visitorData.screenRes;

    const tzDisplay = document.getElementById('terminal-visitor-tz');
    if (tzDisplay) tzDisplay.textContent = this.visitorData.timezone;

    const countDisplay = document.getElementById('terminal-visitor-count');
    if (countDisplay) countDisplay.textContent = `#00${this.visitorData.visitorCount}`;
  }

  renderVisitorRadarLog() {
    const tableBody = document.getElementById('visitor-radar-log-tbody');
    if (!tableBody) return;

    let realHistory = [];
    try {
      const raw = localStorage.getItem('purva_real_visitor_log');
      if (raw) realHistory = JSON.parse(raw);
    } catch (e) {
      realHistory = [];
    }

    // If history is empty yet (first load), display current active session
    if (!realHistory || realHistory.length === 0) {
      const locString = [this.visitorData.city, this.visitorData.region, this.visitorData.country]
        .filter(Boolean)
        .join(', ');

      realHistory = [{
        ip: this.visitorData.ip,
        location: locString || 'Live Connection',
        isp: this.visitorData.isp,
        os: `${this.visitorData.os} (${this.visitorData.browser})`,
        time: 'ACTIVE NOW',
        isCurrent: true
      }];
    }

    tableBody.innerHTML = realHistory.map(v => `
      <tr class="${v.isCurrent ? 'row-current-user' : ''}">
        <td>
          <span style="font-family: var(--font-terminal); font-size: 1.25rem; color: ${v.isCurrent ? '#39ff14' : '#ffe66d'}; font-weight: bold;">
            ${v.ip}
          </span>
          ${v.isCurrent ? '<span class="badge-live-user">YOU</span>' : ''}
        </td>
        <td>${v.location}</td>
        <td style="color: #c8b6ff;">${v.isp}</td>
        <td>${v.os}</td>
        <td>
          <span class="${v.isCurrent ? 'badge-live-user' : 'badge-visitor'}">
            ${v.isCurrent ? 'ACTIVE NOW' : (v.date || v.time || 'Logged')}
          </span>
        </td>
      </tr>
    `).join('');
  }

  initRadarScopeBlips() {
    const scope = document.getElementById('radar-scope-container');
    if (!scope) return;

    // Remove existing blips
    scope.querySelectorAll('.radar-blip').forEach(el => el.remove());

    // Only plot blips for real visitors logged in history
    let realHistory = [];
    try {
      const raw = localStorage.getItem('purva_real_visitor_log');
      if (raw) realHistory = JSON.parse(raw);
    } catch (e) {
      realHistory = [];
    }

    // Always place active visitor blip
    const currentBlip = document.createElement('div');
    currentBlip.className = 'radar-blip';
    currentBlip.style.top = '42%';
    currentBlip.style.left = '48%';
    currentBlip.style.background = '#39ff14';
    currentBlip.style.boxShadow = '0 0 10px #39ff14';
    currentBlip.title = `YOU (${this.visitorData.ip})`;
    scope.appendChild(currentBlip);

    // If other real historical visits exist, plot them with hash-derived stable positions
    if (realHistory && realHistory.length > 1) {
      realHistory.slice(1, 6).forEach((item, idx) => {
        let hash = 0;
        for (let i = 0; i < item.ip.length; i++) {
          hash = (hash << 5) - hash + item.ip.charCodeAt(i);
          hash |= 0;
        }
        const angle = Math.abs(hash % 360) * (Math.PI / 180);
        const radius = 35 + Math.abs(hash % 50); // within 35% - 85% range
        const topPct = 50 + radius * 0.42 * Math.sin(angle);
        const leftPct = 50 + radius * 0.42 * Math.cos(angle);

        const blip = document.createElement('div');
        blip.className = 'radar-blip';
        blip.style.top = `${topPct}%`;
        blip.style.left = `${leftPct}%`;
        blip.style.background = '#00f0ff';
        blip.style.boxShadow = '0 0 8px #00f0ff';
        blip.title = `${item.ip} (${item.location})`;
        scope.appendChild(blip);
      });
    }
  }

  async pingRadar() {
    if (window.retroAudio) window.retroAudio.playPowerUp();
    await this.fetchVisitorNetworkData();
    this.recordRealVisit();
    this.renderToDOM();
    this.renderVisitorRadarLog();
    this.initRadarScopeBlips();

    const alertBox = document.getElementById('radar-ping-feedback');
    if (alertBox) {
      alertBox.textContent = `📡 Live IP Re-Scanned: ${this.visitorData.ip}`;
      setTimeout(() => { if (alertBox) alertBox.textContent = ''; }, 3500);
    }
  }

  // ===================================================================
  // ADMIN PORTAL // VISITOR SURVEILLANCE & CSV EXPORT METHODS
  // ===================================================================

  verifyAdminPin(enteredPin) {
    const validPin = localStorage.getItem('purva_admin_custom_pin') || 'purva2026';
    return Boolean(enteredPin && enteredPin.trim() === validPin.trim());
  }

  updateAdminPin(newPin) {
    if (newPin && newPin.trim().length >= 4) {
      localStorage.setItem('purva_admin_custom_pin', newPin.trim());
      return true;
    }
    return false;
  }

  saveCustomWebhook(url) {
    localStorage.setItem('purva_admin_custom_webhook', (url || '').trim());
  }

  async fetchCloudVisitorLogs() {
    const topic = 'purva_portfolio_visitor_ips_2026';
    const cloudVisits = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        lines.forEach(line => {
          if (!line.trim()) return;
          try {
            const data = JSON.parse(line);
            if (data.event === 'message' && data.message) {
              try {
                const parsed = JSON.parse(data.message);
                if (parsed.ip) {
                  cloudVisits.push(parsed);
                }
              } catch (e) {
                if (data.title && data.title.includes('Visitor IP:')) {
                  cloudVisits.push({
                    ip: data.title.replace('Visitor IP:', '').trim(),
                    location: 'Cloud Telemetry',
                    isp: 'Verified Provider',
                    os: 'Visitor Client',
                    time: new Date(data.time * 1000).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  });
                }
              }
            }
          } catch (e) {}
        });
      }
    } catch (err) {
      console.warn("Could not poll cloud telemetry:", err);
    }

    // Merge with local visits
    let localVisits = [];
    try {
      const raw = localStorage.getItem('purva_real_visitor_log');
      if (raw) localVisits = JSON.parse(raw);
    } catch (e) {}

    const combined = [...localVisits, ...cloudVisits];

    // Deduplicate by IP + timestamp/date
    const seen = new Set();
    const deduplicated = [];
    for (const v of combined) {
      if (!v.ip || v.ip === 'Detecting...') continue;
      const key = `${v.ip}_${v.time || v.date || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(v);
      }
    }

    // Ensure active visitor is at top if not already present
    if (this.visitorData.ip && this.visitorData.ip !== 'Detecting...' && !this.visitorData.ip.includes('Offline')) {
      const hasCurrent = deduplicated.some(v => v.ip === this.visitorData.ip);
      if (!hasCurrent) {
        const locString = [this.visitorData.city, this.visitorData.region, this.visitorData.country]
          .filter(Boolean)
          .join(', ');
        deduplicated.unshift({
          ip: this.visitorData.ip,
          location: locString || 'Live Connection',
          isp: this.visitorData.isp,
          os: `${this.visitorData.os} (${this.visitorData.browser})`,
          time: 'ACTIVE NOW',
          isCurrent: true
        });
      }
    }

    // Sort: active first, then recent
    deduplicated.sort((a, b) => {
      if (a.isCurrent || a.time === 'ACTIVE NOW') return -1;
      if (b.isCurrent || b.time === 'ACTIVE NOW') return 1;
      return 0;
    });

    try {
      localStorage.setItem('purva_all_admin_visitors', JSON.stringify(deduplicated));
    } catch (e) {}

    return deduplicated;
  }

  getAdminVisitorList() {
    let list = [];
    try {
      const raw = localStorage.getItem('purva_all_admin_visitors');
      if (raw) list = JSON.parse(raw);
    } catch (e) {}

    if (!list || list.length === 0) {
      try {
        const rawLocal = localStorage.getItem('purva_real_visitor_log');
        if (rawLocal) list = JSON.parse(rawLocal);
      } catch (e) {}
    }

    if (!list || list.length === 0) {
      if (this.visitorData.ip && this.visitorData.ip !== 'Detecting...') {
        const locString = [this.visitorData.city, this.visitorData.region, this.visitorData.country]
          .filter(Boolean)
          .join(', ');
        list = [{
          ip: this.visitorData.ip,
          location: locString || 'Live Connection',
          isp: this.visitorData.isp,
          os: `${this.visitorData.os} (${this.visitorData.browser})`,
          time: 'ACTIVE NOW',
          isCurrent: true
        }];
      }
    }

    return list || [];
  }

  renderAdminDashboard(filterText = '') {
    const list = this.getAdminVisitorList();
    const totalMetric = document.getElementById('admin-metric-total');
    const uniqueMetric = document.getElementById('admin-metric-unique');
    const tbody = document.getElementById('admin-visitor-tbody');

    if (totalMetric) totalMetric.textContent = list.length;

    // Count unique IPs
    const uniqueIPs = new Set(list.map(item => item.ip).filter(Boolean));
    if (uniqueMetric) uniqueMetric.textContent = uniqueIPs.size;

    if (!tbody) return;

    const query = (filterText || '').trim().toLowerCase();
    const filtered = list.filter(item => {
      if (!query) return true;
      const text = `${item.ip} ${item.location} ${item.isp} ${item.os} ${item.time || item.date || ''}`.toLowerCase();
      return text.includes(query);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 28px; color: #888888; font-size: 0.85rem;">
            ${query ? `No visitor IPs matched "${filterText}".` : 'No visitor records logged yet. Share your portfolio link to track visits!'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(v => {
      const isYou = v.isCurrent || (this.visitorData.ip && v.ip === this.visitorData.ip);
      return `
        <tr>
          <td>
            <span class="ip-mono-badge">${v.ip}</span>
            ${isYou ? '<span class="badge-live-user" style="margin-left: 4px; font-size: 0.65rem; padding: 1px 5px;">YOU</span>' : ''}
            <button class="btn-copy-ip" data-copy-ip="${v.ip}" title="Copy IP to clipboard">📋</button>
          </td>
          <td>${v.location || 'Detected Online'}</td>
          <td style="color: #6a4c93; font-weight: 600;">${v.isp || 'Verified Provider'}</td>
          <td style="font-size: 0.78rem;">${v.os || 'Visitor Client'}</td>
          <td>
            <span class="${isYou ? 'badge-live-user' : 'badge-visitor'}" style="font-size: 0.7rem; padding: 2px 7px;">
              ${isYou ? 'ACTIVE NOW' : (v.date || v.time || 'Logged')}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // Attach copy button handlers
    tbody.querySelectorAll('[data-copy-ip]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ipToCopy = btn.getAttribute('data-copy-ip');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ipToCopy).then(() => {
            const original = btn.textContent;
            btn.textContent = '✓ Copied';
            setTimeout(() => { btn.textContent = original; }, 1600);
          }).catch(() => {
            prompt('Copy IP address:', ipToCopy);
          });
        } else {
          prompt('Copy IP address:', ipToCopy);
        }
      });
    });
  }

  exportToCSV() {
    const list = this.getAdminVisitorList();
    if (!list || list.length === 0) {
      alert("No visitor IP records available to export yet.");
      return;
    }

    const headers = ["IP Address", "Location", "Network / ISP", "Device & Browser", "Timestamp"];
    const rows = list.map(item => [
      `"${(item.ip || '').replace(/"/g, '""')}"`,
      `"${(item.location || '').replace(/"/g, '""')}"`,
      `"${(item.isp || '').replace(/"/g, '""')}"`,
      `"${(item.os || '').replace(/"/g, '""')}"`,
      `"${(item.date || item.time || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateTag = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `purva_thakare_visitor_ips_${dateTag}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  clearVisitorLogs() {
    localStorage.removeItem('purva_real_visitor_log');
    localStorage.removeItem('purva_all_admin_visitors');
    this.renderVisitorRadarLog();
    this.renderAdminDashboard();
  }
}

// Global instance
window.visitorTracker = new VisitorRadarTracker();
document.addEventListener('DOMContentLoaded', () => {
  window.visitorTracker.init();

  const pingBtn = document.getElementById('btn-ping-radar');
  if (pingBtn) {
    pingBtn.addEventListener('click', () => {
      window.visitorTracker.pingRadar();
    });
  }
});
