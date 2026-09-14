import React from 'react';

export default function ArtistLinks({ artistsString, onSelectArtist, className = '' }) {
  if (!artistsString) return <span>Unknown Artist</span>;

  // Split multiple artists separated by commas or ampersands
  // E.g. "Ajay-Atul, Ajay Gogavale" -> ["Ajay-Atul", "Ajay Gogavale"]
  const parts = artistsString.split(/,\s*|\s+&\s+/);

  return (
    <span className={className}>
      {parts.map((artist, idx) => {
        const trimmed = artist.trim();
        if (!trimmed) return null;

        return (
          <React.Fragment key={idx}>
            <span
              className="clickable-artist"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectArtist) onSelectArtist(trimmed);
              }}
              title={`View ${trimmed}'s songs`}
            >
              {trimmed}
            </span>
            {idx < parts.length - 1 && ', '}
          </React.Fragment>
        );
      })}
    </span>
  );
}
