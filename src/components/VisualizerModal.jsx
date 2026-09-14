import React, { useEffect, useRef, useState } from 'react';
import { X, Activity, Radio, Disc } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export default function VisualizerModal({ track, isPlaying, onClose }) {
  const canvasRef = useRef(null);
  const [visualizerMode, setVisualizerMode] = useState('bars'); // 'bars' | 'wave' | 'circle'
  const animFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas
    const updateSize = () => {
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();

    const bufferLength = audioEngine.analyser?.frequencyBinCount || 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameId.current = requestAnimationFrame(render);

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Deep dark backdrop with glowing aura
      ctx.fillStyle = '#07080f';
      ctx.fillRect(0, 0, width, height);

      if (visualizerMode === 'bars') {
        audioEngine.getFrequencyData(dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) - 3;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = (val / 255) * (height * 0.75);

          // Dynamic neon gradient for each bar
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#10b981');
          gradient.addColorStop(1, '#14b8a6');

          ctx.fillStyle = gradient;
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#10b981';
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight - 10, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Little glowing top cap
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffffff';
          ctx.fillRect(x, height - barHeight - 14, barWidth, 2);

          x += barWidth + 3;
        }
      } else if (visualizerMode === 'wave') {
        audioEngine.getTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      } else if (visualizerMode === 'circle') {
        audioEngine.getFrequencyData(dataArray);

        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.22;

        ctx.save();
        ctx.translate(centerX, centerY);

        const bars = 64;
        for (let i = 0; i < bars; i++) {
          const rad = (Math.PI * 2 * i) / bars;
          const val = dataArray[i * 2] || 0;
          const barLen = (val / 255) * (Math.min(width, height) * 0.25);

          const x1 = Math.cos(rad) * baseRadius;
          const y1 = Math.sin(rad) * baseRadius;
          const x2 = Math.cos(rad) * (baseRadius + barLen);
          const y2 = Math.sin(rad) * (baseRadius + barLen);

          ctx.strokeStyle = `hsl(${(i * 360) / bars}, 85%, 65%)`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();
      }
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [visualizerMode, isPlaying]);

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '780px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={22} color="var(--accent-cyan)" />
            <h3 className="modal-title">Live Audio Visualizer</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mode toggles */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 3 }}>
              <button 
                className={`btn-secondary ${visualizerMode === 'bars' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: 16, border: 'none' }}
                onClick={() => setVisualizerMode('bars')}
              >
                Bars
              </button>
              <button 
                className={`btn-secondary ${visualizerMode === 'wave' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: 16, border: 'none' }}
                onClick={() => setVisualizerMode('wave')}
              >
                Wave
              </button>
              <button 
                className={`btn-secondary ${visualizerMode === 'circle' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: 16, border: 'none' }}
                onClick={() => setVisualizerMode('circle')}
              >
                Radial
              </button>
            </div>

            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Canvas container */}
        <div className="visualizer-canvas-container">
          <canvas ref={canvasRef} className="visualizer-canvas" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Playing: <strong style={{ color: '#ffffff' }}>{track?.title}</strong> — {track?.artist}
          </div>
          <div className="hires-tag">WEB AUDIO API 60FPS</div>
        </div>
      </div>
    </div>
  );
}
