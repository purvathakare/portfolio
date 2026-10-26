/**
 * Manila Folder & Scrapbook Navigation Controller
 * Handles pill navigation, project modals, and stage transitions
 */

document.addEventListener('DOMContentLoaded', () => {

  // ===================================================================
  // 1. PILL NAVIGATION SWITCHER
  // ===================================================================
  function switchScrapbookStage(stageId, shouldScroll = true) {
    const targetStage = document.getElementById(`stage-${stageId}`);
    if (!targetStage) return;

    // 1. Hide all stages and activate target
    document.querySelectorAll('.scrapbook-stage').forEach(stage => {
      stage.classList.remove('active-stage');
    });
    targetStage.classList.add('active-stage');

    // Toggle body class for cover stage (hides top pill nav on homepage)
    if (stageId === 'cover') {
      document.body.classList.add('stage-cover-active');
    } else {
      document.body.classList.remove('stage-cover-active');
    }

    // 2. Update active pill in top nav
    document.querySelectorAll('.nav-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-stage') === stageId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Update URL hash
    if (history.pushState) {
      history.pushState(null, null, `#${stageId}`);
    } else {
      location.hash = `#${stageId}`;
    }

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Bind top pill buttons
  document.querySelectorAll('.nav-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.retroAudio) window.retroAudio.playSelect();
      const stage = btn.getAttribute('data-stage');
      switchScrapbookStage(stage);
    });
  });

  // Bind next / prev jump buttons
  document.querySelectorAll('[data-target-stage]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.retroAudio) window.retroAudio.playJump();
      const target = btn.getAttribute('data-target-stage');
      if (target) switchScrapbookStage(target);
    });
  });

  // Check URL hash on initial load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(`stage-${initialHash}`)) {
    switchScrapbookStage(initialHash, false);
  } else {
    // Default to folder cover or about me
    switchScrapbookStage('cover', false);
  }

  // Browser back/forward navigation
  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '') || 'cover';
    if (document.getElementById(`stage-${currentHash}`)) {
      switchScrapbookStage(currentHash, true);
    }
  });

  // IP radar badge click
  const hudIpPill = document.getElementById('hud-visitor-ip');
  if (hudIpPill) {
    hudIpPill.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.retroAudio) window.retroAudio.playSelect();
      switchScrapbookStage('radar');
    });
  }

  // ===================================================================
  // 2. PROJECT MODAL LOGIC
  // ===================================================================
  const questModal = document.getElementById('quest-detail-modal');
  const modalTitle = document.getElementById('modal-quest-title');
  const modalBody = document.getElementById('modal-quest-body');
  const modalClose = document.getElementById('modal-close');

  const projectDetails = {
    'spotify': {
      title: "🎧 Spotify Recommender System",
      period: "Jan 2025 - Apr 2025",
      tech: "Python, Scikit-learn, Spotify Web API, Spotipy, Cosine Similarity, Pandas",
      status: "COMPLETED",
      description: "Engineered a personalized music recommendation engine that computes high-dimensional feature distances between acoustic metadata vectors. Integrated the official Spotify API to analyze tempo, valence, energy, and acousticness.",
      highlights: [
        "Implemented content-based filtering algorithms using cosine distance matrices across 50,000+ songs.",
        "Built dynamic Spotify API data ingestion pipelines to retrieve real-time audio analysis features.",
        "Created an interactive user interface allowing listeners to generate tailored 20-track playlists matching their current vibe."
      ],
      github: "https://github.com/purvathakare/spotify-recommender"
    },
    'chatbot': {
      title: "🧠 NLP Mental Health Chatbot",
      period: "Jul 2025 - Dec 2025",
      tech: "Python, Natural Language Processing (NLP), NLTK, Scikit-learn, Machine Learning, Flask",
      status: "COMPLETED",
      description: "Designed an empathetic, context-aware AI conversational agent trained to detect sentiment shifts, emotional distress signals, and offer supportive guidance with crisis hotline escalation.",
      highlights: [
        "Trained text classification models with intent recognition and sentiment analysis pipelines.",
        "Engineered rule-based safety guardrails for crisis intervention and wellness coping strategies.",
        "Deployed an accessible web chatbot interface with seamless conversation memory."
      ],
      github: "https://github.com/purvathakare/mental-health-chatbot"
    },
    'cinematic': {
      title: "🎬 Cinematic Metadata AI Agent",
      period: "Jan 2026 - Present",
      tech: "Python, Computer Vision (OpenCV), NLP, Deep Learning, Video Indexing, LLM Agents",
      status: "IN PROGRESS",
      description: "Building an automated AI pipeline that processes video sequences to extract deep cinematic metadata, detecting scenes, actor dialogues, emotional trajectories, and generating timestamped semantic search indices.",
      highlights: [
        "Automated shot boundary detection and keyframe clustering using computer vision algorithms.",
        "Integrated speech-to-text with transformer-based dialogue emotion detection.",
        "Developed timestamp-based indexing allowing instant querying of specific scenes by narrative keywords."
      ],
      github: "https://github.com/purvathakare/cinematic-metadata-agent"
    },
    'aurapath': {
      title: "🛡️ AuraPath: IoT Wearable for Hazard Detection",
      period: "Apr 2026 - Present",
      tech: "IoT, Arduino/ESP32, Ultrasonic & Optical Sensors, Microcontrollers, C++, Haptic Alert",
      status: "IN PROGRESS",
      description: "Created AuraPath, an assistive wearable device designed for visually impaired and elderly individuals. Utilizes multi-sensor telemetry to detect physical obstacles, water puddles, and environmental hazards in real time.",
      highlights: [
        "Designed compact sensor integration with low-latency ultrasonic proximity and optical liquid sensors.",
        "Engineered multi-modal alert feedback incorporating directional vibration motors and audio chimes.",
        "Optimized power consumption for all-day wearable battery endurance."
      ],
      github: "https://github.com/purvathakare/aurapath-iot-hazard-wearable"
    }
  };

  document.querySelectorAll('.btn-inspect-quest').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playSelect();
      const qId = btn.getAttribute('data-quest');
      const data = projectDetails[qId];
      if (data && questModal) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = `
          <div style="font-size: 0.85rem; color: #865593; font-weight: 700; margin-bottom: 10px;">
            <span>📅 Timeline: ${data.period}</span> | 
            <span style="color: #27ae60">⚡ Status: ${data.status}</span>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #111111; font-size: 0.85rem;">🛠️ TECH STACK:</strong>
            <p style="color: #444444; font-size: 0.95rem; margin-top: 3px;">${data.tech}</p>
          </div>
          <div style="margin-bottom: 14px;">
            <strong style="color: #111111; font-size: 0.85rem;">🎯 OBJECTIVE & ARCHITECTURE:</strong>
            <p style="color: #555555; font-size: 0.92rem; line-height: 1.5; margin-top: 3px;">${data.description}</p>
          </div>
          <div style="margin-bottom: 18px;">
            <strong style="color: #111111; font-size: 0.85rem;">✨ KEY ACHIEVEMENTS:</strong>
            <ul style="margin-top: 6px; padding-left: 20px; color: #333333; font-size: 0.9rem; line-height: 1.6;">
              ${data.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
          <div style="text-align: right; margin-top: 14px;">
            <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn-submit-scrapbook" style="text-decoration: none; display: inline-block;">
              🔗 GitHub Repository
            </a>
          </div>
        `;
        questModal.classList.add('active');
      }
    });
  });

  if (modalClose && questModal) {
    modalClose.addEventListener('click', () => {
      questModal.classList.remove('active');
    });

    questModal.addEventListener('click', (e) => {
      if (e.target === questModal) {
        questModal.classList.remove('active');
      }
    });
  }

  // ===================================================================
  // 3. CONTACT FORM
  // ===================================================================
  const contactForm = document.getElementById('portfolio-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.retroAudio) window.retroAudio.playPowerUp();
      const name = document.getElementById('form-name').value;
      alert(`📁 Thank you, ${name}! Your transmission has been filed directly to Purva Thakare's desk (pthakare2602@gmail.com).`);
      contactForm.reset();
    });
  }

  // ===================================================================
  // 4. ADMIN PORTAL // VISITOR IP SURVEILLANCE VAULT CONTROLLER
  // ===================================================================
  const btnOpenAdmin = document.getElementById('btn-open-admin');
  const btnFooterAdmin = document.getElementById('btn-footer-admin');
  const adminPinModal = document.getElementById('admin-pin-modal');
  const adminDashModal = document.getElementById('admin-dashboard-modal');
  const adminPinForm = document.getElementById('admin-pin-form');
  const adminPinInput = document.getElementById('admin-pin-input');
  const adminPinError = document.getElementById('admin-pin-error-msg');
  const adminPinClose = document.getElementById('admin-pin-modal-close');
  const btnCancelPin = document.getElementById('btn-cancel-pin');
  const adminDashClose = document.getElementById('admin-dash-modal-close');
  const btnAdminLogout = document.getElementById('btn-admin-logout');
  const adminSearchInput = document.getElementById('admin-search-input');
  const btnAdminRefresh = document.getElementById('btn-admin-refresh');
  const btnAdminExport = document.getElementById('btn-admin-export');
  const btnAdminClear = document.getElementById('btn-admin-clear');
  const inputCustomWebhook = document.getElementById('input-custom-webhook');
  const btnSaveWebhook = document.getElementById('btn-save-webhook');
  const webhookSaveStatus = document.getElementById('webhook-save-status');
  const inputChangePin = document.getElementById('input-change-pin');
  const btnSavePin = document.getElementById('btn-save-pin');
  const pinSaveStatus = document.getElementById('pin-save-status');

  function openAdminPortal() {
    const isAuthed = sessionStorage.getItem('purva_admin_auth') === 'true';

    if (isAuthed && adminDashModal) {
      if (adminPinModal) adminPinModal.classList.remove('active');
      adminDashModal.classList.add('active');

      if (inputCustomWebhook) {
        inputCustomWebhook.value = localStorage.getItem('purva_admin_custom_webhook') || '';
      }

      if (window.visitorTracker) {
        window.visitorTracker.renderAdminDashboard(adminSearchInput ? adminSearchInput.value : '');
        // Fetch fresh cloud telemetry in background and update
        window.visitorTracker.fetchCloudVisitorLogs().then(() => {
          window.visitorTracker.renderAdminDashboard(adminSearchInput ? adminSearchInput.value : '');
        });
      }
    } else if (adminPinModal) {
      if (adminDashModal) adminDashModal.classList.remove('active');
      if (adminPinError) adminPinError.classList.remove('visible');
      if (adminPinInput) adminPinInput.value = '';
      adminPinModal.classList.add('active');
      setTimeout(() => { if (adminPinInput) adminPinInput.focus(); }, 100);
    }
  }

  function closeAdminModals() {
    if (adminPinModal) adminPinModal.classList.remove('active');
    if (adminDashModal) adminDashModal.classList.remove('active');
  }

  // Open triggers
  if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.retroAudio) window.retroAudio.playSelect();
      openAdminPortal();
    });
  }

  if (btnFooterAdmin) {
    btnFooterAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.retroAudio) window.retroAudio.playSelect();
      openAdminPortal();
    });
  }

  // Close buttons
  if (adminPinClose) adminPinClose.addEventListener('click', closeAdminModals);
  if (btnCancelPin) btnCancelPin.addEventListener('click', closeAdminModals);
  if (adminDashClose) adminDashClose.addEventListener('click', closeAdminModals);

  // Overlay click to close
  if (adminPinModal) {
    adminPinModal.addEventListener('click', (e) => {
      if (e.target === adminPinModal) closeAdminModals();
    });
  }
  if (adminDashModal) {
    adminDashModal.addEventListener('click', (e) => {
      if (e.target === adminDashModal) closeAdminModals();
    });
  }

  // Hotkey: Ctrl+Shift+A (or Cmd+Shift+A) & Escape
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      if ((adminPinModal && adminPinModal.classList.contains('active')) ||
          (adminDashModal && adminDashModal.classList.contains('active'))) {
        closeAdminModals();
      } else {
        openAdminPortal();
      }
    }
    if (e.key === 'Escape') {
      closeAdminModals();
    }
  });

  // PIN Form Verification
  if (adminPinForm) {
    adminPinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = adminPinInput ? adminPinInput.value : '';
      if (window.visitorTracker && window.visitorTracker.verifyAdminPin(entered)) {
        sessionStorage.setItem('purva_admin_auth', 'true');
        if (window.retroAudio) window.retroAudio.playPowerUp();
        openAdminPortal();
      } else {
        if (adminPinError) adminPinError.classList.add('visible');
        if (adminPinInput) {
          adminPinInput.focus();
          adminPinInput.select();
        }
      }
    });
  }

  // Logout / Lock Console
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      sessionStorage.removeItem('purva_admin_auth');
      closeAdminModals();
      if (window.retroAudio) window.retroAudio.playJump();
    });
  }

  // Search filter
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      if (window.visitorTracker) {
        window.visitorTracker.renderAdminDashboard(e.target.value);
      }
    });
  }

  // Refresh
  if (btnAdminRefresh) {
    btnAdminRefresh.addEventListener('click', async () => {
      if (window.retroAudio) window.retroAudio.playSelect();
      const original = btnAdminRefresh.textContent;
      btnAdminRefresh.textContent = '🔄 Syncing...';
      if (window.visitorTracker) {
        await window.visitorTracker.fetchCloudVisitorLogs();
        window.visitorTracker.renderAdminDashboard(adminSearchInput ? adminSearchInput.value : '');
      }
      setTimeout(() => { btnAdminRefresh.textContent = original; }, 500);
    });
  }

  // Export CSV
  if (btnAdminExport) {
    btnAdminExport.addEventListener('click', () => {
      if (window.retroAudio) window.retroAudio.playPowerUp();
      if (window.visitorTracker) {
        window.visitorTracker.exportToCSV();
      }
    });
  }

  // Clear Logs
  if (btnAdminClear) {
    btnAdminClear.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your visitor IP log history?')) {
        if (window.visitorTracker) {
          window.visitorTracker.clearVisitorLogs();
        }
      }
    });
  }

  // Save Custom Webhook
  if (btnSaveWebhook && inputCustomWebhook) {
    btnSaveWebhook.addEventListener('click', () => {
      if (window.visitorTracker) {
        window.visitorTracker.saveCustomWebhook(inputCustomWebhook.value);
        if (webhookSaveStatus) {
          webhookSaveStatus.style.display = 'block';
          setTimeout(() => { webhookSaveStatus.style.display = 'none'; }, 3000);
        }
      }
    });
  }

  // Update Master PIN
  if (btnSavePin && inputChangePin) {
    btnSavePin.addEventListener('click', () => {
      const newPin = inputChangePin.value;
      if (window.visitorTracker) {
        const success = window.visitorTracker.updateAdminPin(newPin);
        if (success) {
          inputChangePin.value = '';
          if (pinSaveStatus) {
            pinSaveStatus.textContent = 'Admin PIN updated successfully!';
            pinSaveStatus.style.color = '#2e7d32';
            pinSaveStatus.style.display = 'block';
            setTimeout(() => { pinSaveStatus.style.display = 'none'; }, 3000);
          }
        } else {
          alert('Admin PIN must be at least 4 characters long.');
        }
      }
    });
  }
});
