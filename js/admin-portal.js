/**
 * Admin Portal Controller & IP Surveillance Center
 * Powers admin.html for Purva Thakare
 */

class AdminPortalManager {
  constructor() {
    this.adminIp = 'Detecting...';
    this.allVisits = [];
    this.currentFilter = '';
  }

  async init() {
    this.bindAuthEvents();
    this.bindDashboardEvents();

    if (this.isAuthenticated()) {
      this.showDashboard();
      await this.loadAdminData();
    } else {
      this.showPinGate();
    }
  }

  isAuthenticated() {
    return sessionStorage.getItem('purva_admin_auth') === 'true';
  }

  showPinGate() {
    const pinGate = document.getElementById('admin-pin-gate');
    const dashView = document.getElementById('admin-dashboard-view');
    if (pinGate) pinGate.style.display = 'block';
    if (dashView) dashView.style.display = 'none';

    const pinInput = document.getElementById('admin-pin-input');
    if (pinInput) {
      pinInput.value = '';
      setTimeout(() => pinInput.focus(), 100);
    }
  }

  showDashboard() {
    const pinGate = document.getElementById('admin-pin-gate');
    const dashView = document.getElementById('admin-dashboard-view');
    if (pinGate) pinGate.style.display = 'none';
    if (dashView) dashView.style.display = 'block';

    const customWebhookInput = document.getElementById('input-custom-webhook');
    if (customWebhookInput) {
      customWebhookInput.value = localStorage.getItem('purva_admin_custom_webhook') || '';
    }
  }

  bindAuthEvents() {
    const pinForm = document.getElementById('admin-pin-form');
    const pinInput = document.getElementById('admin-pin-input');
    const pinError = document.getElementById('admin-pin-error-msg');

    if (pinForm) {
      pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entered = (pinInput ? pinInput.value : '').trim();
        const validPin = localStorage.getItem('purva_admin_custom_pin') || 'purva2026';

        if (entered === validPin.trim()) {
          sessionStorage.setItem('purva_admin_auth', 'true');
          if (pinError) pinError.classList.remove('visible');
          if (window.retroAudio) window.retroAudio.playPowerUp();
          this.showDashboard();
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

    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('purva_admin_auth');
        if (window.retroAudio) window.retroAudio.playJump();
        this.showPinGate();
      });
    }
  }

  bindDashboardEvents() {
    // Search input filter
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter = e.target.value;
        this.renderTable();
      });
    }

    // Refresh logs button
    const refreshBtn = document.getElementById('btn-admin-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        if (window.retroAudio) window.retroAudio.playSelect();
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '🔄 Syncing...';
        await this.loadAdminData();
        setTimeout(() => { refreshBtn.innerHTML = originalText; }, 500);
      });
    }

    // Ping Radar button
    const pingRadarBtn = document.getElementById('btn-ping-radar');
    if (pingRadarBtn) {
      pingRadarBtn.addEventListener('click', async () => {
        if (window.retroAudio) window.retroAudio.playPowerUp();
        await this.detectAdminIp();
        await this.loadAdminData();
        const feedback = document.getElementById('radar-ping-feedback');
        if (feedback) {
          feedback.textContent = `📡 Telemetry Rescanned: ${this.adminIp}`;
          setTimeout(() => { feedback.textContent = ''; }, 3500);
        }
      });
    }

    // Export CSV button
    const exportBtn = document.getElementById('btn-admin-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (window.retroAudio) window.retroAudio.playPowerUp();
        this.exportToCSV();
      });
    }

    // Clear logs button
    const clearBtn = document.getElementById('btn-admin-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your local visitor IP records?')) {
          localStorage.removeItem('purva_real_visitor_log');
          localStorage.removeItem('purva_all_admin_visitors');
          this.allVisits = [];
          this.renderMetrics();
          this.renderTable();
          this.renderRadarBlips();
        }
      });
    }

    // Save Custom Webhook button
    const saveWebhookBtn = document.getElementById('btn-save-webhook');
    const customWebhookInput = document.getElementById('input-custom-webhook');
    const webhookStatus = document.getElementById('webhook-save-status');
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
    const savePinBtn = document.getElementById('btn-save-pin');
    const newPinInput = document.getElementById('input-change-pin');
    const pinStatus = document.getElementById('pin-save-status');
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

  async detectAdminIp() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (res.ok) {
        const d = await res.json();
        if (d.ip) this.adminIp = d.ip;
      }
    } catch (e) {
      this.adminIp = 'Local/Admin';
    }

    const adminIpDisplay = document.getElementById('admin-metric-myip');
    if (adminIpDisplay) adminIpDisplay.textContent = this.adminIp;
  }

  async loadAdminData() {
    await this.detectAdminIp();
    await this.fetchCloudLogs();
    this.renderMetrics();
    this.renderTable();
    this.renderRadarBlips();
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

    // Local visits
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

    const metricTotal = document.getElementById('admin-metric-total');
    const metricUnique = document.getElementById('admin-metric-unique');

    if (metricTotal) metricTotal.textContent = totalCount;
    if (metricUnique) metricUnique.textContent = uniqueIps.size;
  }

  renderTable() {
    const tbody = document.getElementById('admin-visitor-tbody');
    if (!tbody) return;

    const q = (this.currentFilter || '').trim().toLowerCase();
    const filtered = this.allVisits.filter(v => {
      if (!q) return true;
      const text = `${v.ip} ${v.location} ${v.isp} ${v.os} ${v.time || v.date || ''}`.toLowerCase();
      return text.includes(q);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: #888888; font-size: 0.9rem;">
            ${q ? `No visitor IPs matched "${this.currentFilter}".` : 'No visitor records found yet. Share your portfolio link to start receiving visitor logs!'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(v => {
      const isAdminCurrent = v.ip === this.adminIp;
      return `
        <tr>
          <td>
            <span class="ip-mono-badge">${v.ip}</span>
            ${isAdminCurrent ? '<span class="badge-live-user" style="margin-left: 4px; font-size: 0.65rem; padding: 1px 5px;">YOU</span>' : ''}
            <button class="btn-copy-ip" data-copy-ip="${v.ip}" title="Copy IP to clipboard">📋</button>
          </td>
          <td>${v.location || 'Detected Online'}</td>
          <td style="color: #6a4c93; font-weight: 600;">${v.isp || 'Verified Network'}</td>
          <td style="font-size: 0.78rem;">${v.os || 'Unknown Device'}</td>
          <td>
            <span class="${isAdminCurrent ? 'badge-live-user' : 'badge-visitor'}" style="font-size: 0.72rem; padding: 2px 7px;">
              ${v.time || v.date || 'Logged'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // Attach copy buttons
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

  renderRadarBlips() {
    const scope = document.getElementById('radar-scope-container');
    if (!scope) return;

    // Remove old blips
    scope.querySelectorAll('.radar-blip').forEach(el => el.remove());

    // Admin's own blip
    const adminBlip = document.createElement('div');
    adminBlip.className = 'radar-blip';
    adminBlip.style.top = '44%';
    adminBlip.style.left = '48%';
    adminBlip.style.background = '#39ff14';
    adminBlip.style.boxShadow = '0 0 10px #39ff14';
    adminBlip.title = `Admin Station (${this.adminIp})`;
    scope.appendChild(adminBlip);

    // Plot up to 8 distinct visitor blips with stable coordinates
    const otherVisits = this.allVisits.filter(v => v.ip !== this.adminIp);
    otherVisits.slice(0, 8).forEach(item => {
      let hash = 0;
      for (let i = 0; i < item.ip.length; i++) {
        hash = (hash << 5) - hash + item.ip.charCodeAt(i);
        hash |= 0;
      }
      const angle = Math.abs(hash % 360) * (Math.PI / 180);
      const radius = 30 + Math.abs(hash % 55);
      const topPct = 50 + radius * 0.42 * Math.sin(angle);
      const leftPct = 50 + radius * 0.42 * Math.cos(angle);

      const blip = document.createElement('div');
      blip.className = 'radar-blip';
      blip.style.top = `${topPct}%`;
      blip.style.left = `${leftPct}%`;
      blip.style.background = '#00f0ff';
      blip.style.boxShadow = '0 0 8px #00f0ff';
      blip.title = `${item.ip} (${item.location || 'Visitor'})`;
      scope.appendChild(blip);
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
}

// Global initialization
window.adminPortal = new AdminPortalManager();
document.addEventListener('DOMContentLoaded', () => {
  window.adminPortal.init();
});
