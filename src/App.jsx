import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getHomepageData, 
  searchSongs, 
  getSongDetails, 
  getPlaylistDetails, 
  getAlbumDetails,
  getArtistDetails
} from './services/saavnApi';
import { getLyrics } from './services/lyricsApi';
import { audioEngine } from './services/audioEngine';
import { 
  getStoredLiked, 
  saveStoredLiked, 
  getStoredPlaylists, 
  saveStoredPlaylists, 
  getStoredHistory, 
  saveStoredHistory, 
  getStoredSettings, 
  saveStoredSettings 
} from './services/storage';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './components/HomeView';
import TrackList from './components/TrackList';
import PlayerBar from './components/PlayerBar';
import LyricsView from './components/LyricsView';
import VisualizerModal from './components/VisualizerModal';
import EqualizerModal from './components/EqualizerModal';
import QualitySelector from './components/QualitySelector';
import QueueDrawer from './components/QueueDrawer';
import PlaylistModal from './components/PlaylistModal';
import ArtistView from './components/ArtistView';
import AboutModal from './components/AboutModal';

import { Sparkles, TrendingUp, Music, ListMusic, Heart, Radio, Disc3, Disc, Music2 } from 'lucide-react';

export default function App() {
  // Navigation & History State (for < > buttons)
  const [activeTab, setActiveTab] = useState('home');
  const [navHistory, setNavHistory] = useState([{ tab: 'home', data: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Filter Categories in Header ('playlists' | 'trending' | 'artists' | 'albums')
  const [currentCategory, setCurrentCategory] = useState('playlists');

  // Sub-view details
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [viewDetails, setViewDetails] = useState(null); // { type, title, subtitle, image, songs: [] }
  const [artistDetails, setArtistDetails] = useState(null);

  // Data States
  const [homepageData, setHomepageData] = useState({
    trending: [],
    charts: [],
    topPlaylists: [],
    newAlbums: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chartTracks, setChartTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // LocalStorage Stores
  const [likedTracks, setLikedTracks] = useState(() => getStoredLiked());
  const [playlists, setPlaylists] = useState(() => getStoredPlaylists());
  const [playHistory, setPlayHistory] = useState(() => getStoredHistory());
  const [settings, setSettings] = useState(() => getStoredSettings());

  // Themes: 'lime' | 'crimson' | 'burgundy' | 'obsidian'
  const [theme, setTheme] = useState(() => settings.theme || 'lime');

  // Player Engine States
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // Volume & Mute States (with ref to always remember previous audible volume)
  const [volume, setVolume] = useState(() => (settings.volume != null ? settings.volume : 0.85));
  const [isMuted, setIsMuted] = useState(() => Boolean(settings.isMuted));
  const lastAudibleVolumeRef = useRef(settings.volume > 0.05 ? settings.volume : 0.85);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [bitrate, setBitrate] = useState(() => settings.bitrate || '320');

  // Modals & Overlays
  const [lyricsData, setLyricsData] = useState(null);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [playlistModalConfig, setPlaylistModalConfig] = useState({
    isOpen: false,
    mode: 'create',
    track: null
  });

  // History Navigation Handler
  const pushNavigation = useCallback((tab, data = null) => {
    setActiveTab(tab);
    setNavHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, { tab, data }];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleNavigateBack = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      const target = navHistory[nextIdx];
      setHistoryIndex(nextIdx);
      setActiveTab(target.tab);
      if (target.tab === 'playlist') setSelectedPlaylist(target.data);
      if (target.tab === 'details') setViewDetails(target.data);
      if (target.tab === 'artist') setArtistDetails(target.data);
    }
  };

  const handleNavigateForward = () => {
    if (historyIndex < navHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      const target = navHistory[nextIdx];
      setHistoryIndex(nextIdx);
      setActiveTab(target.tab);
      if (target.tab === 'playlist') setSelectedPlaylist(target.data);
      if (target.tab === 'details') setViewDetails(target.data);
      if (target.tab === 'artist') setArtistDetails(target.data);
    }
  };

  // Sync Audio Engine on Mount
  useEffect(() => {
    audioEngine.setVolume(volume);
    audioEngine.setMuted(isMuted);
    if (settings.eqPreset) {
      audioEngine.applyEqPreset(settings.eqPreset);
    }
  }, []);

  // Fetch Homepage Data on Mount
  useEffect(() => {
    async function loadHome() {
      setIsLoading(true);
      try {
        const data = await getHomepageData();
        setHomepageData(data);

        // Also fetch initial chart songs for the Charts tab
        const initialCharts = await searchSongs('Top 50 Global & India Hits', 1, 30);
        setChartTracks(initialCharts.songs);
      } catch (err) {
        console.warn('Using fallback data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHome();
  }, []);

  // Save changes to storage
  useEffect(() => {
    saveStoredLiked(likedTracks);
  }, [likedTracks]);

  useEffect(() => {
    saveStoredPlaylists(playlists);
  }, [playlists]);

  useEffect(() => {
    saveStoredHistory(playHistory);
  }, [playHistory]);

  useEffect(() => {
    saveStoredSettings({ 
      bitrate, 
      volume, 
      isMuted, 
      eqPreset: settings.eqPreset, 
      theme 
    });
  }, [bitrate, volume, isMuted, settings.eqPreset, theme]);

  // Handle Play Next Track
  const handleNextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      audioEngine.seek(0);
      audioEngine.resume();
      return;
    }

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIdx);
    const nextSong = queue[nextIdx];
    if (nextSong) {
      playTrack(nextSong);
    }
  }, [queue, queueIndex, repeatMode, isShuffle]);

  // Audio Engine Event Subscriptions
  useEffect(() => {
    const unsubTime = audioEngine.on('timeupdate', ({ currentTime: t, duration: d }) => {
      setCurrentTime(t);
      if (d && !isNaN(d)) setDuration(d);
    });

    const unsubProgress = audioEngine.on('progress', ({ buffered: b, duration: d }) => {
      setBuffered(b);
      if (d && !isNaN(d)) setDuration(d);
    });

    const unsubPlay = audioEngine.on('play', () => setIsPlaying(true));
    const unsubPause = audioEngine.on('pause', () => setIsPlaying(false));
    const unsubEnded = audioEngine.on('ended', () => handleNextTrack());

    const unsubVolume = audioEngine.on('volumechange', ({ volume: v, muted: m }) => {
      setVolume(v);
      setIsMuted(m);
    });

    return () => {
      unsubTime();
      unsubProgress();
      unsubPlay();
      unsubPause();
      unsubEnded();
      unsubVolume();
    };
  }, [handleNextTrack]);

  // Play a specific track
  const playTrack = useCallback(async (track, newQueue = null) => {
    if (!track) return;

    let fullTrack = track;
    if (!track.audioStreams || !track.audioStreams['320']) {
      try {
        const enriched = await getSongDetails(track.id);
        if (enriched) fullTrack = enriched;
      } catch (err) {
        console.warn('Could not enrich track audio stream:', err);
      }
    }

    setCurrentTrack(fullTrack);

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      const foundIdx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(foundIdx !== -1 ? foundIdx : 0);
    } else if (!queue.some((t) => t.id === track.id)) {
      setQueue((prev) => [fullTrack, ...prev]);
      setQueueIndex(0);
    }

    // Save to recently played history
    setPlayHistory((prev) => {
      const filtered = prev.filter((t) => t.id !== fullTrack.id);
      return [fullTrack, ...filtered].slice(0, 50);
    });

    // Start playback
    await audioEngine.playTrack(fullTrack, bitrate);

    // Fetch synchronized lyrics
    getLyrics(fullTrack.title, fullTrack.artist, fullTrack.duration)
      .then((lyrics) => setLyricsData(lyrics))
      .catch(() => setLyricsData(null));
  }, [bitrate, queue]);

  // Audio Engine MediaSession integration
  useEffect(() => {
    audioEngine.setupMediaSessionActions({
      onPlay: () => audioEngine.resume(),
      onPause: () => audioEngine.pause(),
      onPrevious: () => handlePreviousTrack(),
      onNext: () => handleNextTrack()
    });
  }, [handleNextTrack]);

  // Handle Play Previous Track
  const handlePreviousTrack = useCallback(() => {
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    setQueueIndex(prevIdx);
    const prevSong = queue[prevIdx];
    if (prevSong) {
      playTrack(prevSong);
    }
  }, [currentTime, queue, queueIndex, playTrack]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
    } else {
      audioEngine.togglePlay();
    }
  };

  // Seek
  const handleSeek = (timeSecs) => {
    audioEngine.seek(timeSecs);
    setCurrentTime(timeSecs);
  };

  // Rock-Solid Volume & Mute Handlers
  const handleVolumeChange = (newVol) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    audioEngine.setVolume(clamped);

    if (clamped > 0) {
      lastAudibleVolumeRef.current = clamped;
      if (isMuted) {
        setIsMuted(false);
        audioEngine.setMuted(false);
      }
    } else if (clamped === 0 && !isMuted) {
      setIsMuted(true);
      audioEngine.setMuted(true);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      // Unmuting: restore audible volume
      const targetVol = lastAudibleVolumeRef.current > 0.05 ? lastAudibleVolumeRef.current : 0.8;
      setIsMuted(false);
      audioEngine.setMuted(false);
      setVolume(targetVol);
      audioEngine.setVolume(targetVol);
    } else {
      // Muting: store volume before muting
      if (volume > 0.05) {
        lastAudibleVolumeRef.current = volume;
      }
      setIsMuted(true);
      audioEngine.setMuted(true);
    }
  };

  // Toggle Like / Favorite
  const handleToggleLike = (track) => {
    const target = track || currentTrack;
    if (!target) return;

    setLikedTracks((prev) => {
      const exists = prev.some((t) => t.id === target.id);
      if (exists) {
        return prev.filter((t) => t.id !== target.id);
      } else {
        return [target, ...prev];
      }
    });
  };

  // Bitrate Change
  const handleBitrateChange = (newBitrate) => {
    setBitrate(newBitrate);
    audioEngine.setBitrate(newBitrate);
  };

  // Search execution
  const handleSearch = async (query) => {
    if (!query) return;
    setSearchQuery(query);
    pushNavigation('search');
    setIsLoading(true);
    try {
      const res = await searchSongs(query, 1, 30);
      setSearchResults(res.songs);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Album / Playlist Details
  const handleOpenCollection = async (item) => {
    setIsLoading(true);
    try {
      if (item.type === 'album' || item.albumid) {
        const albumData = await getAlbumDetails(item.id);
        const data = {
          type: 'album',
          title: albumData.title,
          subtitle: `${albumData.artist} • ${albumData.year || ''}`,
          image: albumData.image,
          songs: albumData.songs
        };
        setViewDetails(data);
        pushNavigation('details', data);
      } else {
        const playlistData = await getPlaylistDetails(item.id);
        const data = {
          type: 'playlist',
          title: playlistData.title,
          subtitle: playlistData.subtitle,
          image: playlistData.image,
          songs: playlistData.songs
        };
        setViewDetails(data);
        pushNavigation('details', data);
      }
    } catch (e) {
      console.error('Failed to open collection:', e);
      handleSearch(item.title);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Singer / Artist Details
  const handleSelectArtist = async (artistNameOrId) => {
    if (!artistNameOrId) return;
    setIsLoading(true);
    try {
      const data = await getArtistDetails(artistNameOrId);
      setArtistDetails(data);
      pushNavigation('artist', data);
    } catch (e) {
      console.error('Failed to load artist details:', e);
      handleSearch(artistNameOrId);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Playlists Operations
  const handleCreatePlaylist = (name, description) => {
    const newPl = {
      id: `pl-${Date.now()}`,
      name,
      description,
      tracks: []
    };
    setPlaylists((prev) => [...prev, newPl]);
  };

  const handleAddTrackToPlaylist = (playlistId, track) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const already = pl.tracks.some((t) => t.id === track.id);
          if (already) return pl;
          return { ...pl, tracks: [...pl.tracks, track] };
        }
        return pl;
      })
    );
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(currentTime - 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.05));
          break;
        case 'KeyM':
          e.preventDefault();
          handleToggleMute();
          break;
        case 'KeyL':
          e.preventDefault();
          setIsLyricsOpen((prev) => !prev);
          break;
        case 'KeyV':
          e.preventDefault();
          setIsVisualizerOpen((prev) => !prev);
          break;
        case 'KeyE':
          e.preventDefault();
          setIsEqOpen((prev) => !prev);
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, volume, isMuted, currentTrack]);

  const likedSet = new Set(likedTracks.map((t) => t.id));

  return (
    <div className={`spicetify-chassis theme-${theme}`}>
      {/* Top Application Frame: Slim Icon Dock + Main Viewport */}
      <div className="spicetify-app-frame">
        {/* Left Spicetify Dock */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => pushNavigation(tab)}
          playlists={playlists}
          selectedPlaylistId={selectedPlaylist?.id}
          onSelectPlaylist={(pl) => {
            setSelectedPlaylist(pl);
            pushNavigation('playlist', pl);
          }}
          openCreatePlaylistModal={() => {
            setPlaylistModalConfig({ isOpen: true, mode: 'create', track: null });
          }}
          likedCount={likedTracks.length}
          onSelectArtist={handleSelectArtist}
        />

        {/* Main Content Area */}
        <main className="spicetify-main-viewport">
          {/* Spicetify Top Navigation Bar */}
          <Header
            onSearch={handleSearch}
            onSelectArtist={handleSelectArtist}
            onNavigateBack={handleNavigateBack}
            onNavigateForward={handleNavigateForward}
            canGoBack={historyIndex > 0}
            canGoForward={historyIndex < navHistory.length - 1}
            currentCategory={currentCategory}
            onSelectCategory={(catId) => setCurrentCategory(catId)}
            bitrate={bitrate}
            openQualityModal={() => setIsQualityOpen(true)}
            openEqModal={() => setIsEqOpen(true)}
            openAboutModal={() => setIsAboutOpen(true)}
            currentTheme={theme}
            onSelectTheme={(th) => setTheme(th)}
          />

          {/* Scrollable Content View */}
          <div className="content-scroll">
            {/* TAB 1: HOME / DISCOVER (Matching Image 4 & Image 5) */}
            {activeTab === 'home' && (
              <HomeView
                homepageData={homepageData}
                likedCount={likedTracks.length}
                likedTracks={likedTracks}
                currentCategory={currentCategory}
                onOpenLiked={() => pushNavigation('liked')}
                onOpenCollection={handleOpenCollection}
                onSelectArtist={handleSelectArtist}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlaySong={(track) => playTrack(track)}
              />
            )}

            {/* TAB 2: SEARCH RESULTS */}
            {activeTab === 'search' && (
              <div className="tab-view-container">
                <div className="section-header">
                  <h2 className="section-title">
                    Search Results for "{searchQuery || 'Popular'}"
                  </h2>
                  <span className="section-subtitle">{searchResults.length} tracks found</span>
                </div>

                <TrackList
                  tracks={searchResults}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track) => playTrack(track, searchResults)}
                  likedTrackIds={likedSet}
                  onToggleLike={handleToggleLike}
                  onSelectArtist={handleSelectArtist}
                  onAddToPlaylist={(track) => {
                    setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                  }}
                  onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
                />
              </div>
            )}

            {/* TAB 3: TOP CHARTS */}
            {activeTab === 'charts' && (
              <div className="tab-view-container">
                <div className="section-header">
                  <h2 className="section-title">
                    <TrendingUp size={22} color="var(--theme-accent)" />
                    Top 50 Global & Trending Charts
                  </h2>
                  <span className="section-subtitle">Real-time studio quality audio</span>
                </div>

                <TrackList
                  tracks={chartTracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track) => playTrack(track, chartTracks)}
                  likedTrackIds={likedSet}
                  onToggleLike={handleToggleLike}
                  onSelectArtist={handleSelectArtist}
                  onAddToPlaylist={(track) => {
                    setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                  }}
                  onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
                />
              </div>
            )}

            {/* TAB 4: LIKED SONGS */}
            {activeTab === 'liked' && (
              <div className="tab-view-container">
                <div className="section-header">
                  <h2 className="section-title">
                    <Heart size={22} fill="#ff334b" color="#ff334b" />
                    Liked Songs
                  </h2>
                  <span className="section-subtitle">{likedTracks.length} tracks saved</span>
                </div>

                <TrackList
                  tracks={likedTracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track) => playTrack(track, likedTracks)}
                  likedTrackIds={likedSet}
                  onToggleLike={handleToggleLike}
                  onSelectArtist={handleSelectArtist}
                  onAddToPlaylist={(track) => {
                    setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                  }}
                  onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
                />
              </div>
            )}

            {/* TAB 5: PLAYBACK HISTORY */}
            {activeTab === 'history' && (
              <div className="tab-view-container">
                <div className="section-header">
                  <h2 className="section-title">
                    <Radio size={22} color="var(--theme-accent)" />
                    Recently Played
                  </h2>
                  <span className="section-subtitle">{playHistory.length} tracks</span>
                </div>

                <TrackList
                  tracks={playHistory}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track) => playTrack(track, playHistory)}
                  likedTrackIds={likedSet}
                  onToggleLike={handleToggleLike}
                  onSelectArtist={handleSelectArtist}
                  onAddToPlaylist={(track) => {
                    setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                  }}
                  onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
                />
              </div>
            )}

            {/* TAB 6: CUSTOM PLAYLIST VIEW */}
            {activeTab === 'playlist' && selectedPlaylist && (
              <div className="tab-view-container">
                <div className="collection-header-wrap">
                  <div className="collection-cover-placeholder">
                    <ListMusic size={54} color="#fff" />
                  </div>
                  <div>
                    <span className="hires-tag">CUSTOM PLAYLIST</span>
                    <h1 className="collection-title">{selectedPlaylist.name}</h1>
                    <p className="collection-sub">
                      {selectedPlaylist.description || `${selectedPlaylist.tracks?.length || 0} tracks`}
                    </p>
                  </div>
                </div>

                <TrackList
                  tracks={selectedPlaylist.tracks || []}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track) => playTrack(track, selectedPlaylist.tracks)}
                  likedTrackIds={likedSet}
                  onToggleLike={handleToggleLike}
                  onSelectArtist={handleSelectArtist}
                  onAddToPlaylist={(track) => {
                    setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                  }}
                  onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
                />
              </div>
            )}

            {/* TAB 7: COLLECTION / ALBUM / PLAYLIST DETAILS VIEW */}
            {activeTab === 'details' && viewDetails && (
              <div className="tab-view-container">
                <div className="collection-header-wrap">
                  <img 
                    src={viewDetails.image} 
                    alt={viewDetails.title} 
                    className="collection-cover-img"
                  />
                  <div>
                    <span className="hires-tag">HI-RES {viewDetails.type?.toUpperCase()}</span>
                    <h1 className="collection-title">{viewDetails.title}</h1>
                    <p className="collection-sub">{viewDetails.subtitle}</p>
                  </div>
                </div>

                <TrackList
                  tracks={viewDetails.songs || []}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={(track) => playTrack(track, viewDetails.songs)}
                  likedTrackIds={likedSet}
                  onToggleLike={handleToggleLike}
                  onSelectArtist={handleSelectArtist}
                  onAddToPlaylist={(track) => {
                    setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                  }}
                  onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
                />
              </div>
            )}

            {/* TAB 8: SINGER / ARTIST PAGE */}
            {activeTab === 'artist' && (
              <ArtistView
                artist={artistDetails}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={(track) => playTrack(track, artistDetails?.songs)}
                onPlayAll={(songs) => {
                  if (songs && songs.length > 0) {
                    playTrack(songs[0], songs);
                  }
                }}
                onSelectAlbum={handleOpenCollection}
                likedTrackIds={likedSet}
                onToggleLike={handleToggleLike}
                onAddToPlaylist={(track) => {
                  setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                }}
                onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
              />
            )}
          </div>

          {/* Floating Album Art Widget in bottom right of main viewport (matching Image 4!) */}
          {currentTrack && (
            <div 
              className="spicetify-floating-cover"
              onClick={() => setIsLyricsOpen(true)}
              title={`Now Playing: ${currentTrack.title} • Click to open Synced Lyrics`}
            >
              <img 
                src={currentTrack.image} 
                alt={currentTrack.title} 
                className="floating-cover-img" 
              />
              <div className="floating-cover-overlay">
                <div className="floating-cover-title">{currentTrack.title}</div>
                <div className="floating-cover-artist">{currentTrack.artist}</div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Spicetify Audio Deck with Edge Seekbar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        bitrate={bitrate}
        isLiked={currentTrack ? likedSet.has(currentTrack.id) : false}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onPrevious={handlePreviousTrack}
        onNext={handleNextTrack}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => {
          const modes = ['off', 'all', 'one'];
          const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
          setRepeatMode(modes[nextIdx]);
        }}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleLike={() => handleToggleLike(currentTrack)}
        onOpenQualityModal={() => setIsQualityOpen(true)}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        isLyricsOpen={isLyricsOpen}
        onToggleVisualizer={() => setIsVisualizerOpen(!isVisualizerOpen)}
        isVisualizerOpen={isVisualizerOpen}
        onOpenEqModal={() => setIsEqOpen(true)}
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        isQueueOpen={isQueueOpen}
        onDownload={() => audioEngine.downloadCurrentTrack()}
        onSelectArtist={handleSelectArtist}
      />

      {/* Fullscreen Karaoke Synced Lyrics View */}
      {isLyricsOpen && (
        <LyricsView
          track={currentTrack}
          lyricsData={lyricsData}
          currentTime={currentTime}
          onSeek={handleSeek}
          onClose={() => setIsLyricsOpen(false)}
          onSelectArtist={handleSelectArtist}
        />
      )}

      {/* Real-Time Web Audio Spectrum Visualizer */}
      {isVisualizerOpen && (
        <VisualizerModal
          track={currentTrack}
          isPlaying={isPlaying}
          onClose={() => setIsVisualizerOpen(false)}
        />
      )}

      {/* 10-Band Equalizer Modal */}
      {isEqOpen && (
        <EqualizerModal
          currentPreset={settings.eqPreset}
          onPresetChange={(presetName) => {
            setSettings((prev) => ({ ...prev, eqPreset: presetName }));
          }}
          onClose={() => setIsEqOpen(false)}
        />
      )}

      {/* Audio Bitrate Selector Modal */}
      {isQualityOpen && (
        <QualitySelector
          currentBitrate={bitrate}
          onSelectBitrate={handleBitrateChange}
          onClose={() => setIsQualityOpen(false)}
        />
      )}

      {/* Playback Queue Drawer */}
      {isQueueOpen && (
        <QueueDrawer
          queue={queue}
          currentTrack={currentTrack}
          onPlayTrack={(track) => playTrack(track)}
          onRemoveFromQueue={(idx) => {
            setQueue((prev) => prev.filter((_, i) => i !== idx));
          }}
          onClearQueue={() => setQueue([])}
          onClose={() => setIsQueueOpen(false)}
          onSelectArtist={handleSelectArtist}
        />
      )}

      {/* Custom Playlist Create / Add Modal */}
      {playlistModalConfig.isOpen && (
        <PlaylistModal
          mode={playlistModalConfig.mode}
          trackToAdd={playlistModalConfig.track}
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          onAddTrackToPlaylist={handleAddTrackToPlaylist}
          onClose={() => setPlaylistModalConfig({ isOpen: false, mode: 'create', track: null })}
        />
      )}

      {/* About App Modal */}
      {isAboutOpen && (
        <AboutModal onClose={() => setIsAboutOpen(false)} />
      )}
    </div>
  );
}
