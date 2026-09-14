// Web Audio API & HTML5 Audio Singleton Controller

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  Electronic: [4, 3, 1, 0, -1, 2, 1, 2, 4, 3],
  Rock: [4, 3, 2, 0, -1, -1, 1, 2, 3, 4],
  Pop: [-1, 1, 2, 3, 2, 0, -1, -1, 1, 2],
  'Vocal Boost': [-2, -2, -1, 1, 3, 4, 3, 1, 0, -1],
  Acoustic: [3, 2, 1, 1, 1, 2, 2, 3, 3, 2]
};

class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';

    this.audioCtx = null;
    this.sourceNode = null;
    this.analyser = null;
    this.eqFilters = [];
    this.isInitialized = false;

    this.currentTrack = null;
    this.bitrate = '320';
    this.eqGains = [...EQ_PRESETS.Flat];
    this.listeners = new Map();

    this._setupNativeEvents();
  }

  // Initialize Web Audio graph on user interaction
  initAudioContext() {
    if (this.isInitialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      this.audioCtx = new AudioContext();
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);

      // Create 10-band equalizer
      this.eqFilters = EQ_FREQUENCIES.map((freq, idx) => {
        const filter = this.audioCtx.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = this.eqGains[idx] || 0;
        return filter;
      });

      // Create analyser for visualizers
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;

      // Create master gain node for rock-solid volume and mute control
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.audio.muted ? 0 : this.audio.volume;

      // Connect graph: source -> eq[0] -> ... -> eq[9] -> analyser -> gainNode -> destination
      let prevNode = this.sourceNode;
      for (const filter of this.eqFilters) {
        prevNode.connect(filter);
        prevNode = filter;
      }
      prevNode.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API context could not be initialized:', e);
    }
  }

  _setupNativeEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this._emit('timeupdate', {
        currentTime: this.audio.currentTime,
        duration: this.audio.duration || 0
      });
    });

    this.audio.addEventListener('progress', () => {
      if (this.audio.buffered.length > 0) {
        const bufferedEnd = this.audio.buffered.end(this.audio.buffered.length - 1);
        this._emit('progress', {
          buffered: bufferedEnd,
          duration: this.audio.duration || 0
        });
      }
    });

    this.audio.addEventListener('play', () => this._emit('play'));
    this.audio.addEventListener('pause', () => this._emit('pause'));
    this.audio.addEventListener('ended', () => this._emit('ended'));
    this.audio.addEventListener('error', (e) => this._emit('error', e));
    this.audio.addEventListener('loadedmetadata', () => {
      this._emit('loadedmetadata', {
        duration: this.audio.duration
      });
    });

    this.audio.addEventListener('volumechange', () => {
      this._emit('volumechange', {
        volume: this.audio.volume,
        muted: this.audio.muted
      });
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  // Load and play a track
  async playTrack(track, bitrate = this.bitrate) {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.currentTrack = track;
    this.bitrate = bitrate;

    // Pick appropriate audio stream URL
    const streamUrl = track.audioStreams?.[bitrate] ||
                      track.audioStreams?.default ||
                      track.audioStreams?.['320'];

    if (!streamUrl) {
      console.error('No audio stream URL available for track:', track);
      return false;
    }

    this.audio.src = streamUrl;
    this.audio.load();

    try {
      await this.audio.play();
      this.updateMediaSession(track);
      return true;
    } catch (err) {
      console.warn('Playback initiation prevented or failed:', err);
      return false;
    }
  }

  async resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.audio.paused) {
      return this.resume();
    } else {
      this.pause();
      return Promise.resolve();
    }
  }

  seek(seconds) {
    if (Number.isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || 0));
    }
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audio.volume = clamped;
    if (this.gainNode && this.audioCtx) {
      const targetGain = this.audio.muted ? 0 : clamped;
      this.gainNode.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
    if (clamped > 0 && this.audio.muted) {
      this.setMuted(false);
    }
  }

  setMuted(muted) {
    const isMuted = Boolean(muted);
    this.audio.muted = isMuted;
    if (this.gainNode && this.audioCtx) {
      const targetGain = isMuted ? 0 : this.audio.volume;
      this.gainNode.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
    this._emit('volumechange', {
      volume: this.audio.volume,
      muted: isMuted
    });
  }

  isMuted() {
    return Boolean(this.audio.muted);
  }

  getVolume() {
    return this.audio.volume;
  }

  setBitrate(bitrate) {
    if (this.bitrate === bitrate) return;
    this.bitrate = bitrate;
    if (this.currentTrack && !this.audio.paused) {
      const curTime = this.audio.currentTime;
      this.playTrack(this.currentTrack, bitrate).then(() => {
        this.seek(curTime);
      });
    }
  }

  // Set equalizer band gain in dB (-12 to +12)
  setEqBand(index, gainDb) {
    this.eqGains[index] = gainDb;
    if (this.eqFilters[index]) {
      this.eqFilters[index].gain.setTargetAtTime(
        gainDb,
        this.audioCtx?.currentTime || 0,
        0.05
      );
    }
  }

  applyEqPreset(presetName) {
    const preset = EQ_PRESETS[presetName] || EQ_PRESETS.Flat;
    preset.forEach((val, idx) => {
      this.setEqBand(idx, val);
    });
    return [...preset];
  }

  // Frequency data for spectrum visualizer
  getFrequencyData(array) {
    if (!this.analyser) return false;
    this.analyser.getByteFrequencyData(array);
    return true;
  }

  // Waveform data for oscilloscope visualizer
  getTimeDomainData(array) {
    if (!this.analyser) return false;
    this.analyser.getByteTimeDomainData(array);
    return true;
  }

  // Native OS Lock Screen & Media Keys (MediaSession API)
  updateMediaSession(track) {
    if (!('mediaSession' in navigator) || !track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'AuraStream High-Res',
      artwork: [
        { src: track.imageSmall || track.image, sizes: '150x150', type: 'image/jpeg' },
        { src: track.image, sizes: '500x500', type: 'image/jpeg' }
      ]
    });
  }

  setupMediaSessionActions(handlers = {}) {
    if (!('mediaSession' in navigator)) return;

    const actions = [
      ['play', handlers.onPlay || (() => this.resume())],
      ['pause', handlers.onPause || (() => this.pause())],
      ['previoustrack', handlers.onPrevious],
      ['nexttrack', handlers.onNext],
      ['seekto', (details) => {
        if (details.seekTime !== undefined) this.seek(details.seekTime);
      }]
    ];

    for (const [action, handler] of actions) {
      try {
        if (handler) {
          navigator.mediaSession.setActionHandler(action, handler);
        }
      } catch (e) {
        // unsupported action in browser
      }
    }
  }

  // Direct offline download of song as MP3 in current streaming quality (same tab, no popups)
  async downloadTrack(track = this.currentTrack, bitrate = this.bitrate) {
    const targetTrack = track || this.currentTrack;
    if (!targetTrack) return;

    const streamBitrate = bitrate || this.bitrate || '320';
    const url = targetTrack.audioStreams?.[streamBitrate] ||
                targetTrack.audioStreams?.['320'] ||
                targetTrack.audioStreams?.['160'] ||
                targetTrack.audioStreams?.['96'] ||
                this.audio?.src;

    if (!url) {
      console.warn('No audio stream available to download');
      return;
    }

    const cleanArtist = (targetTrack.artist || 'Unknown Artist').replace(/[\\/:*?"<>|]/g, '_').trim();
    const cleanTitle = (targetTrack.title || 'Track').replace(/[\\/:*?"<>|]/g, '_').trim();
    const safeFilename = `${cleanArtist} - ${cleanTitle} [${streamBitrate}kbps].mp3`;

    try {
      // Fetch audio data and create a Blob URL for instant direct download in the same tab
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = safeFilename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    } catch (err) {
      console.warn('Direct blob download failed, triggering fallback download:', err);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = safeFilename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  }

  downloadCurrentTrack(bitrate = this.bitrate) {
    return this.downloadTrack(this.currentTrack, bitrate);
  }
}

export const audioEngine = new AudioEngine();
