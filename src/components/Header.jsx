import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Palette, 
  Sliders, 
  ShieldCheck, 
  User,
  Music,
  Info
} from 'lucide-react';
import { getAutocomplete } from '../services/saavnApi';

export default function Header({ 
  onSearch, 
  onSelectArtist,
  onNavigateBack,
  onNavigateForward,
  canGoBack,
  canGoForward,
  currentCategory,
  onSelectCategory,
  bitrate, 
  openQualityModal,
  openEqModal,
  openAboutModal,
  currentTheme,
  onSelectTheme
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ songs: [], albums: [], artists: [] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions({ songs: [], albums: [], artists: [] });
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await getAutocomplete(query);
        setSuggestions(results);
        setIsDropdownOpen(true);
      } catch (e) {
        console.error('Autocomplete error:', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsDropdownOpen(false);
      onSearch(query.trim());
    }
  };

  const handleSelectSong = (song) => {
    setIsDropdownOpen(false);
    onSearch(song.title);
  };

  const categories = [
    { id: 'playlists', label: 'Playlists' },
    { id: 'trending', label: 'Trending' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' }
  ];

  const themes = [
    { id: 'lime', name: 'Cyber Lime (Image 5)', color: '#b8ea24' },
    { id: 'crimson', name: 'Crimson Red (Image 4)', color: '#ff334b' },
    { id: 'burgundy', name: 'Burgundy & Cream (Image 2)', color: '#f5ebd7' },
    { id: 'obsidian', name: 'Obsidian Violet', color: '#8b5cf6' }
  ];

  const hasSuggestions = suggestions.songs.length > 0 || suggestions.albums.length > 0 || suggestions.artists.length > 0;

  return (
    <header className="spicetify-header">
      {/* Left History Buttons & Category Pills */}
      <div className="header-left-group">
        <div className="nav-arrows">
          <button 
            className="arrow-circle-btn" 
            onClick={onNavigateBack}
            title="Go back"
            disabled={!canGoBack}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            className="arrow-circle-btn" 
            onClick={onNavigateForward}
            title="Go forward"
            disabled={!canGoForward}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Category Pills (from screenshots) */}
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill ${currentCategory === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Search, Theme, Quality, EQ, User */}
      <div className="header-right-group">
        {/* Search input */}
        <div className="search-wrapper-compact" ref={searchRef}>
          <Search className="search-icon-compact" size={16} />
          <input 
            type="text"
            className="search-input-compact"
            placeholder="Search 80M+ songs, singers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (hasSuggestions) setIsDropdownOpen(true);
            }}
          />
          {query && (
            <button 
              className="icon-btn" 
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 2 }}
              onClick={() => { setQuery(''); setIsDropdownOpen(false); }}
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && hasSuggestions && (
            <div className="search-dropdown">
              {/* Artists Section */}
              {suggestions.artists.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--theme-accent)', padding: '6px 10px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Singers & Artists
                  </div>
                  {suggestions.artists.slice(0, 3).map((item) => (
                    <div 
                      key={item.id} 
                      className="search-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onSelectArtist) onSelectArtist(item.title);
                      }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="search-thumb" 
                        style={{ borderRadius: '50%', border: '1px solid var(--theme-accent)' }} 
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Artist • View all songs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Songs Section */}
              {suggestions.songs.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '6px 10px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Songs
                  </div>
                  {suggestions.songs.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      className="search-item"
                      onClick={() => handleSelectSong(item)}
                    >
                      <img src={item.image} alt={item.title} className="search-thumb" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Albums Section */}
              {suggestions.albums.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '6px 10px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Albums
                  </div>
                  {suggestions.albums.slice(0, 3).map((item) => (
                    <div 
                      key={item.id} 
                      className="search-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSearch(item.title);
                      }}
                    >
                      <img src={item.image} alt={item.title} className="search-thumb" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Picker Menu */}
        <div style={{ position: 'relative' }} ref={themeMenuRef}>
          <button 
            className="theme-badge-btn" 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            title="Switch UI Theme (Lime, Crimson, Burgundy, Violet)"
          >
            <Palette size={15} />
            <span style={{ textTransform: 'capitalize' }}>{currentTheme}</span>
          </button>

          {isThemeMenuOpen && (
            <div className="theme-dropdown-menu">
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '4px 8px', fontWeight: 700, textTransform: 'uppercase' }}>
                Preset Themes
              </div>
              {themes.map((th) => (
                <div 
                  key={th.id}
                  className={`theme-dropdown-item ${currentTheme === th.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectTheme(th.id);
                    setIsThemeMenuOpen(false);
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: th.color, boxShadow: `0 0 8px ${th.color}` }} />
                  <span>{th.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hi-Res Bitrate Badge */}
        <div 
          className="quality-pill" 
          onClick={openQualityModal}
          title="Streaming Audio Quality"
        >
          <div className="quality-pill-dot" />
          <span>{bitrate}K HI-RES</span>
        </div>

        {/* Equalizer Quick Button */}
        <button 
          className="icon-btn" 
          onClick={openEqModal}
          title="10-Band Equalizer"
        >
          <Sliders size={18} />
        </button>

        {/* About App Modal Trigger */}
        <button 
          className="icon-btn" 
          onClick={openAboutModal}
          title="About AuraStream Specialties & Links"
        >
          <Info size={18} />
        </button>

        {/* User Profile Avatar */}
        <div 
          className="user-avatar-circle" 
          onClick={openAboutModal}
          title="About AuraStream"
          style={{ cursor: 'pointer' }}
        >
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
