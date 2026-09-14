import React from 'react';
import { Play, Pause, Heart, Download, Plus, Clock } from 'lucide-react';
import ArtistLinks from './ArtistLinks';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '3:30';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TrackList({ 
  tracks = [], 
  currentTrack, 
  isPlaying, 
  onPlayTrack, 
  likedTrackIds = new Set(), 
  onToggleLike,
  onAddToPlaylist,
  onDownloadTrack,
  onSelectArtist
}) {
  if (!tracks || tracks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
        No tracks found
      </div>
    );
  }

  return (
    <div className="track-table">
      {/* Table header */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '48px 1fr 1fr 80px 100px', 
          padding: '8px 14px', 
          fontSize: '12px', 
          color: 'var(--text-dim)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.8px', 
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '8px'
        }}
      >
        <span>#</span>
        <span>Title</span>
        <span>Album</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={13} /> Time
        </span>
        <span style={{ textAlign: 'right' }}>Actions</span>
      </div>

      {/* Rows */}
      {tracks.map((track, idx) => {
        const isCurrent = currentTrack?.id === track.id;
        const isLiked = likedTrackIds.has(track.id);

        return (
          <div 
            key={track.id || idx} 
            className={`track-row ${isCurrent ? 'active' : ''}`}
            onClick={() => onPlayTrack(track, tracks)}
          >
            {/* Number or Equalizer animation */}
            <div className="track-index">
              {isCurrent && isPlaying ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
                  <div className="playing-bar" style={{ height: 10, width: 2.5 }} />
                  <div className="playing-bar" style={{ height: 14, width: 2.5, animationDelay: '0.2s' }} />
                  <div className="playing-bar" style={{ height: 8, width: 2.5, animationDelay: '0.4s' }} />
                </div>
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>

            {/* Title & Artist */}
            <div className="track-info-col">
              <img 
                src={track.imageSmall || track.image} 
                alt={track.title} 
                className="track-thumb" 
                loading="lazy" 
              />
              <div className="track-info-text">
                <span className="track-info-title">{track.title}</span>
                <span className="track-info-artist">
                  <ArtistLinks artistsString={track.artist} onSelectArtist={onSelectArtist} />
                </span>
              </div>
            </div>

            {/* Album */}
            <div className="track-album-col">
              {track.album || '—'}
            </div>

            {/* Duration */}
            <div className="track-duration-col">
              {formatDuration(track.duration)}
            </div>

            {/* Actions */}
            <div className="track-actions-col">
              {onToggleLike && (
                <button 
                  className={`icon-btn ${isLiked ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(track);
                  }}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart 
                    size={16} 
                    fill={isLiked ? '#ec4899' : 'none'} 
                    color={isLiked ? '#ec4899' : 'currentColor'} 
                  />
                </button>
              )}

              {onAddToPlaylist && (
                <button 
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                  }}
                  title="Add to Playlist"
                >
                  <Plus size={16} />
                </button>
              )}

              {onDownloadTrack && (
                <button 
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadTrack(track);
                  }}
                  title="Download 320kbps Audio"
                >
                  <Download size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
