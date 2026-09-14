import React, { useState, useEffect, useCallback } from 'react';
import { 
  getHomepageData, 
  searchSongs, 
  getSongDetails, 
  getPlaylistDetails, 
  getAlbumDetails 
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
import HeroBanner from './components/HeroBanner';
import TrackCard from './components/TrackCard';
import TrackList from './components/TrackList';
import PlayerBar from './components/PlayerBar';
import LyricsView from './components/LyricsView';
import VisualizerModal from './components/VisualizerModal';
import EqualizerModal from './components/EqualizerModal';
import QualitySelector from './components/QualitySelector';
import QueueDrawer from './components/QueueDrawer';
import PlaylistModal from './components/PlaylistModal';

import { Sparkles, TrendingUp, Music, ListMusic, Heart, Radio, Disc3, Disc } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [viewDetails, setViewDetails] = useState(null); // { title, subtitle, image, songs: [] }

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

  // Player Engine States
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(settings.volume ?? 0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [bitrate, setBitrate] = useState(settings.bitrate || '320');

  // Modals & Overlays
  const [lyricsData, setLyricsData] = useState(null);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playlistModalConfig, setPlaylistModalConfig] = useState({
    isOpen: false,
    mode: 'create',
    track: null
  });

  // Fetch Homepage Data on Mount
  useEffect(() => {
    async function loadHome() {
      setIsLoading(true);
      try {
        const data = await getHomepageData();
        setHomepageData(data);

        // Also fetch initial chart songs for the Charts tab
        const initialCharts = await searchSongs('Top 50 India Global Hits', 1, 30);
        setChartTracks(initialCharts.songs);
      } catch (err) {
        console.warn('Using fallback trending songs due to network:', err);
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
    saveStoredSettings({ bitrate, volume, eqPreset: settings.eqPreset });
  }, [bitrate, volume, settings.eqPreset]);

  // Set audio engine volume
  useEffect(() => {
    audioEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

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

    const unsubEnded = audioEngine.on('ended', () => {
      handleNextTrack();
    });

    return () => {
      unsubTime();
      unsubProgress();
      unsubPlay();
      unsubPause();
      unsubEnded();
    };
  }, [queue, queueIndex, repeatMode, isShuffle]);

  // MediaSession Action Handlers
  useEffect(() => {
    audioEngine.setupMediaSessionActions({
      onPlay: () => audioEngine.resume(),
      onPause: () => audioEngine.pause(),
      onNext: () => handleNextTrack(),
      onPrevious: () => handlePreviousTrack()
    });
  }, [queue, queueIndex, repeatMode, isShuffle]);

  // Play track handler
  const playTrack = useCallback(async (track, trackList = null) => {
    if (!track) return;

    setCurrentTrack(track);

    // If new trackList provided, update queue
    if (trackList && Array.isArray(trackList)) {
      setQueue(trackList);
      const foundIdx = trackList.findIndex((t) => t.id === track.id);
      setQueueIndex(foundIdx >= 0 ? foundIdx : 0);
    }

    // Add to history
    setPlayHistory((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      return [track, ...filtered].slice(0, 50);
    });

    // Start playback
    await audioEngine.playTrack(track, bitrate);

    // Fetch Lyrics in background
    getLyrics(track.title, track.artist, track.album, track.duration)
      .then((lyrics) => setLyricsData(lyrics))
      .catch(() => setLyricsData(null));
  }, [bitrate]);

  // Next track in queue
  const handleNextTrack = useCallback(() => {
    if (repeatMode === 'one' && currentTrack) {
      audioEngine.seek(0);
      audioEngine.resume();
      return;
    }

    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        return; // End of queue
      }
    }

    setQueueIndex(nextIdx);
    const nextSong = queue[nextIdx];
    if (nextSong) {
      playTrack(nextSong);
    }
  }, [queue, queueIndex, repeatMode, isShuffle, currentTrack, playTrack]);

  // Previous track in queue
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

  // Volume
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
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
    setActiveTab('search');
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
        setViewDetails({
          type: 'album',
          title: albumData.title,
          subtitle: `${albumData.artist} • ${albumData.year || ''}`,
          image: albumData.image,
          songs: albumData.songs
        });
        setActiveTab('details');
      } else {
        const playlistData = await getPlaylistDetails(item.id);
        setViewDetails({
          type: 'playlist',
          title: playlistData.title,
          subtitle: playlistData.subtitle,
          image: playlistData.image,
          songs: playlistData.songs
        });
        setActiveTab('details');
      }
    } catch (e) {
      console.error('Failed to open collection:', e);
      // Fallback: search by title
      handleSearch(item.title);
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

  // Dynamic Featured Track for Hero Banner
  const featuredTrack = currentTrack || 
    (homepageData.trending?.[0]?.title ? {
      title: homepageData.trending[0].title,
      subtitle: homepageData.trending[0].subtitle,
      image: homepageData.trending[0].image,
      id: homepageData.trending[0].id
    } : {
      title: 'Starboy',
      subtitle: 'The Weeknd feat. Daft Punk',
      image: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
      id: 'TcDP-KUl'
    });

  return (
    <div className="app-container">
      {/* Ambient background glow */}
      <div className="ambient-glow">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playlists={playlists}
        selectedPlaylistId={selectedPlaylist?.id}
        onSelectPlaylist={(pl) => {
          setSelectedPlaylist(pl);
          setActiveTab('playlist');
        }}
        openCreatePlaylistModal={() => {
          setPlaylistModalConfig({ isOpen: true, mode: 'create', track: null });
        }}
        likedCount={likedTracks.length}
      />

      {/* Main Viewport */}
      <main className="main-viewport">
        <Header
          onSearch={handleSearch}
          bitrate={bitrate}
          openQualityModal={() => setIsQualityOpen(true)}
          openEqModal={() => setIsEqOpen(true)}
        />

        <div className="content-scroll">
          {/* TAB 1: HOME / DISCOVER */}
          {activeTab === 'home' && (
            <>
              <HeroBanner
                featuredTrack={featuredTrack}
                onPlay={(track) => {
                  if (track.audioStreams) {
                    playTrack(track);
                  } else {
                    handleSearch(track.title);
                  }
                }}
              />

              {/* Trending Tracks & Albums */}
              <div>
                <div className="section-header">
                  <h2 className="section-title">
                    <Sparkles size={20} color="var(--accent-cyan)" />
                    Trending & New Releases
                  </h2>
                  <span className="section-subtitle">Streamed in Hi-Res 320 kbps</span>
                </div>

                <div className="cards-grid">
                  {homepageData.trending.slice(0, 10).map((item) => (
                    <TrackCard
                      key={item.id}
                      item={item}
                      isPlaying={isPlaying && currentTrack?.id === item.id}
                      isCurrent={currentTrack?.id === item.id}
                      onPlay={() => handleOpenCollection(item)}
                    />
                  ))}
                </div>
              </div>

              {/* Top Editorial Playlists */}
              {homepageData.topPlaylists.length > 0 && (
                <div>
                  <div className="section-header">
                    <h2 className="section-title">
                      <ListMusic size={20} color="var(--accent-primary)" />
                      Featured Playlists
                    </h2>
                    <span className="section-subtitle">Curated for high-resolution streaming</span>
                  </div>

                  <div className="cards-grid">
                    {homepageData.topPlaylists.slice(0, 8).map((item) => (
                      <TrackCard
                        key={item.id}
                        item={item}
                        onPlay={() => handleOpenCollection(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Top Charts Modules */}
              {homepageData.charts.length > 0 && (
                <div>
                  <div className="section-header">
                    <h2 className="section-title">
                      <TrendingUp size={20} color="var(--accent-gold)" />
                      Popular Charts
                    </h2>
                    <span className="section-subtitle">Official Billboard and Regional Charts</span>
                  </div>

                  <div className="cards-grid">
                    {homepageData.charts.slice(0, 8).map((item) => (
                      <TrackCard
                        key={item.id}
                        item={item}
                        onPlay={() => handleOpenCollection(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: SEARCH RESULTS */}
          {activeTab === 'search' && (
            <div>
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
                onAddToPlaylist={(track) => {
                  setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                }}
                onDownloadTrack={(track) => {
                  audioEngine.downloadCurrentTrack();
                }}
              />
            </div>
          )}

          {/* TAB 3: TOP CHARTS */}
          {activeTab === 'charts' && (
            <div>
              <div className="section-header">
                <h2 className="section-title">
                  <TrendingUp size={22} color="var(--accent-gold)" />
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
                onAddToPlaylist={(track) => {
                  setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                }}
                onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
              />
            </div>
          )}

          {/* TAB 4: LIKED SONGS */}
          {activeTab === 'liked' && (
            <div>
              <div className="section-header">
                <h2 className="section-title">
                  <Heart size={22} fill="var(--accent-pink)" color="var(--accent-pink)" />
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
                onAddToPlaylist={(track) => {
                  setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                }}
                onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
              />
            </div>
          )}

          {/* TAB 5: PLAYBACK HISTORY */}
          {activeTab === 'history' && (
            <div>
              <div className="section-header">
                <h2 className="section-title">
                  <Radio size={22} color="var(--accent-cyan)" />
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
                onAddToPlaylist={(track) => {
                  setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                }}
                onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
              />
            </div>
          )}

          {/* TAB 6: CUSTOM PLAYLIST VIEW */}
          {activeTab === 'playlist' && selectedPlaylist && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
                <div style={{
                  width: 140,
                  height: 140,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  <ListMusic size={54} color="#fff" />
                </div>
                <div>
                  <span className="hires-tag">CUSTOM PLAYLIST</span>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginTop: 8 }}>
                    {selectedPlaylist.name}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 4 }}>
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
                onAddToPlaylist={(track) => {
                  setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                }}
                onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
              />
            </div>
          )}

          {/* TAB 7: COLLECTION / ALBUM / PLAYLIST DETAILS VIEW */}
          {activeTab === 'details' && viewDetails && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
                <img 
                  src={viewDetails.image} 
                  alt={viewDetails.title} 
                  style={{ width: 140, height: 140, borderRadius: 16, objectFit: 'cover', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                />
                <div>
                  <span className="hires-tag">HI-RES {viewDetails.type?.toUpperCase()}</span>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginTop: 8 }}>
                    {viewDetails.title}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 4 }}>
                    {viewDetails.subtitle}
                  </p>
                </div>
              </div>

              <TrackList
                tracks={viewDetails.songs || []}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={(track) => playTrack(track, viewDetails.songs)}
                likedTrackIds={likedSet}
                onToggleLike={handleToggleLike}
                onAddToPlaylist={(track) => {
                  setPlaylistModalConfig({ isOpen: true, mode: 'add_track', track });
                }}
                onDownloadTrack={() => audioEngine.downloadCurrentTrack()}
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Persistent Audio Control Deck */}
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
      />

      {/* Fullscreen Karaoke Synced Lyrics View */}
      {isLyricsOpen && (
        <LyricsView
          track={currentTrack}
          lyricsData={lyricsData}
          currentTime={currentTime}
          onSeek={handleSeek}
          onClose={() => setIsLyricsOpen(false)}
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
    </div>
  );
}
