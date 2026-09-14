import React, { useState } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';

export default function PlaylistModal({
  mode = 'create', // 'create' | 'add_track'
  trackToAdd = null,
  playlists = [],
  onCreatePlaylist,
  onAddTrackToPlaylist,
  onClose
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreatePlaylist(name.trim(), desc.trim());
    setName('');
    setDesc('');
    onClose();
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ListMusic size={22} color="var(--accent-primary)" />
            <h3 className="modal-title">
              {mode === 'create' ? 'Create Playlist' : 'Add to Playlist'}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 6 }}>
                Playlist Name
              </label>
              <input
                type="text"
                className="search-input"
                style={{ borderRadius: 10, padding: '0 14px' }}
                placeholder="My Hi-Res Favorites"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 6 }}>
                Description (Optional)
              </label>
              <textarea
                className="search-input"
                style={{ borderRadius: 10, padding: '10px 14px', height: 80, resize: 'none' }}
                placeholder="A collection of 320kbps master tracks..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={!name.trim()}>
                Create
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trackToAdd && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 6 }}>
                Adding: <strong style={{ color: '#fff' }}>{trackToAdd.title}</strong>
              </div>
            )}

            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {playlists.map((pl) => {
                const alreadyInPlaylist = pl.tracks?.some((t) => t.id === trackToAdd?.id);

                return (
                  <div
                    key={pl.id}
                    onClick={() => {
                      if (!alreadyInPlaylist) {
                        onAddTrackToPlaylist(pl.id, trackToAdd);
                        onClose();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      cursor: alreadyInPlaylist ? 'default' : 'pointer',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                        {pl.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        {pl.tracks?.length || 0} songs
                      </div>
                    </div>

                    {alreadyInPlaylist ? (
                      <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> Added
                      </span>
                    ) : (
                      <Plus size={16} color="var(--text-muted)" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
