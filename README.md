# 📁 Purva Thakare - Manila Folder & Scrapbook Portfolio

> A digital identity and technical portfolio designed for **Purva Thakare**, Computer Science and Engineering Undergraduate at **Symbiosis Institute of Technology (SIT), Nagpur**.

Faithfully crafted in the **Manila Folder, Stationery Paper & Hanging Student ID Badge aesthetic** inspired by the uploaded scrapbook reference (Alba Maho).

---

## 🌟 Visual Layout & Features

1. **Section 1: Manila Folder Hero with Notebook Index Page (Cover)**:
   - Realistic Manila cardstock folder with top index tab and vertical center fold crease.
   - **Pinned Lined Notebook Index Sheet**: Instead of top buttons on the cover, the navigation buttons are placed **directly inside the pinned notebook paper** as an interactive Table of Contents aligned with the ruled paper lines:
     - `01. ABOUT ME` (Student ID & Profile Dossier)
     - `02. SKILLS & ARSENAL` (Tech Timeline & Badges)
     - `03. ENGINEERING PROJECTS` (Case Studies)
     - `04. CERTIFICATES & MARKS` (Red Hat & Infosys Credentials)
     - `05. GUILDS & HACKATHONS` (ACM Chapter & Leadership)
     - `06. LIVE VISITOR IP RADAR` (Real-Time Telemetry Ledger)
     - `07. CONTACT & RESUME` (Comms Hub & CV)
   - Features the purple 3D pushpin (top-left), purple wax seal badge with bow (right), yellow 3D star charm (bottom-left), and lavender gingham washi tape (bottom-right).
   - **Signature Mixed Typography**: **Port** *(Bold Geometric)* + ***folio*** *(Flowing Calligraphy Script)*.
   - Bottom name badge label: **Purva Thakare**.

2. **Top Pill Capsule Navigation (On Inner Sub-Pages)**:
   - When viewing inside pages (About Me, Skills, Projects, etc.), clean rounded pill buttons appear at the top:
     `[ 📁 INDEX ]` `[ ABOUT ME ]` `[ SKILLS ]` `[ PROJECTS ]` `[ CERTIFICATES ]` `[ GUILDS ]` `[ IP RADAR ]` `[ CONTACT ]`
   - Clicking `[ 📁 INDEX ]` immediately brings the visitor back to the main folder cover.

3. **Section 2: About Me (Stationery Dossier & Hanging Student ID Lanyard)**:
   - Textured grey stationery sheet with folder tab.
   - Mixed typography title: ***About*** **me**.
   - **Hanging Student ID Badge Centerpiece**: Complete with metallic clip, clear lanyard loop, barcode, your official SIT uniform portrait with round glasses, name, and student status.
   - **Dotted Annotation Boxes**: Details your B.Tech in CSE at Symbiosis Institute of Technology (SIT), Nagpur (2024–2028), Carmel Convent School (Bhopal) foundation, languages (English, Hindi, Marathi), and locations.

4. **Section 3: Skills Sheet (Curled Dog-Ear Corners & Timeline Branches)**:
   - Curled paper corners (dog-ear folds) at bottom-left and bottom-right.
   - Top row of scattered purple pixel confetti / mosaic squares along the border.
   - Mixed typography title: ***Sk*** + **ills**.
   - Horizontal dotted timeline wire connecting square skill badge nodes (`Py`, `Js`, `C/J`, `ML`, `IoT`) with star ratings (★★★★★) and descriptions.
   - Plus tags cluster: `+ SQL / PL`, `+ GIT & GITHUB`, `+ LINUX (RED HAT RH124)`, `+ DATA STRUCTURES (INFOSYS)`, `+ CANVA`, `+ EXCEL`, `+ POWERPOINT`.

5. **Section 4: Projects (Dossier Case Studies)**:
   - Washi-taped project dossier cards for:
     * **Spotify Recommender System** (Jan 2025 – Apr 2025)
     * **NLP Mental Health Chatbot** (Jul 2025 – Dec 2025)
     * **Cinematic Metadata AI Agent** (Jan 2026 – Present)
     * **AuraPath IoT Hazard Wearable** (Apr 2026 – Present)
   - Detailed inspect case study modals and GitHub repo links.

6. **Section 5: Inventory & Verified Certifications**:
   - Red Hat Introduction to Python (AD141)
   - Infosys Springboard DSA using Python (Part 1)
   - Red Hat System Administration I (RH124 - RHA Ver. 10)
   - Academic Scoreboard (SIT Nagpur B.Tech & Carmel Convent CBSE 10+2).

7. **Section 6: Guilds & Experience**:
   - Core Committee Member in **ACM Student Chapter** (SIT Nagpur)
   - **ServiceNow** Virtual Internship
   - **Smart India Hackathon (SIH)** Participant
   - Inter-College Hackathons & Tech Symposiums

8. **Section 6: Contact & Download Resume**:
   - Direct links for Email ([`pthakare2602@gmail.com`](mailto:pthakare2602@gmail.com)), Phone (`+91 7999282181`), [Purva Thakare | LinkedIn](https://www.linkedin.com/in/purva-thakare-83b820320/), and GitHub.
   - 1-Click Printable / PDF-ready Resume.
   - Interactive transmission form.

---

## 🔒 Two-Site Architecture (Public vs Admin)

The deployment is split into two specialized sites:

### 1. 🌐 Public Portfolio (`index.html`)
- **For All Public Viewers (Recruiters, Classmates, General Public)**
- Displays your complete Manila folder scrapbook dossier: Profile, ID Badge, Tech Timeline, Case Studies, Certifications, and Leadership.
- **Zero IP Address Exposure**: No IP radar, no visitor counters, no IP badges, and no admin controls are shown to the public viewer.
- **Silent Background Telemetry**: In the background, `js/visitor-telemetry.js` logs real visitors and dispatches cross-device telemetry to the cloud for the admin without displaying anything to the visitor.
- **Secret Admin Shortcut**: Site owner can press **`Ctrl + Shift + A`** anywhere on `index.html` to jump directly to `admin.html`.

### 2. 🛡️ Site Owner Admin Portal (`admin.html`)
- **Exclusively for Purva Thakare**
- **URL**: `https://purvathakare.github.io/portfolio/admin.html`
- **PIN-Protected Gate**: Access requires master PIN (Default: `purva2026`).
- **Full IP Surveillance & Radar**:
  - Live 360-degree rotating sweep radar with dynamic blips for active sessions.
  - Complete Visitor IP Registry table: IP address (with 1-click `📋 Copy`), Location (City, State, Country), ISP/Network, Device/OS, and Timestamp.
  - Live Metrics: Total Recorded Visits, Unique IP Count, Cloud Telemetry Status, Your Current IP.
  - Search & Filter bar for instant IP lookup.
  - **📥 1-Click CSV Export**: Download the complete visitor IP registry as `purva_thakare_visitor_ips.csv`.
  - **🔔 Mobile Push Alerts**: Direct cloud link to [ntfy.sh/purva_portfolio_visitor_ips_2026](https://ntfy.sh/purva_portfolio_visitor_ips_2026) and free mobile app notifications.
  - Custom Webhook integration (Discord / Telegram) & PIN customizer.

---

## 📁 Repository Structure

```
purva-thakare-portfolio/
│
├── index.html                   # Public scrapbook portfolio (Zero IP data shown to public)
├── admin.html                   # Dedicated Site Owner Admin Surveillance & IP Center
├── README.md                    # Project documentation & deployment guide
│
├── css/
│   └── retro-arcade.css         # Manila folder, notebook index lines, ID badge & styles
│
├── js/
│   ├── retro-sound.js           # Web Audio API sound synthesizer
│   ├── visitor-telemetry.js     # Silent background visitor logging for index.html
│   ├── admin-portal.js          # Admin surveillance, radar blips, & CSV export for admin.html
│   └── interactive-console.js   # Public stage switcher & project inspection
│
└── assets/
    ├── images/
    │   ├── purva_profile.jpg        # Purva's SIT uniform portrait
    │   ├── index_paper_reference.png # Pinned notebook index paper reference
    │   ├── scrapbook_reference.jpg  # Alba Maho scrapbook reference
    │   ├── y2k_reference.jpg        # Previous Y2K reference
    │   ├── pixel_art_reference.jpg  # Previous arcade reference
    │   └── purva_pixel_avatar.svg   # Custom 8-bit pixel avatar
    └── docs/
        └── Purva_Thakare_Resume.html # Printable / downloadable recruiter CV
```

---

## 🚀 How to Run & View Locally

1. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Brave, Safari).
2. Or launch a local server:
   ```powershell
   python -m http.server 8000
   ```
   and navigate to `http://localhost:8000`.
