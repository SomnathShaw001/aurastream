import React from 'react';
import { Play, Shuffle, Check, Heart, Disc, Sparkles, UserCheck } from 'lucide-react';
import TrackList from './TrackList';

export default function ArtistView({
  artist,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayAll,
  onSelectAlbum,
  likedTrackIds,
  onToggleLike,
  onAddToPlaylist,
  onDownloadTrack
}) {
  if (!artist) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)' }}>
        Loading singer details...
      </div>
    );
  }

  const formatFollowers = (count) => {
    if (!count) return '1.2M+ Listeners';
    const num = parseInt(count.toString().replace(/,/g, ''), 10);
    if (isNaN(num)) return count;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M Monthly Listeners`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K Monthly Listeners`;
    return `${num} Monthly Listeners`;
  };

  return (
    <div className="artist-view">
      {/* Artist Hero Banner */}
      <div className="artist-hero-banner">
        {/* Blurred backdrop aura */}
        <div 
          className="artist-hero-bg" 
          style={{ backgroundImage: `url(${artist.image})` }} 
        />
        <div className="artist-hero-overlay" />

        <div className="artist-hero-content">
          <div className="artist-avatar-wrap">
            <img src={artist.image} alt={artist.name} className="artist-avatar" />
            <div className="artist-verified-badge" title="Verified Artist">
              <UserCheck size={16} color="#ffffff" />
            </div>
          </div>

          <div className="artist-meta">
            <div className="hero-tag" style={{ color: 'var(--accent-cyan)' }}>
              <Sparkles size={14} />
              <span>VERIFIED ARTIST • 320 KBPS HI-RES</span>
            </div>

            <h1 className="artist-name">{artist.name}</h1>

            <p className="artist-listeners">
              {formatFollowers(artist.followerCount)}
            </p>

            {artist.bio && (
              <p className="artist-bio">
                {artist.bio}
              </p>
            )}

            <div className="hero-actions" style={{ marginTop: 12 }}>
              <button 
                className="btn-primary" 
                onClick={() => onPlayAll(artist.songs)}
                disabled={!artist.songs || artist.songs.length === 0}
              >
                <Play size={18} fill="#000000" />
                <span>Play Discography</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Top Songs */}
      <div style={{ marginTop: 36 }}>
        <div className="section-header">
          <h2 className="section-title">
            <Sparkles size={20} color="var(--theme-accent, #10b981)" />
            Popular Tracks
          </h2>
          <span className="section-subtitle">Stream in Studio Quality (320 kbps)</span>
        </div>

        {artist.isLoading && (!artist.songs || artist.songs.length === 0) ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 14px' }} />
            <p style={{ fontSize: 14 }}>Fetching discography & top tracks...</p>
          </div>
        ) : (
          <TrackList
            tracks={artist.songs || []}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={onPlayTrack}
            likedTrackIds={likedTrackIds}
            onToggleLike={onToggleLike}
            onAddToPlaylist={onAddToPlaylist}
            onDownloadTrack={onDownloadTrack}
          />
        )}
      </div>

      {/* Albums & Discography (if any) */}
      {artist.albums && artist.albums.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div className="section-header">
            <h2 className="section-title">
              <Disc size={20} color="var(--accent-primary)" />
              Albums & Singles
            </h2>
            <span className="section-subtitle">{artist.albums.length} releases</span>
          </div>

          <div className="cards-grid">
            {artist.albums.map((album) => (
              <div 
                key={album.id} 
                className="track-card"
                onClick={() => onSelectAlbum(album)}
              >
                <div className="card-cover-wrapper">
                  <img src={album.image} alt={album.title} className="card-cover" loading="lazy" />
                  <div className="card-badge">ALBUM</div>
                  <button className="card-play-btn" title="View Album">
                    <Play size={20} fill="#000000" style={{ marginLeft: 2 }} />
                  </button>
                </div>
                <div className="card-title" title={album.title}>
                  {album.title}
                </div>
                <div className="card-artist">
                  {album.year || 'Album'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
