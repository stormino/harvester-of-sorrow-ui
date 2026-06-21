const SOURCE_COLORS = {
  VIXSRC:  'var(--vixsrc)',
  RAIPLAY: 'var(--raiplay)',
  VixSrc:  'var(--vixsrc)',
  RaiPlay: 'var(--raiplay)',
};

export default function SourcePill({ source }) {
  const color = SOURCE_COLORS[source] || 'var(--text-muted)';
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 9.5,
      fontWeight: 600,
      padding: '2px 6px',
      borderRadius: 4,
      color: '#fff',
      background: color,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      flexShrink: 0,
    }}>
      {source}
    </span>
  );
}
