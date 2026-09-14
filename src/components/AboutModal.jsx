import React from 'react';
import { X, Sparkles, Sliders, Mic2, Palette, ExternalLink, Music2, Heart } from 'lucide-react';

export default function AboutModal({ onClose }) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-card about-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="about-brand-wrap">
            <div className="about-logo-icon">
              <Music2 size={24} color="#000" />
            </div>
            <div>
              <h2 className="modal-title" style={{ margin: 0 }}>About AuraStream</h2>
              <span className="hires-tag" style={{ marginTop: 4 }}>v1.0.0 • HI-RES MASTER</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="about-modal-body">
          <p className="about-tagline">
            An audiophile-grade high-resolution web music streaming experience engineered for uncompromised sound fidelity and modern desktop aesthetics.
          </p>

          <div className="about-specialties-list">
            <div className="about-specialty-item">
              <div className="specialty-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Sparkles size={18} />
              </div>
              <div className="specialty-text">
                <span className="specialty-title">Lossless 320 kbps Studio Master Audio</span>
                <span className="specialty-desc">
                  Decrypts and streams studio-quality 320 kbps AAC/MP4 audio on the fly from an 80M+ global music catalog with zero compression artifacts.
                </span>
              </div>
            </div>

            <div className="about-specialty-item">
              <div className="specialty-icon-box" style={{ background: 'rgba(184, 234, 36, 0.15)', color: 'var(--theme-accent)' }}>
                <Sliders size={18} />
              </div>
              <div className="specialty-text">
                <span className="specialty-title">Hardware-Grade Web Audio Sculpting</span>
                <span className="specialty-desc">
                  Features a 10-band interactive equalizer with studio presets and 60FPS reactive canvas spectrum visualizers.
                </span>
              </div>
            </div>

            <div className="about-specialty-item">
              <div className="specialty-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <Mic2 size={18} />
              </div>
              <div className="specialty-text">
                <span className="specialty-title">Synchronized Karaoke Lyrics & MediaSession</span>
                <span className="specialty-desc">
                  Real-time line-by-line scrolling LRC lyrics with interactive tap-to-seek, paired with native OS lockscreen and media-key playback controls.
                </span>
              </div>
            </div>

            <div className="about-specialty-item">
              <div className="specialty-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                <Palette size={18} />
              </div>
              <div className="specialty-text">
                <span className="specialty-title">Spicetify Aesthetics & Artist Discographies</span>
                <span className="specialty-desc">
                  Tailored desktop audio chassis with customizable bezel themes (Cyber Lime, Crimson, Burgundy, Obsidian) and dedicated singer discography pages.
                </span>
              </div>
            </div>
          </div>

          <div className="about-links-section">
            <a 
              href="https://auramusic-stream.vercel.app" 
              target="_blank" 
              rel="noreferrer" 
              className="about-link-btn primary"
            >
              <ExternalLink size={16} />
              <span>Open Live App (auramusic-stream.vercel.app)</span>
            </a>

            <a 
              href="https://github.com/SomnathShaw001/aurastream" 
              target="_blank" 
              rel="noreferrer" 
              className="about-link-btn secondary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

