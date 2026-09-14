# AuraStream 🎧 — High-Resolution Music Streaming Web App

> **AuraStream** is a modern, high-resolution music streaming web application delivering studio-quality **320 kbps AAC/MP4** audio, real-time **karaoke-style synchronized lyrics**, a **10-band Web Audio equalizer**, a **real-time spectrum visualizer**, and personal library management.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Audio Quality](https://img.shields.io/badge/Hi--Res-320_kbps_Studio_Master-f59e0b)](#audio-engine)
[![License](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)

---

## ✨ Features

- 💎 **True 320 kbps Studio Quality Streaming**: Decrypts and streams high-bitrate studio audio streams from JioSaavn's 80M+ global music catalog on the fly, with selectable quality tiers (`320 kbps Studio Master`, `160 kbps High`, `96 kbps Data Saver`).
- 🎤 **Karaoke Synced Lyrics**: Integrated with LRCLIB for line-by-line synchronized scrolling lyrics with interactive tap-to-seek.
- 🎚️ **10-Band Interactive Equalizer**: Hardware-style vertical sliders covering frequencies from 32Hz to 16kHz (-12dB to +12dB) with built-in presets (*Bass Boost*, *Electronic*, *Rock*, *Pop*, *Vocal Boost*, *Acoustic*, *Flat*).
- 🌊 **60FPS Real-Time Canvas Spectrum Visualizer**: Dynamic audio reactivity using Web Audio API `AnalyserNode` with multiple display modes:
  - **Neon Gradient Spectrum Bars** with peak decay
  - **Oscilloscope Waveform**
  - **Radial Pulsing Circle**
- 🔍 **Instant Search & Autocomplete**: Real-time debounced search for tracks, artists, albums, and featured playlists.
- 📻 **Trending Hits & Charts**: Explore top worldwide charts, editorial playlists, and new releases directly from the homepage.
- 💾 **Personal Music Library**:
  - **Liked Songs**: Save your favorite songs locally.
  - **Custom Playlists**: Create, manage, and add tracks to custom playlists.
  - **Playback History**: Keep track of recently played songs.
- ⬇️ **One-Click Offline High-Res Downloader**: Direct download trigger for offline listening with automated metadata naming.
- 📱 **Native OS MediaSession Controls**: Full control from Windows/macOS lock screens, taskbar media controls, and Bluetooth headphone hardware buttons (Play, Pause, Skip, Seek).
- 🎨 **Obsidian Glassmorphism Aesthetic**: Deep dark obsidian color palette, blurred backdrop glass surfaces (`backdrop-filter: blur(24px)`), neon cyan/violet glowing accents, and ambient gradients.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript (ES Modules)
- **Bundler & Dev Server**: Vite 6
- **Styling**: Modern Vanilla CSS with Custom Design Tokens & Glassmorphism
- **Audio Core**: HTML5 Audio + Web Audio API (`AudioContext`, `BiquadFilterNode`, `AnalyserNode`)
- **Crypto**: `crypto-js` for client-side DES-ECB decryption of audio stream URLs
- **Icons**: Lucide React
- **Typography**: Google Fonts (*Plus Jakarta Sans*, *Outfit*, *JetBrains Mono*)

---

## 📁 Project Structure

```
aurastream/
├── index.html                  # HTML entry point with modern fonts and meta tags
├── vite.config.js              # Vite config with React plugin and JioSaavn API proxy
├── package.json                # Project dependencies and scripts
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
├── README.md                   # Documentation and GitHub guide
└── src/
    ├── main.jsx                # Application root mount
    ├── App.jsx                 # Top-level view coordinator, audio bindings, hotkeys
    ├── index.css               # Global glassmorphic design system and CSS tokens
    ├── services/
    │   ├── saavnApi.js         # JioSaavn API client, DES decrypter, 500x500 artwork
    │   ├── lyricsApi.js        # LRCLIB API synced lyrics fetcher and LRC parser
    │   ├── audioEngine.js      # Web Audio API engine, 10-band EQ, AnalyserNode, MediaSession
    │   └── storage.js          # LocalStorage persistence for likes, playlists, history
    └── components/
        ├── Sidebar.jsx         # Left navigation sidebar & playlist drawer
        ├── Header.jsx          # Search bar with autocomplete and quick settings
        ├── HeroBanner.jsx      # Trending featured track showcase
        ├── TrackCard.jsx       # Grid card for songs, albums, and playlists
        ├── TrackList.jsx       # Tabular list view with track numbers and actions
        ├── PlayerBar.jsx       # Bottom audio player with seekbar and feature toggles
        ├── LyricsView.jsx      # Fullscreen synchronized karaoke lyrics modal
        ├── VisualizerModal.jsx # Real-time Canvas audio visualizer
        ├── EqualizerModal.jsx  # 10-Band equalizer modal with presets
        ├── QualitySelector.jsx # Bitrate selector (320k / 160k / 96k)
        ├── QueueDrawer.jsx     # Slide-over queue drawer
        └── PlaylistModal.jsx   # Create & manage custom playlists
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm (or yarn / pnpm)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/aurastream.git
cd aurastream
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>→</kbd> | Seek forward 5 seconds |
| <kbd>←</kbd> | Seek backward 5 seconds |
| <kbd>↑</kbd> | Volume up 5% |
| <kbd>↓</kbd> | Volume down 5% |
| <kbd>M</kbd> | Toggle Mute |
| <kbd>L</kbd> | Toggle Synced Lyrics View |
| <kbd>V</kbd> | Toggle Real-Time Visualizer |
| <kbd>E</kbd> | Toggle 10-Band Equalizer |

---

## 📤 How to Push to GitHub

Follow these steps to push this project to your GitHub account:

### Step 1: Initialize Git and Commit Files
```bash
# Initialize local Git repository (if not already initialized)
git init

# Add all files to staging
git add .

# Commit your changes
git commit -m "feat: initial commit of AuraStream 320kbps music streaming app"
```

### Step 2: Create a New GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g. `aurastream` or `highres-music-player`).
3. Set visibility to **Public** or **Private**.
4. Leave "Add a README file", ".gitignore", and "License" **unchecked** (they are already included here).
5. Click **Create repository**.

### Step 3: Link Remote and Push
Copy and run the commands shown on GitHub:
```bash
# Set branch to main
git branch -M main

# Add your remote repository URL (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/aurastream.git

# Push your code to GitHub
git push -u origin main
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
