import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Volume1,
  Mic2, 
  Activity, 
  Sliders, 
  ListMusic, 
  Heart,
  Download,
  Maximize2
} from 'lucide-react';
import ArtistLinks from './ArtistLinks';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerBar({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  isShuffle,
  repeatMode, // 'off' | 'all' | 'one'
  bitrate,
  isLiked,
  onTogglePlay,
  onSeek,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
  onToggleMute,
  onToggleLike,
  onOpenQualityModal,
  onToggleLyrics,
  isLyricsOpen,
  onToggleVisualizer,
  isVisualizerOpen,
  onOpenEqModal,
  onToggleQueue,
  isQueueOpen,
  onDownload,
  onSelectArtist
}) {
  const progressRef = useRef(null);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState(null);

  if (!currentTrack) {
    return (
      <footer className="spicetify-player-bar empty">
        <div className="player-left-controls">
          <button className="player-icon-btn disabled" disabled><SkipBack size={18} /></button>
          <button className="spicetify-play-circle disabled" disabled><Play size={18} fill="#000" /></button>
          <button className="player-icon-btn disabled" disabled><SkipForward size={18} /></button>
        </div>
        <div className="player-center-track">
          <div className="spicetify-track-meta">
            <span className="spicetify-track-title">Select a track to stream</span>
            <span className="spicetify-track-sub">AuraStream Hi-Res 320 kbps</span>
          </div>
        </div>
        <div className="player-right-actions">
          <div className="quality-pill disabled">
            <div className="quality-pill-dot" />
            <span>320K</span>
          </div>
        </div>
      </footer>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const effectiveVolume = isMuted ? 0 : volume;
  const volumePercent = Math.round(effectiveVolume * 100);

  const handleProgressBarClick = (e) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const handleProgressMouseMove = (e) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverSeekTime(ratio * duration);
  };

  const handleVolumeSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  return (
    <footer className="spicetify-player-bar">
      {/* 1. Full-Width Edge-to-Edge Seekbar at the very top (matching Images 2, 4, 5) */}
      <div 
        className={`edge-progress-container ${isHoveringProgress ? 'hovered' : ''}`}
        ref={progressRef}
        onClick={handleProgressBarClick}
        onMouseEnter={() => setIsHoveringProgress(true)}
        onMouseLeave={() => { setIsHoveringProgress(false); setHoverSeekTime(null); }}
        onMouseMove={handleProgressMouseMove}
        title={hoverSeekTime ? formatTime(hoverSeekTime) : formatTime(currentTime)}
      >
        <div 
          className="edge-progress-buffered" 
          style={{ width: `${Math.min(100, bufferedPercent)}%` }} 
        />
        <div 
          className="edge-progress-fill" 
          style={{ width: `${Math.min(100, progressPercent)}%` }} 
        >
          <div className="edge-progress-thumb" />
        </div>
      </div>

      {/* 2. Left: Playback Controls (Previous, Play/Pause, Next, Repeat, Shuffle) */}
      <div className="player-left-controls">
        <button 
          className="player-icon-btn"
          onClick={onPrevious}
          title="Previous (Left Arrow)"
        >
          <SkipBack size={18} />
        </button>

        <button 
          className="spicetify-play-circle"
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <Pause size={18} fill="#000000" />
          ) : (
            <Play size={18} fill="#000000" style={{ marginLeft: 2 }} />
          )}
        </button>

        <button 
          className="player-icon-btn"
          onClick={onNext}
          title="Next (Right Arrow)"
        >
          <SkipForward size={18} />
        </button>

        <button 
          className={`player-icon-btn ${repeatMode !== 'off' ? 'active' : ''}`}
          onClick={onToggleRepeat}
          title={`Repeat mode: ${repeatMode}`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 size={16} color="var(--theme-accent)" />
          ) : (
            <Repeat size={16} color={repeatMode === 'all' ? 'var(--theme-accent)' : 'currentColor'} />
          )}
        </button>

        <button 
          className={`player-icon-btn ${isShuffle ? 'active' : ''}`}
          onClick={onToggleShuffle}
          title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle size={16} color={isShuffle ? 'var(--theme-accent)' : 'currentColor'} />
        </button>
      </div>

      {/* 3. Center: Track Artwork, Meta, Heart (Images 2, 4, 5) */}
      <div className="player-center-track">
        <img 
          src={currentTrack.imageSmall || currentTrack.image} 
          alt={currentTrack.title} 
          className="spicetify-player-thumb"
        />

        <div className="spicetify-track-meta">
          <div className="spicetify-track-title" title={currentTrack.title}>
            {currentTrack.title}
          </div>
          <div className="spicetify-track-sub" title={currentTrack.artist}>
            <ArtistLinks artistsString={currentTrack.artist} onSelectArtist={onSelectArtist} />
          </div>
        </div>

        <button 
          className={`heart-btn ${isLiked ? 'liked' : ''}`}
          onClick={onToggleLike}
          title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
        >
          <Heart 
            size={18} 
            fill={isLiked ? '#ff334b' : 'none'} 
            color={isLiked ? '#ff334b' : 'currentColor'} 
          />
        </button>

        <div className="spicetify-time-indicator">
          <span>{formatTime(currentTime)}</span>
          <span className="time-divider">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 4. Right: Audio Controls, EQ, Visualizer, Lyrics, Speaker & Slider */}
      <div className="player-right-actions">
        {/* Synced Lyrics Toggle */}
        <button 
          className={`player-icon-btn ${isLyricsOpen ? 'active' : ''}`}
          onClick={onToggleLyrics}
          title="Synchronized Lyrics"
          style={{ color: isLyricsOpen ? 'var(--accent-cyan)' : 'currentColor' }}
        >
          <Mic2 size={17} />
        </button>

        {/* Spectrum Visualizer Toggle */}
        <button 
          className={`player-icon-btn ${isVisualizerOpen ? 'active' : ''}`}
          onClick={onToggleVisualizer}
          title="Real-Time Spectrum Visualizer"
          style={{ color: isVisualizerOpen ? 'var(--theme-accent)' : 'currentColor' }}
        >
          <Activity size={17} />
        </button>

        {/* 10-Band Equalizer */}
        <button 
          className="player-icon-btn"
          onClick={onOpenEqModal}
          title="10-Band Equalizer"
        >
          <Sliders size={17} />
        </button>

        {/* Playback Queue Drawer */}
        <button 
          className={`player-icon-btn ${isQueueOpen ? 'active' : ''}`}
          onClick={onToggleQueue}
          title="Playback Queue"
          style={{ color: isQueueOpen ? 'var(--theme-accent)' : 'currentColor' }}
        >
          <ListMusic size={17} />
        </button>

        {/* Bitrate Badge */}
        <div 
          className="quality-pill compact" 
          onClick={onOpenQualityModal}
          title="Audio Streaming Bitrate (Click to change)"
        >
          <div className="quality-pill-dot" />
          <span>{bitrate}K</span>
        </div>

        {/* Volume & Mute Controls (Image 1 fix) */}
        <div className="spicetify-volume-group">
          <button 
            className="player-icon-btn volume-mute-btn" 
            onClick={onToggleMute}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted || volumePercent === 0 ? (
              <VolumeX size={18} color="#ff334b" />
            ) : volumePercent < 50 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <div className="spicetify-slider-track-wrap">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeSliderChange}
              className="spicetify-vol-slider"
              title={`Volume: ${isMuted ? 0 : volumePercent}%`}
              style={{
                '--vol-percent': `${isMuted ? 0 : volumePercent}%`
              }}
            />
          </div>
        </div>

        {/* Download Track 320kbps */}
        <button 
          className="player-icon-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownload?.(); }}
          title="Download Studio Master (320kbps AAC)"
          type="button"
        >
          <Download size={16} />
        </button>
      </div>
    </footer>
  );
}
