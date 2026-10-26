/**
 * Visitor Telemetry & Contact Section Admin IP Center
 * Silently logs real visitors in background; reveals IP surveillance log ONLY to admin inside Contact section.
 */

class ContactAdminTelemetry {
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
    this.allVisits = [];
    this.searchFilter = '';
  }

  async init() {
    this.detectDeviceSpecs();
    this.bindAdminContactEvents();
    this.bindShortcut();

    // Check if admin is already logged in during this session
    if (this.isAdminAuthenticated()) {
      this.showUnlockedAdmin();
      await this.loadAdminData();
    } else {
      this.showLockedAdmin();
    }

    // Run silent background telemetry for current visitor
    await this.resolvePublicNetworkData();
    this.recordLocalVisit();
    this.dispatchCloudTelemetry();

    // If admin is unlocked, refresh view with current visit
    if (this.isAdminAuthenticated()) {
      await this.loadAdminData();
    }
  }

  isAdminAuthenticated() {
    return sessionStorage.getItem('purva_admin_auth') === 'true';
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

    // Filter duplicates and keep latest 30 visits
    storedHistory = storedHistory.filter(item => item.ip !== this.visitorData.ip);
    storedHistory.unshift(currentEntry);
    if (storedHistory.length > 30) storedHistory = storedHistory.slice(0, 30);

    try {
      localStorage.setItem('purva_real_visitor_log', JSON.stringify(storedHistory));
    } catch (e) {}
  }

  async dispatchCloudTelemetry() {
    if (!this.visitorData.ip) return;

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

    // 1. Send to cloud pub/sub channel for cross-device visitor sync
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

    // 2. Send to custom webhook if configured
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

  // ===================================================================
  // CONTACT SECTION ADMIN VAULT LOGIC
  // ===================================================================

  showLockedAdmin() {
    const locked = document.getElementById('contact-admin-locked');
    const unlocked = document.getElementById('contact-admin-unlocked');
    if (locked) locked.style.display = 'block';
    if (unlocked) unlocked.style.display = 'none';

    const pinInput = document.getElementById('contact-admin-pin-input');
    if (pinInput) pinInput.value = '';
  }

  showUnlockedAdmin() {
    const locked = document.getElementById('contact-admin-locked');
    const unlocked = document.getElementById('contact-admin-unlocked');
    if (locked) locked.style.display = 'none';
    if (unlocked) unlocked.style.display = 'block';

    const customWebhookInput = document.getElementById('contact-custom-webhook');
    if (customWebhookInput) {
      customWebhookInput.value = localStorage.getItem('purva_admin_custom_webhook') || '';
    }
  }

  bindAdminContactEvents() {
    const pinForm = document.getElementById('contact-admin-pin-form');
    const pinInput = document.getElementById('contact-admin-pin-input');
    const pinError = document.getElementById('contact-admin-pin-error');

    if (pinForm) {
      pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entered = (pinInput ? pinInput.value : '').trim();
        const validPin = localStorage.getItem('purva_admin_custom_pin') || 'purva2026';

        if (entered === validPin.trim()) {
          sessionStorage.setItem('purva_admin_auth', 'true');
          if (pinError) pinError.classList.remove('visible');
          if (window.retroAudio) window.retroAudio.playPowerUp();
          this.showUnlockedAdmin();
          await this.loadAdminData();
        } else {
          if (pinError) pinError.classList.add('visible');
          if (pinInput) {
            pinInput.focus();
            pinInput.select();
          }
        }
      });
    }

    // Lock button
    const lockBtn = document.getElementById('btn-contact-admin-lock');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        sessionStorage.removeItem('purva_admin_auth');
        if (window.retroAudio) window.retroAudio.playJump();
        this.showLockedAdmin();
      });
    }

    // Search input
    const searchInput = document.getElementById('contact-admin-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchFilter = e.target.value;
        this.renderTable();
      });
    }

    // Refresh logs button
    const refreshBtn = document.getElementById('btn-contact-admin-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        if (window.retroAudio) window.retroAudio.playSelect();
        const original = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '🔄 Syncing...';
        await this.loadAdminData();
        setTimeout(() => { refreshBtn.innerHTML = original; }, 500);
      });
    }

    // Export CSV button
    const exportBtn = document.getElementById('btn-contact-admin-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (window.retroAudio) window.retroAudio.playPowerUp();
        this.exportToCSV();
      });
    }

    // Clear logs button
    const clearBtn = document.getElementById('btn-contact-admin-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your local visitor IP records?')) {
          localStorage.removeItem('purva_real_visitor_log');
          localStorage.removeItem('purva_all_admin_visitors');
          this.allVisits = [];
          this.renderMetrics();
          this.renderTable();
        }
      });
    }

    // Save Custom Webhook button
    const saveWebhookBtn = document.getElementById('btn-contact-save-webhook');
    const customWebhookInput = document.getElementById('contact-custom-webhook');
    const webhookStatus = document.getElementById('contact-webhook-status');
    if (saveWebhookBtn && customWebhookInput) {
      saveWebhookBtn.addEventListener('click', () => {
        const val = customWebhookInput.value.trim();
        localStorage.setItem('purva_admin_custom_webhook', val);
        if (webhookStatus) {
          webhookStatus.style.display = 'block';
          setTimeout(() => { webhookStatus.style.display = 'none'; }, 3000);
        }
      });
    }

    // Update PIN button
    const savePinBtn = document.getElementById('btn-contact-save-pin');
    const newPinInput = document.getElementById('contact-change-pin');
    const pinStatus = document.getElementById('contact-pin-status');
    if (savePinBtn && newPinInput) {
      savePinBtn.addEventListener('click', () => {
        const val = newPinInput.value.trim();
        if (val.length >= 4) {
          localStorage.setItem('purva_admin_custom_pin', val);
          newPinInput.value = '';
          if (pinStatus) {
            pinStatus.textContent = 'Admin PIN updated successfully!';
            pinStatus.style.color = '#2e7d32';
            pinStatus.style.display = 'block';
            setTimeout(() => { pinStatus.style.display = 'none'; }, 3000);
          }
        } else {
          alert('Admin PIN must be at least 4 characters long.');
        }
      });
    }
  }

  async loadAdminData() {
    await this.fetchCloudLogs();
    this.renderMetrics();
    this.renderTable();
  }

  async fetchCloudLogs() {
    const topic = 'purva_portfolio_visitor_ips_2026';
    let cloudVisits = [];

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
                if (parsed.ip) cloudVisits.push(parsed);
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
    } catch (e) {}

    // Merge with local visits
    let localVisits = [];
    try {
      const raw = localStorage.getItem('purva_real_visitor_log');
      if (raw) localVisits = JSON.parse(raw);
    } catch (e) {}

    const combined = [...localVisits, ...cloudVisits];

    // Deduplicate by IP + date
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

    try {
      localStorage.setItem('purva_all_admin_visitors', JSON.stringify(deduplicated));
    } catch (e) {}

    this.allVisits = deduplicated;
  }

  renderMetrics() {
    const totalCount = this.allVisits.length;
    const uniqueIps = new Set(this.allVisits.map(v => v.ip).filter(Boolean));

    const metricTotal = document.getElementById('contact-metric-total');
    const metricUnique = document.getElementById('contact-metric-unique');

    if (metricTotal) metricTotal.textContent = totalCount;
    if (metricUnique) metricUnique.textContent = uniqueIps.size;
  }

  renderTable() {
    const tbody = document.getElementById('contact-admin-tbody');
    if (!tbody) return;

    const q = (this.searchFilter || '').trim().toLowerCase();
    const filtered = this.allVisits.filter(v => {
      if (!q) return true;
      const text = `${v.ip} ${v.location} ${v.isp} ${v.os} ${v.time || v.date || ''}`.toLowerCase();
      return text.includes(q);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 26px; color: #888888; font-size: 0.85rem;">
            ${q ? `No visitor IPs matched "${this.searchFilter}".` : 'No visitor records recorded yet. Share your portfolio link to view incoming visitor IPs!'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(v => {
      const isYou = this.visitorData.ip && v.ip === this.visitorData.ip;
      return `
        <tr>
          <td>
            <span class="ip-mono-badge">${v.ip}</span>
            ${isYou ? '<span class="badge-live-user" style="margin-left: 4px; font-size: 0.65rem; padding: 1px 5px;">YOU</span>' : ''}
            <button class="btn-copy-ip" data-copy-ip="${v.ip}" title="Copy IP to clipboard">📋</button>
          </td>
          <td>${v.location || 'Detected Online'}</td>
          <td style="color: #6a4c93; font-weight: 600;">${v.isp || 'Verified Provider'}</td>
          <td style="font-size: 0.78rem;">${v.os || 'Unknown Device'}</td>
          <td>
            <span class="${isYou ? 'badge-live-user' : 'badge-visitor'}" style="font-size: 0.7rem; padding: 2px 7px;">
              ${v.time || v.date || 'Logged'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // Attach copy button listeners
    tbody.querySelectorAll('[data-copy-ip]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ip = btn.getAttribute('data-copy-ip');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ip).then(() => {
            const original = btn.textContent;
            btn.textContent = '✓ Copied';
            setTimeout(() => { btn.textContent = original; }, 1500);
          }).catch(() => prompt('Copy IP address:', ip));
        } else {
          prompt('Copy IP address:', ip);
        }
      });
    });
  }

  exportToCSV() {
    if (!this.allVisits || this.allVisits.length === 0) {
      alert('No visitor IP records available to export yet.');
      return;
    }

    const headers = ["IP Address", "Location", "Network / ISP", "Device & Browser", "Timestamp"];
    const rows = this.allVisits.map(item => [
      `"${(item.ip || '').replace(/"/g, '""')}"`,
      `"${(item.location || '').replace(/"/g, '""')}"`,
      `"${(item.isp || '').replace(/"/g, '""')}"`,
      `"${(item.os || '').replace(/"/g, '""')}"`,
      `"${(item.time || item.date || '').replace(/"/g, '""')}"`
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

  bindShortcut() {
    // Secret hotkey Ctrl+Shift+A smoothly jumps to Contact section and focuses admin PIN input
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        const contactBtn = document.querySelector('[data-stage="contact"]');
        if (contactBtn) contactBtn.click();
        const vault = document.getElementById('admin-contact-section');
        if (vault) {
          vault.scrollIntoView({ behavior: 'smooth' });
          const pinInput = document.getElementById('contact-admin-pin-input');
          if (pinInput && !this.isAdminAuthenticated()) {
            setTimeout(() => pinInput.focus(), 300);
          }
        }
      }
    });
  }
}

// Global initialization
window.contactAdmin = new ContactAdminTelemetry();
document.addEventListener('DOMContentLoaded', () => {
  window.contactAdmin.init();
});
