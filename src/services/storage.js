const KEYS = {
  LIKED: 'aurastream_liked_tracks',
  PLAYLISTS: 'aurastream_user_playlists',
  HISTORY: 'aurastream_play_history',
  SETTINGS: 'aurastream_settings'
};

export const getStoredLiked = () => {
  try {
    const raw = localStorage.getItem(KEYS.LIKED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse liked tracks:', e);
    return [];
  }
};

export const saveStoredLiked = (tracks) => {
  try {
    localStorage.setItem(KEYS.LIKED, JSON.stringify(tracks));
  } catch (e) {
    console.error('Failed to save liked tracks:', e);
  }
};

export const getStoredPlaylists = () => {
  try {
    const raw = localStorage.getItem(KEYS.PLAYLISTS);
    let parsed = raw ? JSON.parse(raw) : null;

    const defaultPlaylists = [
      {
        id: 'chill-mix',
        name: 'Late Night Chill',
        description: 'Atmospheric vibes and deep beats',
        image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
        tracks: []
      },
      {
        id: 'acoustic-vibes',
        name: 'Acoustic Studio',
        description: 'Warm acoustic sounds & vocals',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
        tracks: []
      }
    ];

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return defaultPlaylists;
    }

    // Remove redundant 'favorites' playlist if present (since Liked Songs has dedicated dock icon)
    const filtered = parsed.filter((p) => p.id !== 'favorites');
    if (filtered.length === 0) return defaultPlaylists;

    // Ensure playlists have valid image covers
    return filtered.map((pl) => {
      if (!pl.image && pl.id === 'chill-mix') {
        return { ...pl, image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80' };
      }
      return pl;
    });
  } catch (e) {
    return [];
  }
};

export const saveStoredPlaylists = (playlists) => {
  try {
    localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
  } catch (e) {
    console.error('Failed to save playlists:', e);
  }
};

export const getStoredHistory = () => {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredHistory = (history) => {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
};

export const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : {
      bitrate: '320',
      volume: 0.85,
      isMuted: false,
      eqPreset: 'Electronic',
      theme: 'lime' // 'lime' | 'crimson' | 'burgundy' | 'obsidian'
    };
  } catch (e) {
    return { bitrate: '320', volume: 0.85, isMuted: false, eqPreset: 'Electronic', theme: 'lime' };
  }
};

export const saveStoredSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};
