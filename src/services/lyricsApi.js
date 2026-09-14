// LRCLIB Synced & Plain Lyrics Integration

export function parseLrc(lrcText) {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\](.*)/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3]
        ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10)
        : 0;
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();

      if (text) {
        result.push({
          time: totalSeconds,
          text
        });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

// Fetch lyrics from LRCLIB
export async function getLyrics(trackName, artistName, albumName, duration) {
  if (!trackName) return null;

  // Clean title for higher matching accuracy (remove (Remix), - Single, feat., etc.)
  const cleanTrack = trackName
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*/i, '')
    .replace(/-.*$/, '')
    .trim();

  const cleanArtist = (artistName || '')
    .split(',')[0]
    .replace(/feat\..*/i, '')
    .trim();

  try {
    // 1. Try exact match
    const params = new URLSearchParams({
      track_name: cleanTrack,
      artist_name: cleanArtist
    });
    if (albumName) params.append('album_name', albumName);
    if (duration) params.append('duration', Math.round(duration));

    const directRes = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
    if (directRes.ok) {
      const data = await directRes.json();
      if (data.syncedLyrics) {
        return {
          isSynced: true,
          lyrics: parseLrc(data.syncedLyrics)
        };
      }
      if (data.plainLyrics) {
        return {
          isSynced: false,
          lyrics: data.plainLyrics
            .split('\n')
            .filter((l) => l.trim().length > 0)
            .map((text, idx) => ({ time: idx, text }))
        };
      }
    }

    // 2. Fallback to search if exact match missed
    const searchRes = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTrack} ${cleanArtist}`)}`
    );
    if (searchRes.ok) {
      const results = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        // Prefer item with synced lyrics
        const best = results.find((r) => r.syncedLyrics) || results[0];
        if (best.syncedLyrics) {
          return {
            isSynced: true,
            lyrics: parseLrc(best.syncedLyrics)
          };
        }
        if (best.plainLyrics) {
          return {
            isSynced: false,
            lyrics: best.plainLyrics
              .split('\n')
              .filter((l) => l.trim().length > 0)
              .map((text, idx) => ({ time: idx, text }))
          };
        }
      }
    }
  } catch (err) {
    console.warn('Lyrics fetch failed:', err);
  }

  return null;
}
