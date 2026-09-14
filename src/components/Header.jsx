import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sliders, Disc, Sparkles, Music } from 'lucide-react';
import { getAutocomplete } from '../services/saavnApi';

export default function Header({ 
  onSearch, 
  onSelectTrack, 
  onSelectAlbum, 
  bitrate, 
  openQualityModal,
  openEqModal
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ songs: [], albums: [], artists: [] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

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

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
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

  return (
    <header className="app-header">
      {/* Search Bar */}
      <div className="search-wrapper" ref={searchRef}>
        <Search className="search-icon" size={18} />
        <input 
          type="text"
          className="search-input"
          placeholder="Search 80M+ songs, albums, or artists in 320kbps..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.songs.length > 0) setIsDropdownOpen(true);
          }}
        />
        {query && (
          <button 
            className="icon-btn" 
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            onClick={() => { setQuery(''); setIsDropdownOpen(false); }}
          >
            <X size={16} />
          </button>
        )}

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && (suggestions.songs.length > 0 || suggestions.albums.length > 0) && (
          <div className="search-dropdown">
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

      {/* Header Actions */}
      <div className="header-actions">
        {/* Audio Quality Badge */}
        <div 
          className="quality-pill" 
          onClick={openQualityModal}
          title="Adjust Audio Bitrate"
        >
          <div className="quality-pill-dot" />
          <span>{bitrate} KBPS HI-RES</span>
        </div>

        {/* Equalizer Quick Trigger */}
        <button 
          className="btn-secondary" 
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={openEqModal}
          title="10-Band Equalizer"
        >
          <Sliders size={15} />
          <span>Equalizer</span>
        </button>
      </div>
    </header>
  );
}
