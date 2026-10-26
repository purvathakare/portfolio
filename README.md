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

## 🔒 Site Architecture & Admin Visitor IP Surveillance

- **Single Unified Site (`index.html`)**: Everything runs seamlessly in a single portfolio site.
- **Zero Public IP Exposure**: Casual visitors, recruiters, and professors see NO IP addresses, NO radar scopes, and NO IP badges anywhere.
- **Admin Visitor IP Vault (Contact Section Only)**:
  - Located strictly at the bottom of the **Contact** section (`#stage-contact`).
  - Protected behind an authorization PIN gate (Default PIN: `purva2026`).
  - Regular visitors only see the locked clearance prompt: *"Restricted to Purva Thakare. Enter PIN code to inspect real-time visitor IP addresses and connection logs."*
  - When unlocked by the admin, it displays:
    - **Total Visits Recorded & Unique IP Count**
    - **Real-Time Visitor IP Registry Table**: IP address (with 1-click `📋 Copy`), Location (City, State, Country), ISP/Network, Device/OS, and Timestamp.
    - **Search & Filter**: Real-time keyword filter across IPs and locations.
    - **📥 1-Click CSV Export**: Download all visitor logs as `purva_thakare_visitor_ips.csv`.
    - **🔔 Mobile Push Alerts**: Direct cloud link to [ntfy.sh/purva_portfolio_visitor_ips_2026](https://ntfy.sh/purva_portfolio_visitor_ips_2026) and free mobile app notifications.
    - **Custom Webhook Integration**: Supports Discord/Telegram webhook notifications.
    - **Lock Console**: 1-click lock button to protect the console when done.
- **Secret Shortcut**: Press **`Ctrl + Shift + A`** (or `Cmd + Shift + A` on Mac) anywhere on the portfolio to jump straight to the Contact section admin vault!

---

## 📁 Repository Structure

```
purva-thakare-portfolio/
│
├── index.html                   # Master scrapbook portfolio & contact-embedded admin IP vault
├── README.md                    # Project documentation & deployment guide
│
├── css/
│   └── retro-arcade.css         # Manila folder, notebook index lines, ID badge & styles
│
├── js/
│   ├── retro-sound.js           # Web Audio API sound synthesizer
│   ├── visitor-telemetry.js     # Silent visitor logging & Contact section admin console
│   └── interactive-console.js   # Public stage switcher & project modal inspection
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
