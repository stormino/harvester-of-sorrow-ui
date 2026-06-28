import { useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SourcePill from '../components/SourcePill.jsx';

function fmtBytes(b) {
  if (!b) return '—';
  if (b >= 1e9) return (b / 1e9).toFixed(2) + ' GB';
  return (b / 1e6).toFixed(0) + ' MB';
}

function fmtSpeed(s) {
  if (!s) return '—';
  // API returns a pre-formatted string like "5.2 MB/s"
  if (typeof s === 'string') return s || '—';
  if (s >= 1e6) return (s / 1e6).toFixed(1) + ' MB/s';
  return (s / 1e3).toFixed(0) + ' KB/s';
}

function fmtEta(sec) {
  if (!sec) return '—';
  if (sec < 60) return Math.round(sec) + 's';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ' + (sec % 60).toFixed(0) + 's';
  return Math.floor(sec / 3600) + 'h ' + Math.floor((sec % 3600) / 60) + 'm';
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const INDETERMINATE = new Set(['EXTRACTING', 'MERGING', 'COPYING']);
const ACTIVE        = new Set(['QUEUED', 'EXTRACTING', 'DOWNLOADING', 'MERGING', 'COPYING']);

function barColor(status) {
  if (status === 'COMPLETED') return 'var(--success)';
  if (status === 'FAILED')    return 'var(--error)';
  if (INDETERMINATE.has(status)) return 'var(--warning)';
  return 'var(--brand)';
}

function subTaskKind(type) {
  const map = { VIDEO: 'video', AUDIO: 'audio', SUBTITLE: 'sub' };
  return map[type] ?? type?.toLowerCase() ?? '?';
}

function TaskRow({ task, onCancel, onRetry, onInfo, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const indet      = INDETERMINATE.has(task.status);
  const pct        = task.aggregatedProgress ?? task.progress ?? 0;
  const canCancel  = ACTIVE.has(task.status);
  const canRetry   = task.status === 'FAILED' || task.status === 'NOT_FOUND' || task.status === 'CANCELLED';
  const canInfo    = !!task.errorMessage;
  const color      = barColor(task.status);

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,3fr) 118px 196px 112px 104px 92px 86px 96px',
          padding: '0 4px', alignItems: 'center',
          background: hovered ? 'var(--surface-2)' : 'transparent',
        }}
      >
        {/* Title */}
        <div style={{ padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <button
            onClick={() => onToggle(task.id)}
            style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: task._expanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s ease' }}>
              <path d="m9 6 6 6-6 6"/>
            </svg>
          </button>
          <SourcePill source={task.source} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.displayName ?? task.title}
          </span>
        </div>

        {/* Status */}
        <div style={{ padding: '11px 10px' }}>
          <StatusBadge status={task.status} />
        </div>

        {/* Progress */}
        <div style={{ padding: '11px 10px' }}>
          {indet ? (
            <>
              <ProgressBar indeterminate color={color} height={6} />
              <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>working…</div>
            </>
          ) : (
            <>
              <ProgressBar value={pct} color={color} height={6} />
              <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</div>
            </>
          )}
        </div>

        <div style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          {fmtBytes(task.aggregatedDownloadedBytes ?? task.downloadedBytes)}
        </div>
        <div style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: task.aggregatedDownloadSpeed ? 'var(--brand)' : 'var(--text-dim)' }}>
          {fmtSpeed(task.aggregatedDownloadSpeed ?? task.downloadSpeed)}
        </div>
        <div style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          {fmtEta(task.aggregatedEtaSeconds ?? task.etaSeconds)}
        </div>
        <div style={{ padding: '11px 10px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-dim)' }}>
          {fmtDate(task.createdAt)}
        </div>

        {/* Actions */}
        <div style={{ padding: '11px 8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
          {canInfo && (
            <button onClick={() => onInfo(task)} title="Error details" style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
            </button>
          )}
          {canRetry && (
            <button onClick={() => onRetry(task.id)} title="Retry" style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 7, border: 'none', background: 'color-mix(in srgb, var(--success) 14%, transparent)', color: 'var(--success)', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>
            </button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(task.id)} title="Cancel" style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 7, border: 'none', background: 'color-mix(in srgb, var(--error) 14%, transparent)', color: 'var(--error)', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tasks */}
      {task._expanded && task.subTasks?.length > 0 && (
        <div style={{ padding: '4px 16px 12px 46px', background: 'color-mix(in srgb, var(--surface-2) 60%, var(--surface))', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {task.subTasks.map(st => {
            const stColor = st.type === 'VIDEO' ? 'var(--brand)' : st.type === 'AUDIO' ? 'var(--success)' : 'var(--text-dim)';
            return (
              <div key={st.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 110px 200px', alignItems: 'center', gap: 12, padding: '6px 8px', borderRadius: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--border)', color: 'var(--text-muted)' }}>
                    {subTaskKind(st.type)}{st.language ? ` · ${st.language}` : ''}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {st.displayName ?? st.title ?? st.codec ?? '—'}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                  {fmtBytes(st.totalBytes)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${st.progress ?? 0}%`, background: stColor, transition: 'width .4s linear' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', width: 38, textAlign: 'right' }}>{(st.progress ?? 0).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onCancel, onRetry, onInfo }) {
  const indet     = INDETERMINATE.has(task.status);
  const pct       = task.aggregatedProgress ?? task.progress ?? 0;
  const canCancel = ACTIVE.has(task.status);
  const canRetry  = task.status === 'FAILED' || task.status === 'NOT_FOUND' || task.status === 'CANCELLED';
  const canInfo   = !!task.errorMessage;
  const color     = barColor(task.status);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 11, padding: '15px 18px', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <SourcePill source={task.source} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {task.displayName ?? task.title}
            </span>
          </div>
          <div style={{ marginTop: 5, marginBottom: 2 }}>
            <StatusBadge status={task.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 11 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 11 }}>
              <ProgressBar value={pct} indeterminate={indet} color={color} height={8} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, width: 52, flexShrink: 0 }}>
                {indet ? '…' : pct.toFixed(1) + '%'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {fmtBytes(task.aggregatedDownloadedBytes ?? task.downloadedBytes)} / {fmtBytes(task.aggregatedTotalBytes ?? task.totalBytes)}
              </span>
              <span style={{ color: task.aggregatedDownloadSpeed ? 'var(--brand)' : 'var(--text-dim)', minWidth: 64 }}>
                {fmtSpeed(task.aggregatedDownloadSpeed ?? task.downloadSpeed)}
              </span>
              <span style={{ color: 'var(--text-dim)', minWidth: 56 }}>
                {fmtEta(task.aggregatedEtaSeconds ?? task.etaSeconds)}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {canInfo && (
            <button onClick={() => onInfo(task)} style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
            </button>
          )}
          {canRetry && (
            <button onClick={() => onRetry(task.id)} style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 7, border: '1px solid color-mix(in srgb, var(--success) 40%, var(--border))', background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>
            </button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(task.id)} style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 7, border: '1px solid color-mix(in srgb, var(--error) 40%, var(--border))', background: 'color-mix(in srgb, var(--error) 12%, transparent)', color: 'var(--error)', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DownloadsScreen({ tasks, onCancel, onRetry, onToggleExpanded, onClearCompleted }) {
  const [layout, setLayout] = useState('table');
  const [errorTask, setErrorTask] = useState(null);

  const activeSpeed = tasks
    .map(t => t.aggregatedDownloadSpeed ?? t.downloadSpeed ?? '')
    .filter(Boolean)
    .join(' + ') || null;

  const totalActiveCount = tasks.filter(t => ACTIVE.has(t.status)).length;

  const segBtn = (value, icon, label) => (
    <button onClick={() => setLayout(value)} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 11px', borderRadius: 6, border: 'none', cursor: 'pointer',
      fontSize: 12, fontWeight: 600,
      background: layout === value ? 'var(--elevated)' : 'transparent',
      color: layout === value ? 'var(--text)' : 'var(--text-muted)',
    }}>{icon}{label}</button>
  );

  return (
    <div style={{ padding: '18px 20px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Downloads</h2>
          {totalActiveCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--brand)"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Active</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand)' }}>{totalActiveCount}</span>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', padding: 3, gap: 2, borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {segBtn('table',
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>,
              'Table'
            )}
            {segBtn('cards',
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/></svg>,
              'Cards'
            )}
          </div>
          <button onClick={onClearCompleted} style={{
            display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
            borderRadius: 8, border: '1px solid color-mix(in srgb, var(--error) 40%, var(--border))',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: 'color-mix(in srgb, var(--error) 12%, transparent)', color: 'var(--error)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>
            Clear Completed
          </button>
        </div>
      </div>

      {/* Table */}
      {layout === 'table' && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 1080 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) 118px 196px 112px 104px 92px 86px 96px', padding: '0 4px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Status', 'Progress', 'Downloaded', 'Speed', 'ETA', 'Created', 'Actions'].map(h => (
                  <div key={h} style={{ padding: '11px 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>
              {tasks.length === 0 && (
                <div style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No downloads</div>
              )}
              {tasks.map(t => (
                <TaskRow key={t.id} task={t} onCancel={onCancel} onRetry={onRetry} onInfo={setErrorTask} onToggle={onToggleExpanded} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      {layout === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.length === 0 && (
            <div style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No downloads</div>
          )}
          {tasks.map(t => (
            <TaskCard key={t.id} task={t} onCancel={onCancel} onRetry={onRetry} onInfo={setErrorTask} />
          ))}
        </div>
      )}

      {/* Error dialog */}
      {errorTask && (
        <div onClick={() => setErrorTask(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(3,5,9,.62)', backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: '94vw', display: 'flex', flexDirection: 'column', borderRadius: 14, background: 'var(--elevated)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 70px -12px rgba(0,0,0,.6)', animation: 'hos-pop .16s ease', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '17px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Error Details</h3>
              <button onClick={() => setErrorTask(null)} style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 13 }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'color-mix(in srgb, var(--error) 16%, transparent)', color: 'var(--error)' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>Download failed</div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-muted)', wordBreak: 'break-word' }}>{errorTask.errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
