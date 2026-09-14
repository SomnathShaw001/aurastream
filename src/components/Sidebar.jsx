import React from 'react';
import { 
  Compass, 
  Search, 
  TrendingUp, 
  Heart, 
  ListMusic, 
  PlusCircle, 
  Radio, 
  Sparkles,
  Music2
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  playlists, 
  selectedPlaylistId, 
  onSelectPlaylist, 
  openCreatePlaylistModal,
  likedCount 
}) {
  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="logo-container" onClick={() => setActiveTab('home')}>
        <div className="logo-icon">
          <Music2 size={22} color="#ffffff" />
        </div>
        <div>
          <div className="logo-text">
            AuraStream
            <span className="hires-tag">HI-RES</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="nav-section">
        <div className="nav-label">Menu</div>
        
        <div 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Compass size={18} />
          <span>Discover</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={18} />
          <span>Search</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          <TrendingUp size={18} />
          <span>Top Charts</span>
        </div>
      </div>

      {/* Library Section */}
      <div className="nav-section">
        <div className="nav-label">Your Library</div>
        
        <div 
          className={`nav-item ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          <Heart size={18} />
          <span>Liked Songs</span>
          {likedCount > 0 && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '11px', 
              background: 'rgba(236, 72, 153, 0.2)', 
              color: '#f472b6', 
              padding: '2px 7px', 
              borderRadius: '10px' 
            }}>
              {likedCount}
            </span>
          )}
        </div>

        <div 
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Radio size={18} />
          <span>Recently Played</span>
        </div>
      </div>

      {/* Custom Playlists */}
      <div className="nav-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 6px' }}>
          <span className="nav-label" style={{ padding: 0, margin: 0 }}>Playlists</span>
          <button 
            onClick={openCreatePlaylistModal}
            className="icon-btn" 
            title="Create Playlist"
            style={{ padding: 2 }}
          >
            <PlusCircle size={16} />
          </button>
        </div>

        <div className="sidebar-playlists">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className={`nav-item ${activeTab === 'playlist' && selectedPlaylistId === pl.id ? 'active' : ''}`}
              onClick={() => onSelectPlaylist(pl)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              <ListMusic size={16} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pl.name}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-dim)' }}>
                {pl.tracks?.length || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
