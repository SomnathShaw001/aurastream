import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Sparkles } from 'lucide-react';
import { audioEngine, EQ_FREQUENCIES, EQ_PRESETS } from '../services/audioEngine';

function formatFrequency(freq) {
  return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
}

export default function EqualizerModal({ currentPreset, onPresetChange, onClose }) {
  const [gains, setGains] = useState([...audioEngine.eqGains]);
  const [activePreset, setActivePreset] = useState(currentPreset || 'Electronic');

  const handleSliderChange = (idx, value) => {
    const val = parseFloat(value);
    const updated = [...gains];
    updated[idx] = val;
    setGains(updated);
    setActivePreset('Custom');
    audioEngine.setEqBand(idx, val);
  };

  const handleSelectPreset = (name) => {
    setActivePreset(name);
    const presetGains = audioEngine.applyEqPreset(name);
    setGains(presetGains);
    if (onPresetChange) onPresetChange(name);
  };

  const handleReset = () => {
    handleSelectPreset('Flat');
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sliders size={22} color="var(--accent-primary)" />
            <div>
              <h3 className="modal-title">10-Band Studio Equalizer</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Fine-tune audio frequencies in real-time
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="icon-btn" onClick={handleReset} title="Reset to Flat">
              <RotateCcw size={18} />
            </button>
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {Object.keys(EQ_PRESETS).map((pName) => (
            <button
              key={pName}
              className={`btn-secondary ${activePreset === pName ? 'active' : ''}`}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                borderRadius: '16px',
                background: activePreset === pName ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                border: activePreset === pName ? 'none' : '1px solid var(--border-subtle)'
              }}
              onClick={() => handleSelectPreset(pName)}
            >
              {pName}
            </button>
          ))}
        </div>

        {/* 10 Vertical Sliders */}
        <div className="eq-sliders-grid">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const gain = gains[idx] || 0;
            return (
              <div key={freq} className="eq-band-col">
                <span className="eq-val-label">{gain > 0 ? `+${gain}` : gain}</span>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={gain}
                  onChange={(e) => handleSliderChange(idx, e.target.value)}
                  className="eq-slider"
                />
                <span className="eq-freq-label">{formatFrequency(freq)}Hz</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Range: -12 dB to +12 dB
          </span>
          <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
