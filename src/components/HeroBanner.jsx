import React from 'react';
import { Play, Sparkles, Music, Radio } from 'lucide-react';

export default function HeroBanner({ featuredTrack, onPlay }) {
  if (!featuredTrack) return null;

  return (
    <div className="hero-banner">
      {/* Background artwork blur */}
      <div 
        className="hero-backdrop" 
        style={{ backgroundImage: `url(${featuredTrack.image})` }} 
      />
      <div className="hero-overlay" />

      {/* Hero content */}
      <div className="hero-content">
        <img 
          src={featuredTrack.image} 
          alt={featuredTrack.title} 
          className="hero-cover" 
        />
        <div className="hero-details">
          <div className="hero-tag">
            <Sparkles size={14} />
            <span>Trending Worldwide • 320 KBPS MASTER</span>
          </div>
          <h1 className="hero-title">{featuredTrack.title}</h1>
          <p className="hero-subtitle">
            {featuredTrack.subtitle || featuredTrack.artist || 'Experience high fidelity audio streaming'}
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => onPlay(featuredTrack)}>
              <Play size={18} fill="#ffffff" />
              <span>Stream in Hi-Res</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
