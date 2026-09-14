# AuraStream 🎧 — High-Resolution Music Streaming Web App

> **AuraStream** is a modern, high-resolution music streaming web application delivering studio-quality **320 kbps AAC/MP4** audio, real-time **karaoke-style synchronized lyrics**, a **10-band Web Audio equalizer**, a **real-time spectrum visualizer**, dedicated singer discography pages, and custom Spicetify-inspired themes.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Audio Quality](https://img.shields.io/badge/Hi--Res-320_kbps_Studio_Master-f59e0b)](#-audio-engine)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Demo-000000?logo=vercel&logoColor=white)](https://auramusic-stream.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)

---

## 🌐 Live Demo

- **Production URL**: [https://auramusic-stream.vercel.app](https://auramusic-stream.vercel.app)
- **Alternative Mirror**: [https://auramusic-app.vercel.app](https://auramusic-app.vercel.app)

---

## ✨ Features

- 💎 **True 320 kbps Studio Quality Streaming**: Decrypts and streams high-bitrate studio audio streams from JioSaavn's 80M+ global music catalog on the fly, with selectable quality tiers (`320 kbps Studio Master`, `160 kbps High`, `96 kbps Data Saver`).
- 🎨 **Spicetify Desktop Aesthetics & Theming**: Custom colored outer chassis bezel with multiple aesthetic themes:
  - **Cyber Lime**: Electric neon lime bezel with dark obsidian interior.
  - **Crimson Red**: Deep crimson scarlet bezel with vibrant yellow edge seekbar.
  - **Burgundy & Cream**: Warm vintage cream chassis with deep royal wine interior.
  - **Obsidian Violet**: Deep midnight glassmorphic aesthetic with purple accents.
- 🎤 **Karaoke Synced Lyrics**: Integrated with LRCLIB for line-by-line synchronized scrolling lyrics with interactive tap-to-seek.
- 🎚️ **10-Band Interactive Equalizer**: Hardware-grade vertical sliders covering frequencies from 32Hz to 16kHz (-12dB to +12dB) with built-in presets (*Bass Boost*, *Electronic*, *Rock*, *Pop*, *Vocal Boost*, *Acoustic*, *Flat*).
- 🌊 **60FPS Real-Time Canvas Spectrum Visualizer**: Dynamic audio reactivity using Web Audio API `AnalyserNode` with multiple display modes:
  - **Neon Gradient Spectrum Bars** with peak decay
  - **Oscilloscope Waveform**
  - **Radial Pulsing Circle**
- 👤 **Dedicated Singer & Artist Pages**: Click any artist name anywhere in the app to view their verified profile, monthly listener statistics, full discography, top hits, and released albums.
- 🔍 **Instant Search & Autocomplete**: Real-time debounced search for tracks, singers, albums, and curated playlists.
- 📻 **Top Charts & Editorial Playlists**: Explore global top 50 hits, regional charts, and new releases directly from the homepage.
- 💾 **Personal Music Library**:
  - **Liked Songs**: Save your favorite songs with quick-like heart controls.
  - **Custom Playlists**: Create, manage, and curate custom playlists with aesthetic cover art.
  - **Playback History**: Keep track of recently played tracks.
- ⬇️ **One-Click Offline High-Res Downloader**: Direct download trigger for offline listening with automated metadata naming.
- 📱 **Native OS MediaSession Controls**: Full control from Windows/macOS lock screens, taskbar media controls, and Bluetooth headphone hardware buttons (Play, Pause, Skip, Seek).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript (ES Modules)
- **Bundler & Build Tool**: Vite 6
- **Styling**: Modern Vanilla CSS with Custom Tokens & Spicetify Chassis
- **Audio Core**: HTML5 Audio + Web Audio API (`AudioContext`, `BiquadFilterNode`, `AnalyserNode`, `GainNode`)
- **Crypto**: `crypto-js` for client-side DES-ECB decryption of audio stream URLs
- **Serverless**: Vercel Serverless Function Proxy (`/api/saavn`)
- **Icons**: Lucide React
- **Typography**: Google Fonts (*Plus Jakarta Sans*, *Outfit*, *JetBrains Mono*)

---

## 📁 Project Structure

```
aurastream/
├── index.html                  # HTML entry point with fonts and meta tags
├── vite.config.js              # Vite config with React plugin and proxy settings
├── vercel.json                 # Vercel deployment and SPA routing configuration
├── package.json                # Project dependencies and scripts
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
├── README.md                   # Project documentation
├── api/
│   └── saavn.js                # Vercel serverless proxy for JioSaavn 320kbps API
└── src/
    ├── main.jsx                # Application root mount
    ├── App.jsx                 # View coordinator, history navigation, and audio bindings
    ├── index.css               # Design system, themes, chassis, and dock styling
    ├── services/
    │   ├── saavnApi.js         # JioSaavn API client, DES decryption, high-res artwork
    │   ├── lyricsApi.js        # LRCLIB API synced lyrics fetcher and LRC parser
    │   ├── audioEngine.js      # Web Audio API engine, 10-band EQ, AnalyserNode, MediaSession
    │   └── storage.js          # LocalStorage persistence for likes, playlists, history
    └── components/
        ├── Sidebar.jsx         # Spicetify vertical icon dock and pinned artists
        ├── Header.jsx          # Top navigation with < > arrows, categories, and theme selector
        ├── HomeView.jsx        # Featured Liked Songs card, quick playlists, and singer circles
        ├── ArtistView.jsx      # Dedicated singer/artist discography page
        ├── ArtistLinks.jsx     # Interactive clickable singer links
        ├── TrackCard.jsx       # Grid card for songs, albums, and playlists
        ├── TrackList.jsx       # Tabular list view with track numbers and actions
        ├── PlayerBar.jsx       # Bottom player bar with top edge seekbar & volume controls
        ├── LyricsView.jsx      # Fullscreen synchronized karaoke lyrics modal
        ├── VisualizerModal.jsx # Real-time Canvas audio visualizer
        ├── EqualizerModal.jsx  # 10-Band equalizer modal with presets
        ├── QualitySelector.jsx # Bitrate selector (320k / 160k / 96k)
        ├── QueueDrawer.jsx     # Slide-over playback queue drawer
        └── PlaylistModal.jsx   # Create & manage custom playlists
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>→</kbd> | Seek forward 5 seconds |
| <kbd>←</kbd> | Seek backward 5 seconds |
| <kbd>↑</kbd> | Volume up 5% |
| <kbd>↓</kbd> | Volume down 5% |
| <kbd>M</kbd> | Toggle Mute / Unmute |
| <kbd>L</kbd> | Toggle Synced Lyrics View |
| <kbd>V</kbd> | Toggle Real-Time Visualizer |
| <kbd>E</kbd> | Toggle 10-Band Equalizer |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
