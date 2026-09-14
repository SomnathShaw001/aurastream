import CryptoJS from 'crypto-js';

const DES_KEY = '38346591';
const API_BASE = '/api/saavn';

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
  if (!encryptedUrl) return null;
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

  const audioStreams = raw.encrypted_media_url
    ? getAudioStreamUrls(raw.encrypted_media_url)
    : null;

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
    encrypted_media_url: raw.encrypted_media_url || raw.more_info?.encrypted_media_url,
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
    id: a.id,
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
    id: item.id,
    type: item.type,
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle),
    image: getHighResImage(item.image),
    perma_url: item.perma_url
  }));

  const charts = (data.charts || []).map((item) => ({
    id: item.id,
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle || `${item.count || ''} Tracks`),
    image: getHighResImage(item.image)
  }));

  const topPlaylists = (data.top_playlists || []).map((item) => ({
    id: item.id,
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle || `${item.more_info?.song_count || ''} Tracks`),
    image: getHighResImage(item.image)
  }));

  const newAlbums = (data.new_albums || []).map((item) => ({
    id: item.id,
    title: decodeHtml(item.title),
    subtitle: decodeHtml(item.subtitle || item.more_info?.release_date || ''),
    image: getHighResImage(item.image)
  }));

  return {
    trending,
    charts,
    topPlaylists,
    newAlbums
  };
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

// Playlist details & tracks
export async function getPlaylistDetails(listId) {
  const data = await fetchApi({
    __call: 'playlist.getDetails',
    _format: 'json',
    cc: 'in',
    _marker: '0',
    listid: listId
  });

  const songs = (data.songs || data.list || []).map(formatSong).filter(Boolean);
  return {
    id: data.id || listId,
    title: decodeHtml(data.title || data.listname),
    subtitle: decodeHtml(data.subtitle || `${songs.length} songs`),
    image: getHighResImage(data.image),
    songs
  };
}

// Album details & tracks
export async function getAlbumDetails(albumId) {
  const data = await fetchApi({
    __call: 'content.getAlbumDetails',
    _format: 'json',
    cc: 'in',
    _marker: '0',
    albumid: albumId
  });

  const songs = (data.songs || data.list || []).map(formatSong).filter(Boolean);
  return {
    id: data.id || albumId,
    title: decodeHtml(data.title || data.name),
    artist: decodeHtml(data.primary_artists || data.artist || ''),
    year: data.year,
    image: getHighResImage(data.image),
    songs
  };
}
