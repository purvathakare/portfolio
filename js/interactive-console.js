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
});
