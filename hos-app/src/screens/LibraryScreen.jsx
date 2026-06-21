import { useState } from 'react';

const STATUS_MAP = {
  monitoring: { label: 'MONITORING', color: 'var(--brand)' },
  paused:     { label: 'PAUSED',     color: 'var(--text-dim)' },
  none:       { label: 'NONE',       color: 'var(--text-muted)' },
};

export default function LibraryScreen({ library, onToggleMonitor, onRemove }) {
  const [filter, setFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const displayed = filter
    ? library.filter(s => s.dir.toLowerCase().includes(filter.toLowerCase()))
    : library;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div style={{ padding:'18px 20px 36px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700, letterSpacing:'-0.02em', flexShrink:0 }}>Library</h2>
        <div style={{ flex:1, minWidth:220, display:'flex', alignItems:'center', gap:9, height:40, padding:'0 12px', borderRadius:9, background:'var(--surface)', border:'1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color:'var(--text-dim)', flexShrink:0 }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter by title..."
            style={{ flex:1, background:'transparent', border:'none', color:'var(--text)', fontSize:13.5 }}
          />
        </div>
        <button onClick={handleRefresh} style={{
          display:'flex', alignItems:'center', gap:7, height:40, padding:'0 15px',
          borderRadius:9, border:'1px solid var(--border)', cursor:'pointer',
          fontSize:13, fontWeight:600, background:'var(--surface-2)', color:'var(--text)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: refreshing ? 'hos-spin .7s linear infinite' : 'none' }}>
            <path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>
          </svg>
          Refresh
        </button>
      </div>

      <div style={{ border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', background:'var(--surface)' }}>
        <div style={{ overflowX:'auto' }}>
          <div style={{ minWidth:1120 }}>
            {/* Header */}
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 318px 84px 84px 132px 100px 150px', padding:'0 4px', background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
              {['Show Directory','Actions','Seasons','Episodes','Status','Source','Last Checked'].map(h => (
                <div key={h} style={{ padding:'11px 10px', fontSize:11, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-dim)' }}>{h}</div>
              ))}
            </div>

            {displayed.length === 0 && (
              <div style={{ padding:'56px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>No shows in library</div>
            )}

            {displayed.map((s, i) => {
              const sm = STATUS_MAP[s.status] || STATUS_MAP.none;
              const isMonitored = s.status !== 'none';
              return (
                <div key={s.id} style={{ borderBottom: i < displayed.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div
                    style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 318px 84px 84px 132px 100px 150px', padding:'0 4px', alignItems:'center' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{ padding:12, display:'flex', alignItems:'center', gap:9, minWidth:0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--text-dim)', flexShrink:0 }}><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.dir}</span>
                    </div>

                    <div style={{ padding:'9px 10px', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      {!isMonitored ? (
                        <button onClick={() => onToggleMonitor(s.id)} style={{
                          display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
                          borderRadius:7, border:'none', cursor:'pointer',
                          fontSize:12.5, fontWeight:600, background:'var(--brand)', color:'#fff',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                          Monitor
                        </button>
                      ) : (
                        <>
                          <button style={{ display:'grid', placeItems:'center', width:30, height:30, borderRadius:7, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-muted)', cursor:'pointer' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                          </button>
                          <button onClick={() => onToggleMonitor(s.id)} style={{
                            display:'flex', alignItems:'center', gap:5, padding:'6px 11px',
                            borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:600,
                            border: s.status === 'monitoring' ? '1px solid color-mix(in srgb, var(--warning) 40%, var(--border))' : '1px solid var(--border)',
                            background: s.status === 'monitoring' ? 'color-mix(in srgb, var(--warning) 12%, transparent)' : 'var(--surface-2)',
                            color: s.status === 'monitoring' ? 'var(--warning)' : 'var(--text-muted)',
                          }}>
                            {s.status === 'monitoring' ? 'Pause' : 'Resume'}
                          </button>
                          <button style={{
                            display:'flex', alignItems:'center', gap:5, padding:'6px 10px',
                            borderRadius:7, border:'none', background:'transparent',
                            color:'var(--brand)', cursor:'pointer', fontSize:12, fontWeight:600,
                          }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                            Check
                          </button>
                          <button onClick={() => onRemove(s.id)} style={{ display:'grid', placeItems:'center', width:30, height:30, borderRadius:7, border:'none', background:'transparent', color:'var(--text-dim)', cursor:'pointer' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>
                          </button>
                        </>
                      )}
                    </div>

                    <div style={{ padding:'12px 10px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-muted)' }}>{s.seasons}</div>
                    <div style={{ padding:'12px 10px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-muted)' }}>{s.episodes}</div>
                    <div style={{ padding:'12px 10px' }}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:6,
                        color: sm.color,
                        background: `color-mix(in srgb, ${sm.color} 14%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${sm.color} 30%, transparent)`,
                      }}>{sm.label}</span>
                    </div>
                    <div style={{ padding:'12px 10px', fontSize:13, color:'var(--text-muted)' }}>{s.source}</div>
                    <div style={{ padding:'12px 10px', fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--text-dim)' }}>{s.lastChecked}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
