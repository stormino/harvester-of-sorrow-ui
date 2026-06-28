import { useState, useEffect } from 'react';
import {
  downloadVixSrcMovie, downloadVixSrcTv,
  downloadRaiPlayMovie, downloadRaiPlayTv,
} from '../api/client.js';

const QUALITIES = ['best', '1080', '720', '480'];
const LANGUAGES = [
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
];

function Chip({ label, active, onClick, mono = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
        fontSize: 12.5, fontWeight: 600,
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
        background: active ? 'color-mix(in srgb, var(--brand) 16%, var(--surface-2))' : 'var(--surface-2)',
        color: active ? 'var(--brand)' : 'var(--text-muted)',
        transition: 'border-color .1s, color .1s, background .1s',
      }}
    >{label}</button>
  );
}

function Section({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 9, color: 'var(--text-muted)' }}>
        {label}
        {hint && <span style={{ color: 'var(--text-dim)', fontWeight: 400, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export default function DownloadDialog({ item, onClose, onQueued }) {
  const isTV      = item.numberOfSeasons > 0 || item.season != null;
  const isRaiPlay = item.source === 'RAIPLAY';

  // Language selection (VixSrc only)
  const [langs, setLangs] = useState(['it']);
  // Quality selection (VixSrc only)
  const [quality, setQuality] = useState('best');

  // Season/episode selection (TV only)
  // episodesPerSeason: { "1": 5, "2": 8, ... }
  const episodesPerSeason = item.episodesPerSeason ?? {};
  const seasonNumbers = Object.keys(episodesPerSeason).map(Number).sort((a,b) => a-b);

  const [selectedSeasons, setSelectedSeasons] = useState(
    // For RaiPlay where we have a specific episode, pre-select it
    isRaiPlay && item.season ? [item.season] : []
  );
  const [selectedEpisodes, setSelectedEpisodes] = useState(
    isRaiPlay && item.episode ? { [item.season]: [item.episode] } : {}
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  const toggleLang = (code) =>
    setLangs(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);

  const toggleSeason = (s) => {
    setSelectedSeasons(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
    // Clear episode selection for deselected season
    setSelectedEpisodes(prev => {
      const next = { ...prev };
      if (selectedSeasons.includes(s)) delete next[s];
      return next;
    });
  };

  const toggleEpisode = (season, ep) => {
    setSelectedEpisodes(prev => {
      const cur = prev[season] ?? [];
      const next = cur.includes(ep) ? cur.filter(e => e !== ep) : [...cur, ep];
      return { ...prev, [season]: next };
    });
  };

  // Episodes available for currently selected seasons
  const episodeChipsBySeason = selectedSeasons.map(s => ({
    season: s,
    episodes: Array.from({ length: episodesPerSeason[s] ?? 0 }, (_, i) => i + 1),
  }));

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const meta = item.sourceMetadata ?? {};

      if (isRaiPlay) {
        if (!isTV) {
          await downloadRaiPlayMovie(meta.pathId, item.title, item.year);
        } else {
          // Queue each selected episode
          const tasks = [];
          for (const s of selectedSeasons) {
            const eps = selectedEpisodes[s] ?? [];
            for (const ep of eps) {
              tasks.push(downloadRaiPlayTv(meta.pathId, item.title, s, ep, item.episodeName));
            }
          }
          if (!tasks.length) { setError('Select at least one episode.'); setSubmitting(false); return; }
          await Promise.all(tasks);
        }
      } else {
        // VixSrc
        if (!isTV) {
          await downloadVixSrcMovie(item.tmdbId, langs, quality);
        } else {
          const tasks = [];
          for (const s of selectedSeasons) {
            const eps = selectedEpisodes[s] ?? [];
            for (const ep of eps) {
              tasks.push(downloadVixSrcTv(item.tmdbId, s, ep, langs, quality));
            }
          }
          if (!tasks.length) { setError('Select at least one episode.'); setSubmitting(false); return; }
          await Promise.all(tasks);
        }
      }

      onQueued?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(3,5,9,.62)', backdropFilter: 'blur(3px)',
        display: 'grid', placeItems: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, maxWidth: '94vw', maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          borderRadius: 14, background: 'var(--elevated)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 24px 70px -12px rgba(0,0,0,.6)',
          animation: 'hos-pop .16s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '17px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
              {item.source} · {item.year}{isTV ? ` · ${item.numberOfSeasons} season${item.numberOfSeasons !== 1 ? 's' : ''}` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Language — VixSrc only */}
          {!isRaiPlay && (
            <Section label="Languages">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {LANGUAGES.map(l => (
                  <Chip key={l.code} label={l.label} mono active={langs.includes(l.code)} onClick={() => toggleLang(l.code)} />
                ))}
              </div>
            </Section>
          )}

          {/* Quality — VixSrc only */}
          {!isRaiPlay && (
            <Section label="Quality">
              <div style={{ display: 'flex', gap: 7 }}>
                {QUALITIES.map(q => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-mono)',
                      border: `1px solid ${quality === q ? 'var(--brand)' : 'var(--border)'}`,
                      background: quality === q ? 'color-mix(in srgb, var(--brand) 16%, var(--surface-2))' : 'var(--surface-2)',
                      color: quality === q ? 'var(--brand)' : 'var(--text-muted)',
                    }}
                  >{q === 'best' ? 'Best' : q + 'p'}</button>
                ))}
              </div>
            </Section>
          )}

          {/* Season picker — TV only */}
          {isTV && seasonNumbers.length > 0 && (
            <Section label="Seasons" hint="— empty = all seasons">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {seasonNumbers.map(s => (
                  <Chip key={s} label={`S${s}`} mono active={selectedSeasons.includes(s)} onClick={() => toggleSeason(s)} />
                ))}
              </div>
            </Section>
          )}

          {/* Episode picker — per selected season */}
          {isTV && episodeChipsBySeason.map(({ season, episodes }) => episodes.length > 0 && (
            <Section key={season} label={`Season ${season} episodes`} hint="— empty = all">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {episodes.map(ep => {
                  const active = (selectedEpisodes[season] ?? []).includes(ep);
                  return (
                    <button
                      key={ep}
                      onClick={() => toggleEpisode(season, ep)}
                      style={{
                        minWidth: 40, padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
                        border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                        background: active ? 'color-mix(in srgb, var(--brand) 16%, var(--surface-2))' : 'var(--surface-2)',
                        color: active ? 'var(--brand)' : 'var(--text-muted)',
                      }}
                    >E{ep}</button>
                  );
                })}
              </div>
            </Section>
          ))}

          {/* RaiPlay movie — no extra options */}
          {isRaiPlay && !isTV && (
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Ready to queue <strong style={{ color: 'var(--text)' }}>{item.title}</strong> from RaiPlay.
            </p>
          )}

          {error && (
            <div style={{ padding: '10px 13px', borderRadius: 8, background: 'color-mix(in srgb, var(--error) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--error) 35%, transparent)', fontSize: 12.5, color: 'var(--error)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 9, padding: '15px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button
            onClick={onClose}
            style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'transparent', color: 'var(--text-muted)' }}
          >Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 18px',
              borderRadius: 8, border: 'none', cursor: submitting ? 'default' : 'pointer',
              fontSize: 13, fontWeight: 600,
              background: 'var(--brand)', color: '#fff',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting && <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', animation: 'hos-spin .7s linear infinite', display: 'block' }} />}
            {submitting ? 'Queuing…' : 'Queue Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
