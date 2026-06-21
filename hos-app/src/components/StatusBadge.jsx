const STATUS_MAP = {
  DOWNLOADING: { label: 'Downloading', color: 'var(--brand)',   pulse: true },
  EXTRACTING:  { label: 'Extracting',  color: 'var(--warning)', pulse: true },
  QUEUED:      { label: 'Queued',      color: 'var(--text-muted)', pulse: false },
  MERGING:     { label: 'Merging',     color: 'var(--warning)', pulse: true },
  COPYING:     { label: 'Copying',     color: 'var(--warning)', pulse: true },
  COMPLETED:   { label: 'Completed',   color: 'var(--success)', pulse: false },
  FAILED:      { label: 'Failed',      color: 'var(--error)',   pulse: false },
  NOT_FOUND:   { label: 'Not Found',   color: 'var(--error)',   pulse: false },
  CANCELLED:   { label: 'Cancelled',   color: 'var(--text-dim)', pulse: false },
  PAUSED:      { label: 'Paused',      color: 'var(--text-dim)', pulse: false },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: 'var(--text-dim)', pulse: false };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 8px',
      borderRadius: 6,
      color: s.color,
      background: `color-mix(in srgb, ${s.color} 14%, transparent)`,
      border: `1px solid color-mix(in srgb, ${s.color} 30%, transparent)`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: s.color,
        animation: s.pulse ? 'hos-pulse 1.6s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      {s.label}
    </span>
  );
}
