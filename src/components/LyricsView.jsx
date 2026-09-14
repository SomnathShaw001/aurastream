import React, { useEffect, useRef } from 'react';
import { X, Mic2, Music } from 'lucide-react';
import ArtistLinks from './ArtistLinks';

export default function LyricsView({
  track,
  lyricsData,
  currentTime,
  onSeek,
  onClose,
  onSelectArtist
}) {
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  // Find the active line index based on currentTime
  let activeIndex = -1;
  if (lyricsData?.isSynced && lyricsData.lyrics.length > 0) {
    for (let i = 0; i < lyricsData.lyrics.length; i++) {
      if (currentTime >= lyricsData.lyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth scroll active line into view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  return (
    <div className="lyrics-view-container">
      {/* Background artwork blur */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${track?.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(50px) brightness(0.25)',
          zIndex: 0
        }} 
      />

      {/* Header */}
      <div className="lyrics-header" style={{ position: 'relative', zIndex: 10 }}>
        <div className="lyrics-track-info">
          <img src={track?.image} alt={track?.title} className="lyrics-art" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
              {track?.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
              <ArtistLinks 
                artistsString={track?.artist} 
                onSelectArtist={(artist) => {
                  onClose();
                  if (onSelectArtist) onSelectArtist(artist);
                }} 
              /> • {lyricsData?.isSynced ? 'Karaoke Synced' : 'Static Lyrics'}
            </p>
          </div>
        </div>

        <button className="icon-btn" onClick={onClose} style={{ padding: 10, background: 'rgba(255,255,255,0.1)' }}>
          <X size={24} />
        </button>
      </div>

      {/* Lyrics Content */}
      <div className="lyrics-content" ref={containerRef} style={{ position: 'relative', zIndex: 10 }}>
        {!lyricsData || !lyricsData.lyrics || lyricsData.lyrics.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 80 }}>
            <Music size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>No synchronized lyrics found for this track</h3>
            <p style={{ fontSize: '14px', marginTop: 8 }}>Enjoy the high-resolution master audio stream</p>
          </div>
        ) : (
          lyricsData.lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                className={`lyric-line ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (lyricsData.isSynced) {
                    onSeek(line.time);
                  }
                }}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
