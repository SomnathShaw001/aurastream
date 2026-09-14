import React from 'react';
import { 
  Home,
  Search, 
  Heart, 
  ListMusic, 
  Plus, 
  Radio, 
  Sparkles,
  Music2,
  TrendingUp,
  Sliders
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  playlists, 
  selectedPlaylistId, 
  onSelectPlaylist, 
  openCreatePlaylistModal,
  likedCount,
  onSelectArtist
}) {
  // Sample featured artist avatars for the dock with verified working 200 OK CDN images
  const quickArtists = [
    { name: 'Arijit Singh', image: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_150x150.jpg' },
    { name: 'The Weeknd', image: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_150x150.jpg' },
    { name: 'Ajay-Atul', image: 'https://c.saavncdn.com/artists/Ajay_Atul_003_20230228105414_150x150.jpg' },
    { name: 'Pritam', image: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_150x150.jpg' },
    { name: 'Daft Punk', image: 'https://c.saavncdn.com/artists/Daft_Punk_20170921122444_150x150.jpg' },
    { name: 'Badshah', image: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_150x150.jpg' }
  ];

  return (
    <aside className="dock-sidebar">
      {/* Top Brand / Home Icon */}
      <button 
        className={`dock-btn ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
        title="Discover • Home"
      >
        <Music2 size={20} />
      </button>

      {/* Search Icon */}
      <button 
        className={`dock-btn ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => setActiveTab('search')}
        title="Search Catalog"
      >
        <Search size={20} />
      </button>

      {/* Liked Songs Icon */}
      <button 
        className={`dock-btn ${activeTab === 'liked' ? 'active' : ''}`}
        onClick={() => setActiveTab('liked')}
        title={`Liked Songs (${likedCount})`}
      >
        <Heart size={20} fill={activeTab === 'liked' ? 'currentColor' : 'none'} />
        {likedCount > 0 && <div className="dock-badge-dot" />}
      </button>

      {/* Charts Icon */}
      <button 
        className={`dock-btn ${activeTab === 'charts' ? 'active' : ''}`}
        onClick={() => setActiveTab('charts')}
        title="Top Charts & Trending"
      >
        <TrendingUp size={20} />
      </button>

      {/* Divider */}
      <div className="dock-divider" />

      {/* Custom Playlists Icons (with real picture covers, no LI/LA) */}
      <div className="dock-scroll-items">
        {playlists.map((pl, idx) => {
          const coverImg = pl.image || pl.tracks?.[0]?.imageSmall || pl.tracks?.[0]?.image;
          return (
            <button
              key={pl.id}
              className={`dock-avatar-btn ${activeTab === 'playlist' && selectedPlaylistId === pl.id ? 'active' : ''}`}
              onClick={() => onSelectPlaylist(pl)}
              title={`Playlist: ${pl.name}`}
            >
              {coverImg ? (
                <img 
                  src={coverImg} 
                  alt="" 
                  className="dock-avatar-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className="dock-avatar-fallback" 
                style={{ 
                  display: coverImg ? 'none' : 'flex',
                  background: `hsl(${(idx * 60 + 200) % 360}, 45%, 22%)`
                }}
              >
                <ListMusic size={14} color="var(--theme-accent)" />
                <span className="dock-small-text">{pl.name.slice(0, 2).toLowerCase()}</span>
              </div>
            </button>
          );
        })}

        {/* Quick Artists Circular Avatars */}
        {quickArtists.map((art) => (
          <button
            key={art.name}
            className="dock-avatar-btn"
            onClick={() => {
              if (onSelectArtist) onSelectArtist(art.name);
            }}
            title={`Singer: ${art.name}`}
          >
            <img 
              src={art.image} 
              alt="" 
              className="dock-avatar-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-family="sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">${encodeURIComponent(art.name[0])}</text></svg>`;
              }}
            />
          </button>
        ))}

        {/* Add New Playlist */}
        <button 
          className="dock-avatar-btn dock-add-btn"
          onClick={openCreatePlaylistModal}
          title="Create New Playlist"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Bottom History Icon */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button 
          className={`dock-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          title="Recently Played"
        >
          <Radio size={19} />
        </button>
      </div>
    </aside>
  );
}
