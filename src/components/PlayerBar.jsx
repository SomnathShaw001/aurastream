import React, { useRef } from 'react';
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
  Download
} from 'lucide-react';

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
  onDownload
}) {
  const progressRef = useRef(null);

  if (!currentTrack) {
    return (
      <footer className="player-bar" style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <div className="player-left">
          <div className="player-art-wrap" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="player-track-meta">
            <span className="player-track-title">Select a track to stream</span>
            <span className="player-track-artist">AuraStream Hi-Res</span>
          </div>
        </div>
      </footer>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  const handleProgressBarClick = (e) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <footer className="player-bar">
      {/* Left: Track Details */}
      <div className="player-left">
        <div className="player-art-wrap">
          <img src={currentTrack.imageSmall || currentTrack.image} alt={currentTrack.title} className="player-art" />
          {isPlaying && (
            <div className="playing-bars">
              <div className="playing-bar" />
              <div className="playing-bar" />
              <div className="playing-bar" />
            </div>
          )}
        </div>

        <div className="player-track-meta">
          <span className="player-track-title" title={currentTrack.title}>
            {currentTrack.title}
          </span>
          <span className="player-track-artist" title={currentTrack.artist}>
            {currentTrack.artist}
          </span>
        </div>

        <button 
          className={`icon-btn ${isLiked ? 'active' : ''}`}
          onClick={onToggleLike}
          title={isLiked ? 'Unlike' : 'Like'}
          style={{ marginLeft: 4 }}
        >
          <Heart size={18} fill={isLiked ? '#ec4899' : 'none'} color={isLiked ? '#ec4899' : 'currentColor'} />
        </button>
      </div>

      {/* Center: Playback Controls & Seekbar */}
      <div className="player-center">
        <div className="player-controls">
          <button 
            className={`icon-btn ${isShuffle ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle size={17} color={isShuffle ? 'var(--accent-primary)' : 'currentColor'} />
          </button>

          <button 
            className="icon-btn"
            onClick={onPrevious}
            title="Previous Track"
          >
            <SkipBack size={20} />
          </button>

          <button 
            className="play-main-btn"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={22} fill="#000000" />
            ) : (
              <Play size={22} fill="#000000" style={{ marginLeft: 2 }} />
            )}
          </button>

          <button 
            className="icon-btn"
            onClick={onNext}
            title="Next Track"
          >
            <SkipForward size={20} />
          </button>

          <button 
            className="icon-btn"
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={17} color="var(--accent-primary)" />
            ) : (
              <Repeat size={17} color={repeatMode === 'all' ? 'var(--accent-primary)' : 'currentColor'} />
            )}
          </button>
        </div>

        {/* Seekbar */}
        <div className="playback-progress-wrap">
          <span className="time-stamp">{formatTime(currentTime)}</span>
          
          <div 
            className="progress-bar-container" 
            ref={progressRef}
            onClick={handleProgressBarClick}
          >
            <div className="progress-track">
              <div 
                className="progress-buffered" 
                style={{ width: `${Math.min(100, bufferedPercent)}%` }} 
              />
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, progressPercent)}%` }} 
              />
            </div>
          </div>

          <span className="time-stamp right">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Audio Quality, Lyrics, Visualizer, EQ, Volume */}
      <div className="player-right">
        {/* Bitrate Badge */}
        <div 
          className="quality-pill" 
          onClick={onOpenQualityModal}
          style={{ padding: '4px 10px', fontSize: '10px' }}
          title="Click to change streaming quality"
        >
          <div className="quality-pill-dot" />
          <span>{bitrate}K</span>
        </div>

        {/* Synced Lyrics Toggle */}
        <button 
          className={`icon-btn ${isLyricsOpen ? 'active' : ''}`}
          onClick={onToggleLyrics}
          title="Synchronized Lyrics"
          style={{ color: isLyricsOpen ? 'var(--accent-cyan)' : 'currentColor' }}
        >
          <Mic2 size={18} />
        </button>

        {/* Spectrum Visualizer Toggle */}
        <button 
          className={`icon-btn ${isVisualizerOpen ? 'active' : ''}`}
          onClick={onToggleVisualizer}
          title="Real-Time Audio Visualizer"
          style={{ color: isVisualizerOpen ? 'var(--accent-primary)' : 'currentColor' }}
        >
          <Activity size={18} />
        </button>

        {/* Equalizer Modal Toggle */}
        <button 
          className="icon-btn"
          onClick={onOpenEqModal}
          title="10-Band Equalizer"
        >
          <Sliders size={18} />
        </button>

        {/* Queue Drawer Toggle */}
        <button 
          className={`icon-btn ${isQueueOpen ? 'active' : ''}`}
          onClick={onToggleQueue}
          title="Playback Queue"
          style={{ color: isQueueOpen ? 'var(--accent-gold)' : 'currentColor' }}
        >
          <ListMusic size={18} />
        </button>

        {/* Direct Download Button */}
        <button 
          className="icon-btn"
          onClick={onDownload}
          title="Download Track (320kbps)"
        >
          <Download size={17} />
        </button>

        {/* Volume Control */}
        <div className="volume-wrapper">
          <button 
            className="icon-btn" 
            onClick={onToggleMute}
            style={{ padding: 4 }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} color="var(--accent-pink)" />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      </div>
    </footer>
  );
}
