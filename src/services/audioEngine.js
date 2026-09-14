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

      // Connect graph: source -> eq[0] -> ... -> eq[9] -> analyser -> destination
      let prevNode = this.sourceNode;
      for (const filter of this.eqFilters) {
        prevNode.connect(filter);
        prevNode = filter;
      }
      prevNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

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
    this.audio.volume = Math.max(0, Math.min(1, vol));
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

  // One-click offline download of 320kbps MP4/AAC
  downloadCurrentTrack() {
    if (!this.currentTrack) return;
    const url = this.currentTrack.audioStreams?.['320'] || this.audio.src;
    if (!url) return;

    const safeFilename = `${this.currentTrack.artist} - ${this.currentTrack.title} [320kbps].m4a`
      .replace(/[\\/:*?"<>|]/g, '_');

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = safeFilename;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}

export const audioEngine = new AudioEngine();
