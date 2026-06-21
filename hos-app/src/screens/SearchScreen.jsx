import { useState } from 'react';
import SourcePill from '../components/SourcePill.jsx';

const SOURCE_COLOR = { VixSrc: 'var(--vixsrc)', RaiPlay: 'var(--raiplay)' };

function ResultCard({ item, cardStyle, onDownload }) {
  const [hovered, setHovered] = useState(false);
  const accentColor = item.type === 'movie' ? 'var(--type-movie)' : 'var(--type-tv)';
  const sourceColor = SOURCE_COLOR[item.source] || 'var(--brand)';

  let cardBg = 'var(--surface)';
  if (cardStyle === 'gradient') {
    cardBg = item.type === 'movie'
      ? 'linear-gradient(135deg, color-mix(in srgb, var(--type-movie) 12%, var(--surface)), var(--surface))'
      : 'linear-gradient(135deg, color-mix(in srgb, var(--type-tv) 12%, var(--surface)), var(--surface))';
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        '--ca': accentColor,
        position: 'relative',
        borderRadius: 14,
        padding: 16,
        background: cardBg,
        border: `1px solid ${hovered ? accentColor : 'var(--border)'}`,
        boxShadow: hovered ? `0 12px 28px -10px color-mix(in srgb, ${accentColor} 60%, transparent)` : '0 1px 2px rgba(0,0,0,.18)',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {cardStyle === 'accent' && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accentColor }} />
      )}
      <div style={{ display:'flex', gap:14 }}>
        {cardStyle === 'poster' && (
          <div style={{
            flexShrink:0, width:76, height:110, borderRadius:8,
            background:`repeating-linear-gradient(135deg, color-mix(in srgb, ${accentColor} 24%, var(--surface-2)) 0 7px, color-mix(in srgb, ${accentColor} 11%, var(--surface-2)) 7px 14px)`,
            border:`1px solid color-mix(in srgb, ${accentColor} 35%, var(--border))`,
            display:'grid', placeItems:'center',
          }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-muted)', letterSpacing:'0.04em' }}>poster</span>
          </div>
        )}
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:700, lineHeight:1.2, letterSpacing:'-0.01em' }}>{item.title}</h3>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginTop:9 }}>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:10.5, fontWeight:600,
              padding:'3px 8px', borderRadius:5, color:'#fff', background:sourceColor,
            }}>{item.source}</span>
            {item.type === 'tv' && <>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10.5, fontWeight:600, padding:'3px 7px', borderRadius:5, background:'color-mix(in srgb, var(--text) 12%, transparent)', color:'var(--text-muted)' }}>S{item.seasons}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10.5, fontWeight:600, padding:'3px 7px', borderRadius:5, background:'color-mix(in srgb, var(--text) 12%, transparent)', color:'var(--text-muted)' }}>E{item.episodes}</span>
            </>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:11, fontSize:12.5 }}>
            <span style={{ fontWeight:600, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{item.year}</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontWeight:600, color:'var(--amber)', fontFamily:'var(--font-mono)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .7-5 4.8 1.4 7L12 17.8 5.6 21l1.4-7-5-4.8 7-.7z"/></svg>
              {item.rating}
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--text-dim)' }}>{item.tmdb}</span>
          </div>
        </div>
      </div>
      <p style={{ margin:'13px 0 0', fontSize:12.5, lineHeight:1.5, color:'var(--text-muted)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.overview}</p>
      <div style={{ flex:1, minHeight:14 }} />
      <div>
        <button
          onClick={e => { e.stopPropagation(); onDownload(item); }}
          style={{
            display:'inline-flex', alignItems:'center', gap:7,
            padding:'8px 14px', borderRadius:8,
            border:`1px solid color-mix(in srgb, ${accentColor} 45%, var(--border))`,
            cursor:'pointer', fontSize:12.5, fontWeight:600,
            background:`color-mix(in srgb, ${accentColor} 16%, var(--surface))`,
            color:'var(--text)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m7 12 5 5 5-5"/><path d="M5 21h14"/></svg>
          Download
        </button>
      </div>
    </div>
  );
}

export default function SearchScreen({ results, onDownload }) {
  const [query, setQuery] = useState('breaking');
  const [searchType, setSearchType] = useState('both');
  const [cardStyle, setCardStyle] = useState('gradient');
  const [searched, setSearched] = useState(true);
  const [displayedResults, setDisplayedResults] = useState(results);

  const doSearch = () => {
    const q = query.toLowerCase();
    let filtered = results;
    if (searchType !== 'both') filtered = results.filter(r => r.type === (searchType === 'movies' ? 'movie' : 'tv'));
    if (q) filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || r.overview.toLowerCase().includes(q));
    setDisplayedResults(filtered);
    setSearched(true);
  };

  const handleKey = e => { if (e.key === 'Enter') doSearch(); };

  const segBtn = (active, onClick, label) => (
    <button onClick={onClick} style={{
      padding:'7px 14px', borderRadius:7, border:'none', cursor:'pointer',
      fontSize:13, fontWeight:600,
      background: active ? 'var(--elevated)' : 'transparent',
      color: active ? 'var(--text)' : 'var(--text-muted)',
      boxShadow: active ? 'var(--shadow-sm)' : 'none',
    }}>{label}</button>
  );

  const csBtn = (style, label) => (
    <button onClick={() => setCardStyle(style)} style={{
      padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer',
      fontSize:12, fontWeight:600,
      background: cardStyle === style ? 'var(--elevated)' : 'transparent',
      color: cardStyle === style ? 'var(--text)' : 'var(--text-muted)',
    }}>{label}</button>
  );

  return (
    <div style={{ padding:'18px 20px 36px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20, marginBottom:22, flexWrap:'wrap' }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>Search</h2>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-dim)' }}>Card style</span>
          <div style={{ display:'flex', padding:3, gap:2, borderRadius:9, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
            {csBtn('gradient', 'Gradient')}
            {csBtn('accent', 'Accent')}
            {csBtn('poster', 'Poster')}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', marginBottom:24 }}>
        <div style={{ flex:1, minWidth:280, display:'flex', alignItems:'center', gap:10, height:44, padding:'0 14px', borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color:'var(--text-dim)', flexShrink:0 }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search movies and TV shows..."
            style={{ flex:1, background:'transparent', border:'none', color:'var(--text)', fontSize:14 }}
          />
        </div>
        <div style={{ display:'flex', padding:4, gap:2, borderRadius:10, background:'var(--surface-2)', border:'1px solid var(--border)', height:44, alignItems:'center' }}>
          {segBtn(searchType==='movies', () => setSearchType('movies'), 'Movies')}
          {segBtn(searchType==='tv',     () => setSearchType('tv'),     'TV Shows')}
          {segBtn(searchType==='both',   () => setSearchType('both'),   'Both')}
        </div>
        <button onClick={doSearch} style={{
          display:'flex', alignItems:'center', gap:8, height:44, padding:'0 20px',
          borderRadius:10, border:'none', cursor:'pointer',
          fontSize:14, fontWeight:600, background:'var(--brand)', color:'#fff',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          Search
        </button>
      </div>

      {/* Results */}
      {searched && displayedResults.length === 0 && (
        <div style={{ padding:'60px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
          No results found for: <span style={{ color:'var(--text)', fontWeight:600 }}>{query}</span>
        </div>
      )}
      {displayedResults.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(310px, 100%), 1fr))', gap:16 }}>
          {displayedResults.map(item => (
            <ResultCard key={item.id} item={item} cardStyle={cardStyle} onDownload={onDownload} />
          ))}
        </div>
      )}
    </div>
  );
}
