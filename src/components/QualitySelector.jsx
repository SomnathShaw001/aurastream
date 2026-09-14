import React from 'react';
import { X, Check, ShieldCheck, Zap, Wifi } from 'lucide-react';

const QUALITIES = [
  {
    bitrate: '320',
    title: 'Hi-Res Studio Master',
    desc: '320 kbps AAC — Unrivaled dynamic range, pristine clarity, lossless-equivalent studio acoustic detail.',
    icon: ShieldCheck,
    tag: 'RECOMMENDED'
  },
  {
    bitrate: '160',
    title: 'High Quality',
    desc: '160 kbps AAC — Balanced high-fidelity audio with lower bandwidth usage.',
    icon: Zap,
    tag: 'BALANCED'
  },
  {
    bitrate: '96',
    title: 'Data Saver',
    desc: '96 kbps AAC — Minimal data consumption for mobile networks or low bandwidth.',
    icon: Wifi,
    tag: 'LIGHT'
  }
];

export default function QualitySelector({ currentBitrate, onSelectBitrate, onClose }) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Audio Streaming Quality</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Choose audio fidelity and bitrate
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {QUALITIES.map((q) => {
            const isSelected = currentBitrate === q.bitrate;
            const Icon = q.icon;

            return (
              <div
                key={q.bitrate}
                onClick={() => {
                  onSelectBitrate(q.bitrate);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px',
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                      {q.title}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: isSelected ? 'var(--accent-gold)' : 'var(--text-dim)',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}>
                      {q.bitrate} KBPS
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
                    {q.desc}
                  </p>
                </div>

                {isSelected && (
                  <Check size={20} color="var(--accent-primary)" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
