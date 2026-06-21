export default function ProgressBar({ value, indeterminate = false, color = 'var(--brand)', height = 6 }) {
  return (
    <div style={{ position: 'relative', height, borderRadius: height/2, background: 'var(--border)', overflow: 'hidden' }}>
      {indeterminate ? (
        <div style={{
          position: 'absolute', top: 0, height: '100%', width: '38%',
          borderRadius: height/2, background: color,
          animation: 'hos-indet 1.1s ease-in-out infinite',
        }} />
      ) : (
        <div style={{
          height: '100%', borderRadius: height/2,
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
          transition: 'width .4s linear',
        }} />
      )}
    </div>
  );
}
