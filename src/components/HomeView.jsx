import React from 'react';
import { Heart, Sparkles, TrendingUp, ListMusic, Play, Disc, Users } from 'lucide-react';
import TrackCard from './TrackCard';

export default function HomeView({
  homepageData,
  likedCount,
  likedTracks,
  currentCategory,
  onOpenLiked,
  onOpenCollection,
  onSelectArtist,
  currentTrack,
  isPlaying,
  onPlaySong
}) {
  const sampleLikedArtists = likedTracks.slice(0, 4).map((t) => t.artist).join(' • ');

  // Featured artists list with verified 200 OK high-res circular avatars
  const featuredArtists = [
    { name: 'Arijit Singh', image: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg' },
    { name: 'The Weeknd', image: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg' },
    { name: 'Pritam', image: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg' },
    { name: 'Badshah', image: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg' },
    { name: 'Ajay-Atul', image: 'https://c.saavncdn.com/artists/Ajay_Atul_003_20230228105414_500x500.jpg' },
    { name: 'Daft Punk', image: 'https://c.saavncdn.com/artists/Daft_Punk_20170921122444_500x500.jpg' },
    { name: 'Shreya Ghoshal', image: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg' },
    { name: 'Anirudh Ravichander', image: 'https://c.saavncdn.com/artists/Anirudh_Ravichander_003_20260121134149_500x500.jpg' }
  ];

  return (
    <div className="home-view-container">
      {/* Top Featured Cards (matching Image 4) */}
      <div className="home-featured-grid">
        {/* Large Liked Songs Card */}
        <div className="featured-card liked-songs-card" onClick={onOpenLiked}>
          <div className="liked-card-artists">
            {sampleLikedArtists || 'Save your favorite high-res tracks here'}
          </div>
          <div className="liked-card-bottom">
            <h2 className="liked-card-title">Liked Songs</h2>
            <p className="liked-card-count">{likedCount} liked songs</p>
          </div>
          <button className="card-play-btn floating-play-btn" title="Play Liked Songs">
            <Play size={22} fill="#ffffff" style={{ marginLeft: 2 }} />
          </button>
        </div>

        {/* Quick Featured Playlist Cards */}
        {homepageData.topPlaylists.slice(0, 3).map((item) => (
          <div 
            key={item.id} 
            className="featured-card quick-pl-card"
            onClick={() => onOpenCollection(item)}
          >
            <img 
              src={item.image} 
              alt="" 
              className="quick-pl-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <div className="quick-pl-meta">
              <span className="quick-pl-title">{item.title}</span>
              <span className="quick-pl-sub">{item.subtitle}</span>
            </div>
            <button className="card-play-btn" style={{ position: 'static', opacity: 1, transform: 'none', width: 38, height: 38 }}>
              <Play size={18} fill="#ffffff" style={{ marginLeft: 2 }} />
            </button>
          </div>
        ))}
      </div>

      {/* SECTION 1: Trending Tracks & Hits */}
      {(!currentCategory || currentCategory === 'trending' || currentCategory === 'playlists') && (
        <div className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--theme-accent)" />
              Trending & New Releases
            </h2>
            <span className="section-subtitle">Studio Master 320 kbps</span>
          </div>

          <div className="cards-grid">
            {homepageData.trending.slice(0, 10).map((item) => (
              <TrackCard
                key={item.id}
                item={item}
                isPlaying={isPlaying && currentTrack?.id === item.id}
                isCurrent={currentTrack?.id === item.id}
                onPlay={() => onOpenCollection(item)}
                onSelectArtist={onSelectArtist}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Popular Singers & Artists (Clickable to Singer Page) */}
      {(!currentCategory || currentCategory === 'artists') && (
        <div className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              <Users size={20} color="var(--theme-accent)" />
              Popular Singers & Artists
            </h2>
            <span className="section-subtitle">Click to view all songs</span>
          </div>

          <div className="artists-circles-grid">
            {featuredArtists.map((artist) => (
              <div 
                key={artist.name} 
                className="artist-circle-card"
                onClick={() => onSelectArtist(artist.name)}
                title={`Open ${artist.name}'s page`}
              >
                <div className="artist-circle-img-wrap">
                  <img 
                    src={artist.image} 
                    alt="" 
                    className="artist-circle-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-family="sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">${encodeURIComponent(artist.name[0])}</text></svg>`;
                    }}
                  />
                  <div className="artist-hover-play">
                    <Play size={20} fill="#ffffff" style={{ marginLeft: 2 }} />
                  </div>
                </div>
                <div className="artist-circle-name">{artist.name}</div>
                <div className="artist-circle-sub">Artist</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Popular Charts */}
      {(!currentCategory || currentCategory === 'trending' || currentCategory === 'playlists') && homepageData.charts.length > 0 && (
        <div className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={20} color="var(--theme-accent)" />
              Popular Charts
            </h2>
            <span className="section-subtitle">Billboard & Regional Charts</span>
          </div>

          <div className="cards-grid">
            {homepageData.charts.slice(0, 8).map((item) => (
              <TrackCard
                key={item.id}
                item={item}
                onPlay={() => onOpenCollection(item)}
                onSelectArtist={onSelectArtist}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Top Albums */}
      {(!currentCategory || currentCategory === 'albums') && homepageData.newAlbums.length > 0 && (
        <div className="home-section">
          <div className="section-header">
            <h2 className="section-title">
              <Disc size={20} color="var(--theme-accent)" />
              Featured Albums & EPs
            </h2>
            <span className="section-subtitle">Full Hi-Res tracklists</span>
          </div>

          <div className="cards-grid">
            {homepageData.newAlbums.slice(0, 8).map((item) => (
              <TrackCard
                key={item.id}
                item={item}
                onPlay={() => onOpenCollection(item)}
                onSelectArtist={onSelectArtist}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
