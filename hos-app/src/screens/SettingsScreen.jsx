import { useState } from 'react';

const DOWNLOAD_CONFIG = [
  { label: 'Download Directory',      value: '/mnt/media/downloads',  span: 2 },
  { label: 'Library Directory',       value: '/mnt/media/library',    span: 2 },
  { label: 'Max Concurrent Downloads',value: '2',                     span: 1 },
  { label: 'Max Retry Attempts',      value: '3',                     span: 1 },
  { label: 'Segment Threads',         value: '4',                     span: 1 },
  { label: 'Connection Timeout (s)',  value: '30',                    span: 1 },
];

function WarningBanner({ children }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:9, marginTop:14, padding:'11px 13px',
      borderRadius:9,
      background:'color-mix(in srgb, var(--warning) 13%, transparent)',
      border:'1px solid color-mix(in srgb, var(--warning) 35%, transparent)',
      fontSize:12.5,
      color:'color-mix(in srgb, var(--warning) 65%, var(--text))',
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>
      {children}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:12, background:'var(--surface)', padding:22, marginBottom:18 }}>
      {title && <h3 style={{ margin:'0 0 16px', fontSize:16, fontWeight:700 }}>{title}</h3>}
      {children}
    </div>
  );
}

function ReadOnlyField({ value }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', height:38, padding:'0 12px',
      borderRadius:8, border:'1px solid var(--border)',
      background:'var(--surface-2)', color:'var(--text)',
      fontFamily:'var(--font-mono)', fontSize:12.5,
    }}>{value}</div>
  );
}

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('••••••••••••••••••••8f2a');
  const [toolCheckResult, setToolCheckResult] = useState(null);

  const handleCheckTools = () => {
    setToolCheckResult({ ok: true, msg: 'ffmpeg version 6.1.1 — Copyright (c) 2000-2024 the FFmpeg developers\nbuilt with gcc 13.2.0' });
  };

  return (
    <div style={{ maxWidth:880, margin:'0 auto', padding:'18px 20px 36px' }}>
      <h2 style={{ margin:'0 0 26px', fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>Settings</h2>

      {/* TMDB */}
      <Panel>
        <h3 style={{ margin:'0 0 5px', fontSize:16, fontWeight:700 }}>TMDB Configuration</h3>
        <p style={{ margin:'0 0 16px', fontSize:12.5, color:'var(--text-muted)' }}>
          Metadata is sourced from <span style={{ color:'var(--brand)' }}>themoviedb.org</span>. An API key is required.
        </p>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>API Key</label>
        <input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{
            width:'100%', height:40, padding:'0 12px', borderRadius:8,
            border:'1px solid var(--border)', background:'var(--surface-2)',
            color:'var(--text)', fontFamily:'var(--font-mono)', fontSize:13,
          }}
        />
        <WarningBanner>Note: API key changes require application restart.</WarningBanner>
      </Panel>

      {/* Download config */}
      <Panel title="Download Configuration">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 22px' }}>
          {DOWNLOAD_CONFIG.map(f => (
            <div key={f.label} style={{ gridColumn: `span ${f.span}` }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>{f.label}</label>
              <ReadOnlyField value={f.value} />
            </div>
          ))}
        </div>
        <WarningBanner>Download configuration is read-only. Update via environment variables or application.yml and restart.</WarningBanner>
      </Panel>

      {/* Extractor */}
      <Panel title="Extractor Configuration">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 22px' }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>VixSrc Base URL</label>
            <ReadOnlyField value="https://vixsrc.to" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Timeout (seconds)</label>
            <ReadOnlyField value="30" />
          </div>
        </div>
      </Panel>

      {/* System info */}
      <Panel title="System Information">
        <div style={{ display:'flex', flexDirection:'column', gap:1, fontFamily:'var(--font-mono)', fontSize:13, marginBottom:18 }}>
          {[
            ['Java Version', '21.0.3'],
            ['OS', 'Linux 6.8.0-generic'],
            ['Available Processors', '16'],
          ].map(([k,v], i, arr) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 2px', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color:'var(--text-muted)' }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={handleCheckTools} style={{
          display:'inline-flex', alignItems:'center', gap:8, height:40, padding:'0 18px',
          borderRadius:9, border:'none', cursor:'pointer',
          fontSize:13.5, fontWeight:600, background:'var(--brand)', color:'#fff',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6a1.4 1.4 0 1 0 2 2l6-6a4 4 0 0 0 5.4-5.4l-2.4 2.4-2-2z"/></svg>
          Check Tools
        </button>

        {/* Tool check result inline */}
        {toolCheckResult && (
          <div style={{ marginTop:16, display:'flex', gap:13 }}>
            <div style={{ flexShrink:0, width:36, height:36, borderRadius:9, display:'grid', placeItems:'center', background:'color-mix(in srgb, var(--success) 16%, transparent)', color:'var(--success)' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:600, marginBottom:6, color:'var(--success)' }}>ffmpeg available</div>
              <p style={{ margin:0, fontFamily:'var(--font-mono)', fontSize:12, lineHeight:1.55, color:'var(--text-muted)', whiteSpace:'pre-line' }}>{toolCheckResult.msg}</p>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
