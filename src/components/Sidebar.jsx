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
  // Sample featured artist avatars for the dock (matching Images 2, 4, 5)
  const quickArtists = [
    { name: 'The Weeknd', image: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_50x50.jpg' },
    { name: 'Ajay-Atul', image: 'https://c.saavncdn.com/artists/Ajay_Atul_003_20230228105414_50x50.jpg' },
    { name: 'Arijit Singh', image: 'https://c.saavncdn.com/artists/Arijit_Singh_002_20241003063000_50x50.jpg' },
    { name: 'Daft Punk', image: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-150x150.jpg' }
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

      {/* Custom Playlists Icons */}
      <div className="dock-scroll-items">
        {playlists.map((pl, idx) => (
          <button
            key={pl.id}
            className={`dock-avatar-btn ${activeTab === 'playlist' && selectedPlaylistId === pl.id ? 'active' : ''}`}
            onClick={() => onSelectPlaylist(pl)}
            title={`Playlist: ${pl.name}`}
          >
            {pl.tracks?.[0]?.image ? (
              <img src={pl.tracks[0].imageSmall || pl.tracks[0].image} alt={pl.name} className="dock-avatar-img" />
            ) : (
              <div className="dock-avatar-fallback" style={{ background: `hsl(${(idx * 65 + 180) % 360}, 70%, 45%)` }}>
                {pl.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </button>
        ))}

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
            <img src={art.image} alt={art.name} className="dock-avatar-img" />
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
