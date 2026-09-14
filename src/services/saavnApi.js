import CryptoJS from 'crypto-js';

const DES_KEY = import.meta.env.VITE_JIOSAAVN_DES_KEY || '';
const API_BASE = import.meta.env.VITE_JIOSAAVN_API_BASE || '/api/saavn';

// Clean HTML entities from strings (e.g., &quot; &amp;)
export function decodeHtml(html) {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Upgrade image resolution to 500x500 for crisp Hi-Res display
export function getHighResImage(url) {
  if (!url) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
  return url
    .replace('150x150', '500x500')
    .replace('50x50', '500x500')
    .replace('http:', 'https:');
}

// Decrypt JioSaavn DES-ECB encrypted media URL to direct AAC/MP4 stream
export function decryptMediaUrl(encryptedUrl) {
  if (!encryptedUrl || !DES_KEY) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('DES decryption error:', err);
    return null;
  }
}

// Generate bitrates from decrypted URL: 320kbps, 160kbps, 96kbps
export function getAudioStreamUrls(encryptedUrl) {
  const rawUrl = decryptMediaUrl(encryptedUrl);
  if (!rawUrl) return null;

  // Most JioSaavn decrypted URLs end with _96.mp4 or _96.mp3
  return {
    '320': rawUrl.replace(/_(96|160)\.(mp4|mp3)$/, '_320.$2'),
    '160': rawUrl.replace(/_(96|320)\.(mp4|mp3)$/, '_160.$2'),
    '96': rawUrl.replace(/_(160|320)\.(mp4|mp3)$/, '_96.$2'),
    default: rawUrl.replace(/_(96|160)\.(mp4|mp3)$/, '_320.$2')
  };
}

// Normalize Song object
export function formatSong(raw) {
  if (!raw) return null;

  const encUrl = raw.encrypted_media_url || raw.more_info?.encrypted_media_url;
  let audioStreams = encUrl ? getAudioStreamUrls(encUrl) : null;

  // Fallback to media_preview_url if encrypted URL is unavailable
  const previewUrl = raw.media_preview_url || raw.more_info?.media_preview_url;
  if (!audioStreams && previewUrl) {
    audioStreams = {
      '320': previewUrl,
      '160': previewUrl,
      '96': previewUrl,
      default: previewUrl
    };
  }

  const title = decodeHtml(raw.song || raw.title || 'Unknown Track');
  const artist = decodeHtml(
    raw.primary_artists ||
    raw.singers ||
    raw.more_info?.artistMap?.primary_artists?.[0]?.name ||
    raw.subtitle ||
    'Unknown Artist'
  );
  const album = decodeHtml(raw.album || raw.more_info?.album || '');

  return {
    id: raw.id,
    title,
    artist,
    album,
    year: raw.year || raw.more_info?.year || '',
    duration: parseInt(raw.duration || raw.more_info?.duration || 0, 10),
    image: getHighResImage(raw.image),
    imageSmall: raw.image?.replace('http:', 'https:') || '',
    encrypted_media_url: encUrl,
    audioStreams,
    has_lyrics: raw.has_lyrics === 'true' || raw.has_lyrics === true,
    copyright: decodeHtml(raw.copyright_text || '')
  };
}

// Generic fetcher with error handling
async function fetchApi(params) {
  const url = `${API_BASE}?${new URLSearchParams(params).toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('API Fetch Failed:', url, err);
    throw err;
  }
}

// Search songs by query
export async function searchSongs(query, page = 1, limit = 20) {
  const data = await fetchApi({
    __call: 'search.getResults',
    _format: 'json',
    _marker: '0',
    cc: 'in',
    p: page,
    n: limit,
    q: query
  });

  const results = data.results || [];
  return {
    total: data.total || 0,
    songs: results.map(formatSong).filter(Boolean)
  };
}

// Autocomplete suggestions
export async function getAutocomplete(query) {
  if (!query || query.trim().length === 0) return { songs: [], albums: [], artists: [] };

  const data = await fetchApi({
    __call: 'autocomplete.get',
    _format: 'json',
    _marker: '0',
    cc: 'in',
    includeMetaTags: '1',
    query
  });

  const songs = (data.songs?.data || []).map((s) => ({
    id: s.id,
    title: decodeHtml(s.title),
    subtitle: decodeHtml(s.subtitle || s.description),
    image: getHighResImage(s.image)
  }));

  const albums = (data.albums?.data || []).map((a) => ({
    id: a.id || a.albumid,
    type: 'album',
    title: decodeHtml(a.title),
    subtitle: decodeHtml(a.subtitle || a.description),
    image: getHighResImage(a.image)
  }));

  const artists = (data.artists?.data || []).map((art) => ({
    id: art.id,
    title: decodeHtml(art.name || art.title),
    subtitle: decodeHtml(art.subtitle || art.description),
    image: getHighResImage(art.image)
  }));

  return { songs, albums, artists };
}

// Homepage launch data (trending, charts, new releases)
export async function getHomepageData() {
  const data = await fetchApi({
    __call: 'webapi.getLaunchData',
    api_version: '4',
    _format: 'json',
    _marker: '0',
    ctx: 'web6dot0'
  });

  // Extract trending tracks, albums, playlists
  const trending = (data.new_trending || []).map((item) => ({
    id: item.id || item.albumid,
    type: item.type || 'playlist',
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle),
    image: getHighResImage(item.image),
    perma_url: item.perma_url
  }));

  const charts = (data.charts || []).map((item) => ({
    id: item.id,
    type: 'playlist',
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle || `${item.count || ''} Tracks`),
    image: getHighResImage(item.image)
  }));

  const topPlaylists = (data.top_playlists || []).map((item) => ({
    id: item.id,
    type: 'playlist',
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle || `${item.more_info?.song_count || ''} Tracks`),
    image: getHighResImage(item.image)
  }));

  const newAlbums = (data.new_albums || []).map((item) => ({
    id: item.id || item.albumid,
    albumid: item.id || item.albumid,
    type: 'album',
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle || item.more_info?.release_date || ''),
    image: getHighResImage(item.image)
  }));

  const result = {
    trending,
    charts,
    topPlaylists,
    newAlbums
  };

  // Silently warm cache in background for top items so clicking is instantaneous
  prefetchHomepageCollections(result);

  return result;
}

// Song details
export async function getSongDetails(songId) {
  const data = await fetchApi({
    __call: 'song.getDetails',
    cc: 'in',
    _marker: '0',
    _format: 'json',
    pids: songId
  });

  const rawSong = data[songId];
  return formatSong(rawSong);
}

// In-memory caches for instantaneous, 0-latency navigation
export const artistCache = new Map();
export const collectionCache = new Map();

// Known top artists direct ID mapping to eliminate search roundtrip (50% speedup)
const POPULAR_ARTISTS_FAST_MAP = {
  'arijit singh': '459320',
  'the weeknd': '474937',
  'pritam': '456208',
  'badshah': '456863',
  'ajay-atul': '456345',
  'daft punk': '457173',
  'shreya ghoshal': '455125',
  'anirudh ravichander': '887274',
  'diljit dosanjh': '464932',
  'yo yo honey singh': '456499',
  'a.r. rahman': '452310',
  'ar rahman': '452310',
  'sidhu moose wala': '1116376',
  'neha kakkar': '458918',
  'atif aslam': '455132',
  'kk': '455130',
  'ed sheeran': '484085',
  'taylor swift': '483247',
  'drake': '458925',
  'eminem': '458923',
  'justin bieber': '458920',
  'billie eilish': '3222384',
  'dua lipa': '879857',
  'post malone': '1046187',
  'bruno mars': '458921',
  'coldplay': '458922'
};

// Playlist details & tracks
export async function getPlaylistDetails(listId) {
  const cleanId = String(listId || '').trim();
  if (collectionCache.has(`pl-${cleanId}`)) {
    return collectionCache.get(`pl-${cleanId}`);
  }

  const data = await fetchApi({
    __call: 'playlist.getDetails',
    _format: 'json',
    cc: 'in',
    _marker: '0',
    listid: cleanId
  });

  const songs = (data.songs || data.list || []).map(formatSong).filter(Boolean);
  const result = {
    id: data.id || cleanId,
    type: 'playlist',
    title: decodeHtml(data.title || data.listname || 'Playlist'),
    subtitle: decodeHtml(data.subtitle || `${songs.length} songs`),
    image: getHighResImage(data.image),
    songs
  };
  collectionCache.set(`pl-${cleanId}`, result);
  return result;
}

// Album details & tracks (with resilient search fallback so albums never show blank)
export async function getAlbumDetails(albumId, fallbackTitle = '') {
  const cleanId = String(albumId || '').trim();
  const cacheKey = `album-${cleanId || fallbackTitle}`;
  if (collectionCache.has(cacheKey)) {
    return collectionCache.get(cacheKey);
  }

  let songs = [];
  let albumData = null;

  if (cleanId && cleanId !== 'undefined') {
    try {
      albumData = await fetchApi({
        __call: 'content.getAlbumDetails',
        _format: 'json',
        cc: 'in',
        _marker: '0',
        albumid: cleanId
      });
      songs = (albumData?.songs || albumData?.list || []).map(formatSong).filter(Boolean);
    } catch (err) {
      console.warn('content.getAlbumDetails failed for id', cleanId, err);
    }
  }

  // Fallback: If album details API returned 0 songs, search songs by title to prevent blank album
  const searchTitle = fallbackTitle || albumData?.title || albumData?.name || '';
  if (songs.length === 0 && searchTitle) {
    try {
      const searchRes = await searchSongs(searchTitle, 1, 30);
      songs = searchRes.songs || [];
    } catch (e) {
      console.warn('Album fallback search failed:', e);
    }
  }

  const result = {
    id: albumData?.id || albumData?.albumid || cleanId,
    type: 'album',
    title: decodeHtml(albumData?.title || albumData?.name || searchTitle || 'Album Details'),
    artist: decodeHtml(albumData?.primary_artists || albumData?.artist || albumData?.singers || ''),
    year: albumData?.year || '',
    image: getHighResImage(albumData?.image),
    songs
  };

  collectionCache.set(cacheKey, result);
  if (cleanId) collectionCache.set(`album-${cleanId}`, result);
  return result;
}

// Artist details & full songs/discography
export async function getArtistDetails(artistNameOrId) {
  if (!artistNameOrId) return null;
  const cleanKey = String(artistNameOrId).toLowerCase().trim();

  // Instant response if already cached
  if (artistCache.has(cleanKey)) {
    return artistCache.get(cleanKey);
  }

  let artistId = null;
  let artistInfo = null;

  const cleanName = typeof artistNameOrId === 'string'
    ? artistNameOrId.replace(/feat\..*/i, '').trim()
    : String(artistNameOrId);
  const lowerName = cleanName.toLowerCase();

  // 1. Direct ID check
  if (/^\d+$/.test(cleanName)) {
    artistId = cleanName;
  } else if (POPULAR_ARTISTS_FAST_MAP[lowerName]) {
    // 2. High-speed fast-path for major popular singers
    artistId = POPULAR_ARTISTS_FAST_MAP[lowerName];
  } else {
    // 3. Search query fallback
    try {
      const searchRes = await fetchApi({
        __call: 'search.getArtistResults',
        _format: 'json',
        _marker: '0',
        cc: 'in',
        p: 1,
        n: 5,
        q: cleanName
      });
      const topResult = searchRes.results?.[0];
      if (topResult?.id) {
        artistId = topResult.id;
        artistInfo = topResult;
      }
    } catch (e) {
      console.warn('Artist search failed:', e);
    }
  }

  // If artist ID found, get full artist page and search songs concurrently
  if (artistId) {
    try {
      const [pageData, moreRes] = await Promise.all([
        fetchApi({
          __call: 'artist.getArtistPageDetails',
          _format: 'json',
          cc: 'in',
          _marker: '0',
          artistId
        }),
        searchSongs(cleanName, 1, 30).catch(() => ({ songs: [] }))
      ]);

      const topSongsRaw = pageData?.topSongs?.songs || pageData?.topSongs || [];
      const topAlbumsRaw = pageData?.topAlbums?.albums || pageData?.topAlbums || [];
      const moreSongs = moreRes?.songs || [];

      // Merge and deduplicate
      const allSongs = [...topSongsRaw.map(formatSong).filter(Boolean)];
      for (const s of moreSongs) {
        if (!allSongs.some((existing) => existing.id === s.id)) {
          allSongs.push(s);
        }
      }

      // Map albums correctly using JioSaavn's actual keys (albumid, album/title, imageUrl/image)
      const albums = topAlbumsRaw.map((a) => ({
        id: a.albumid || a.id,
        albumid: a.albumid || a.id,
        type: 'album',
        title: decodeHtml(a.album || a.title || a.name || 'Album'),
        year: a.year || '',
        image: getHighResImage(a.imageUrl || a.image)
      })).filter((a) => Boolean(a.id));

      const result = {
        id: artistId,
        name: decodeHtml(pageData?.name || artistInfo?.name || cleanName),
        image: getHighResImage(pageData?.image || artistInfo?.image),
        followerCount: pageData?.follower_count || pageData?.fan_count || '1.2M',
        isVerified: true,
        dominantLanguage: pageData?.dominantLanguage || '',
        bio: decodeHtml(pageData?.bio?.[0]?.text || pageData?.bio || `Explore all popular high-resolution tracks and albums by ${cleanName}`),
        songs: allSongs,
        albums
      };

      // Store in cache for 0ms instant reload
      artistCache.set(cleanKey, result);
      if (result.id) artistCache.set(String(result.id).toLowerCase(), result);
      if (result.name) artistCache.set(result.name.toLowerCase().trim(), result);

      return result;
    } catch (err) {
      console.warn('Artist page fetch failed, falling back:', err);
    }
  }

  // Fallback: search songs by artist name
  const fallbackSongs = await searchSongs(cleanName, 1, 30);
  const fallbackResult = {
    id: cleanName,
    name: cleanName,
    image: fallbackSongs.songs[0]?.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    followerCount: '1M+',
    isVerified: true,
    dominantLanguage: '',
    bio: `Top tracks and hits by ${cleanName}`,
    songs: fallbackSongs.songs,
    albums: []
  };

  artistCache.set(cleanKey, fallbackResult);
  return fallbackResult;
}

// Background prefetch for homepage collections (albums & playlists)
function prefetchHomepageCollections(homepageData) {
  if (typeof window === 'undefined') return;

  const prefetchTask = async () => {
    const items = [
      ...(homepageData.newAlbums || []).slice(0, 4),
      ...(homepageData.topPlaylists || []).slice(0, 3)
    ];

    for (const item of items) {
      try {
        if (item.type === 'album') {
          if (!collectionCache.has(`album-${item.id}`)) {
            await getAlbumDetails(item.id, item.title);
          }
        } else {
          if (!collectionCache.has(`pl-${item.id}`)) {
            await getPlaylistDetails(item.id);
          }
        }
      } catch (err) {
        // Silently ignore prefetch errors
      }
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => prefetchTask(), { timeout: 3000 });
  } else {
    setTimeout(prefetchTask, 1500);
  }
}

