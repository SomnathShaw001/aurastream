import React from 'react';
import { Play, Pause, Heart, MoreVertical, Plus } from 'lucide-react';
import ArtistLinks from './ArtistLinks';

export default function TrackCard({ 
  item, 
  isPlaying, 
  isCurrent, 
  onPlay, 
  isLiked, 
  onToggleLike,
  onAddToPlaylist,
  onSelectArtist
}) {
  return (
    <div className="track-card" onClick={() => onPlay(item)}>
      <div className="card-cover-wrapper">
        <img 
          src={item.image} 
          alt={item.title} 
          className="card-cover" 
          loading="lazy" 
        />
        
        {/* Quality indicator badge */}
        <div className="card-badge">320K</div>

        {/* Play / Pause button on hover */}
        <button 
          className="card-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(item);
          }}
          title={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <Pause size={20} fill="#000000" />
          ) : (
            <Play size={20} fill="#000000" style={{ marginLeft: 2 }} />
          )}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="card-title" title={item.title}>
            {item.title}
          </div>
          <div className="card-artist" title={item.artist || item.subtitle}>
            {item.artist ? (
              <ArtistLinks artistsString={item.artist} onSelectArtist={onSelectArtist} />
            ) : (
              item.subtitle
            )}
          </div>
        </div>

        {onToggleLike && (
          <button 
            className={`icon-btn ${isLiked ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(item);
            }}
            title={isLiked ? 'Unlike' : 'Like'}
            style={{ padding: 4 }}
          >
            <Heart size={16} fill={isLiked ? '#ec4899' : 'none'} color={isLiked ? '#ec4899' : 'currentColor'} />
          </button>
        )}
      </div>
    </div>
  );
}
