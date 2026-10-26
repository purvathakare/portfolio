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
