import React from 'react';
import { X, Trash2, Music, Play } from 'lucide-react';
import ArtistLinks from './ArtistLinks';

export default function QueueDrawer({ 
  queue, 
  currentTrack, 
  onPlayTrack, 
  onRemoveFromQueue, 
  onClearQueue, 
  onClose,
  onSelectArtist
}) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '460px', 
          height: '80vh', 
          display: 'flex', 
          flexDirection: 'column' 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <div>
            <h3 className="modal-title">Play Queue</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {queue.length} track{queue.length !== 1 ? 's' : ''} in queue
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {queue.length > 0 && (
              <button 
                className="icon-btn" 
                onClick={onClearQueue} 
                title="Clear Queue"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Current track highlighted */}
        {currentTrack && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--theme-accent, #10b981)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <img 
              src={currentTrack.imageSmall || currentTrack.image} 
              alt={currentTrack.title} 
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} 
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                Now Playing
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentTrack.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <ArtistLinks 
                  artistsString={currentTrack.artist} 
                  onSelectArtist={(artist) => {
                    onClose();
                    if (onSelectArtist) onSelectArtist(artist);
                  }} 
                />
              </div>
            </div>
            <div className="hires-tag">320K</div>
          </div>
        )}

        {/* Queue list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
              <Music size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>Queue is empty</p>
            </div>
          ) : (
            queue.map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer'
                }}
                onClick={() => onPlayTrack(track)}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', width: 20 }}>
                  {idx + 1}
                </span>
                <img 
                  src={track.imageSmall || track.image} 
                  alt={track.title} 
                  style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover' }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <ArtistLinks 
                      artistsString={track.artist} 
                      onSelectArtist={(artist) => {
                        onClose();
                        if (onSelectArtist) onSelectArtist(artist);
                      }} 
                    />
                  </div>
                </div>

                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromQueue(idx);
                  }}
                  title="Remove from Queue"
                >
                  <X size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
