import { useEffect, useState } from 'react';
import { useLibrary } from '../hooks/useLibrary.js';

const SOURCE_COLOR = { VIXSRC: 'var(--vixsrc)', RAIPLAY: 'var(--raiplay)' };

export default function LibraryScreen() {
  const { entries, loading, checkingId, refresh, toggleMonitor, remove, check } = useLibrary();
  const [filter, setFilter] = useState('');

  useEffect(() => { refresh(); }, [refresh]);

  const displayed = filter
    ? entries.filter(e => e.directoryName.toLowerCase().includes(filter.toLowerCase()))
    : entries;

  const handleCheck = async (entry) => {
    const result = await check(entry.monitoredShow.id);
    if (result?.newEpisodesEnqueued > 0) {
      // Result handled upstream; nothing to display here
    }
  };

  return (
    <div style={{ padding: '18px 20px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', flexShrink: 0 }}>Library</h2>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 9, height: 40, padding: '0 12px', borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter by directory..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 13.5 }}
          />
        </div>
        <button onClick={refresh} style={{
          display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 15px',
          borderRadius: 9, border: '1px solid var(--border)', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--text)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: loading ? 'hos-spin .7s linear infinite' : 'none' }}>
            <path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>
          </svg>
          Refresh
        </button>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 960 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px 76px 84px 120px 100px 150px', padding: '0 4px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Directory', 'Actions', 'Seasons', 'Episodes', 'Status', 'Source', 'Last Checked'].map(h => (
                <div key={h} style={{ padding: '11px 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{h}</div>
              ))}
            </div>

            {!loading && displayed.length === 0 && (
              <div style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                {filter ? `No results for "${filter}"` : 'No entries in library'}
              </div>
            )}

            {loading && entries.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-strong)', borderTopColor: 'var(--brand)', animation: 'hos-spin .7s linear infinite' }} />
              </div>
            )}

            {displayed.map((entry, i) => {
              const show = entry.monitoredShow;
              const isMonitored = entry.monitored && show != null;
              const isEnabled = show?.enabled ?? false;
              const isChecking = show && checkingId === show.id;
              const sourceColor = SOURCE_COLOR[show?.source] || 'var(--text-dim)';

              let statusLabel = 'UNMONITORED';
              let statusColor = 'var(--text-dim)';
              if (isMonitored) {
                statusLabel = isEnabled ? 'MONITORING' : 'PAUSED';
                statusColor = isEnabled ? 'var(--brand)' : 'var(--warning)';
              }

              const lastChecked = show?.lastCheckedAt
                ? new Date(show.lastCheckedAt).toLocaleString()
                : '—';

              return (
                <div key={entry.directoryName} style={{ borderBottom: i < displayed.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px 76px 84px 120px 100px 150px', padding: '0 4px', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Directory */}
                    <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.directoryName}</div>
                        {show?.title && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {show.title}{show.year ? ` (${show.year})` : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {!isMonitored ? (
                        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>Not monitored</span>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleMonitor(entry)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                              borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              border: isEnabled
                                ? '1px solid color-mix(in srgb, var(--warning) 40%, var(--border))'
                                : '1px solid color-mix(in srgb, var(--brand) 40%, var(--border))',
                              background: isEnabled
                                ? 'color-mix(in srgb, var(--warning) 12%, transparent)'
                                : 'color-mix(in srgb, var(--brand) 12%, transparent)',
                              color: isEnabled ? 'var(--warning)' : 'var(--brand)',
                            }}
                          >
                            {isEnabled ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => handleCheck(entry)}
                            disabled={isChecking}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
                              borderRadius: 7, border: 'none', background: 'transparent',
                              color: 'var(--brand)', cursor: isChecking ? 'default' : 'pointer',
                              fontSize: 12, fontWeight: 600, opacity: isChecking ? 0.6 : 1,
                            }}
                          >
                            {isChecking
                              ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--border-strong)', borderTopColor: 'var(--brand)', animation: 'hos-spin .7s linear infinite', display: 'block' }} />
                              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                            }
                            Check
                          </button>
                          <button
                            onClick={() => remove(show.id)}
                            style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>
                          </button>
                        </>
                      )}
                    </div>

                    <div style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>{entry.seasonCount ?? '—'}</div>
                    <div style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>{entry.episodeCount ?? '—'}</div>

                    {/* Status */}
                    <div style={{ padding: '12px 10px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
                        color: statusColor,
                        background: `color-mix(in srgb, ${statusColor} 14%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${statusColor} 30%, transparent)`,
                      }}>{statusLabel}</span>
                    </div>

                    {/* Source */}
                    <div style={{ padding: '12px 10px' }}>
                      {show?.source ? (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                          padding: '3px 8px', borderRadius: 5, color: '#fff', background: sourceColor,
                        }}>{show.source}</span>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>—</span>
                      )}
                    </div>

                    <div style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-dim)' }}>{lastChecked}</div>
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
