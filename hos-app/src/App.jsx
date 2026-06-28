import { useState } from 'react';
import { useTheme } from './hooks/useTheme.js';
import { useWindowSize } from './hooks/useWindowSize.js';
import { useDownloads } from './hooks/useDownloads.js';
import { useToasts, ToastContainer } from './components/Toast.jsx';
import ScytheIcon from './components/ScytheIcon.jsx';
import SearchScreen from './screens/SearchScreen.jsx';
import DownloadsScreen from './screens/DownloadsScreen.jsx';
import LibraryScreen from './screens/LibraryScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';

const VERSION = 'v2.4.1';

const NAV_ITEMS = [
  { id: 'search',    label: 'Search',    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg> },
  { id: 'downloads', label: 'Downloads', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m7 12 5 5 5-5"/><path d="M5 21h14"/></svg> },
  { id: 'library',   label: 'Library',   icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h18M3 16h4M17 8h4M17 16h4"/></svg> },
  { id: 'settings',  label: 'Settings',  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h9"/><path d="M16 7h5"/><circle cx="14" cy="7" r="2.2"/><path d="M3 17h5"/><path d="M12 17h9"/><circle cx="10" cy="17" r="2.2"/></svg> },
];

function NavItem({ item, active, onClick, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 11px', borderRadius: 8, border: 'none',
        cursor: 'pointer', fontSize: 13.5, fontWeight: 500, textAlign: 'left', width: '100%',
        background: active
          ? 'color-mix(in srgb, var(--brand) 14%, transparent)'
          : hovered ? 'var(--surface-2)' : 'transparent',
        color: active ? 'var(--brand)' : hovered ? 'var(--text)' : 'var(--text-muted)',
        transition: 'background .1s, color .1s',
      }}
    >
      {item.icon}
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge != null && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
          padding: '2px 7px', borderRadius: 20,
          background: 'color-mix(in srgb, var(--brand) 20%, transparent)',
          color: 'var(--brand)',
        }}>{badge}</span>
      )}
    </button>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { isMobile } = useWindowSize();
  const [route, setRoute] = useState('downloads');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toasts, addToast } = useToasts();
  const {
    tasks, connected, loading: downloadsLoading,
    cancel, retry, toggleExpanded, clearCompleted,
  } = useDownloads();

  const activeCount = tasks.filter(t => ['DOWNLOADING', 'EXTRACTING', 'MERGING', 'COPYING'].includes(t.status)).length;

  const navigate = (id) => { setRoute(id); setDrawerOpen(false); };

  const handleQueued = () => {
    addToast('Added to download queue', 'success');
    navigate('downloads');
  };

  const showSidebar = !isMobile && sidebarOpen;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* NAVBAR */}
      <nav style={{
        height: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <button
          onClick={() => isMobile ? setDrawerOpen(o => !o) : setSidebarOpen(o => !o)}
          style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 7, border: '1px solid transparent', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center' }}>
              <ScytheIcon size={34} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Harvester of Sorrow</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>{VERSION}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', padding: '5px 10px', borderRadius: 7, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: connected ? 'var(--success)' : 'var(--error)',
            boxShadow: connected ? '0 0 0 3px color-mix(in srgb, var(--success) 22%, transparent)' : 'none',
          }} />
          {connected ? 'connected' : 'offline'}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 34, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12.5, fontWeight: 500 }}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          )}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </nav>

      {/* SHELL */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* DESKTOP SIDEBAR */}
        {showSidebar && (
          <aside style={{
            width: 234, flexShrink: 0,
            background: 'var(--surface)', borderRight: '1px solid var(--border)',
            padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '6px 10px 8px' }}>Navigation</div>
            {NAV_ITEMS.map(item => (
              <NavItem
                key={item.id}
                item={item}
                active={route === item.id}
                onClick={() => navigate(item.id)}
                badge={item.id === 'downloads' && activeCount > 0 ? activeCount : undefined}
              />
            ))}
          </aside>
        )}

        {/* MOBILE DRAWER OVERLAY */}
        {isMobile && drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(3,5,9,.55)', backdropFilter: 'blur(2px)' }}
            />
            <div style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 51,
              width: 260, background: 'var(--surface)', borderRight: '1px solid var(--border)',
              padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3,
              overflowY: 'auto', animation: 'hos-pop .15s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '2px 4px' }}>Navigation</div>
                <button onClick={() => setDrawerOpen(false)} style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              {NAV_ITEMS.map(item => (
                <NavItem key={item.id} item={item} active={route === item.id} onClick={() => navigate(item.id)}
                  badge={item.id === 'downloads' && activeCount > 0 ? activeCount : undefined}
                />
              ))}
            </div>
          </>
        )}

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'scroll', scrollbarGutter: 'stable', height: 'calc(100vh - 56px)', paddingBottom: isMobile ? 52 : 0 }}>
          {route === 'search'    && <SearchScreen onQueued={handleQueued} />}
          {route === 'downloads' && (
            <DownloadsScreen
              tasks={tasks}
              onCancel={cancel}
              onRetry={retry}
              onToggleExpanded={toggleExpanded}
              onClearCompleted={clearCompleted}
              onAddToast={addToast}
            />
          )}
          {route === 'library'   && <LibraryScreen />}
          {route === 'settings'  && <SettingsScreen />}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          height: 52, background: 'var(--surface)', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch',
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'transparent',
                color: route === item.id ? 'var(--brand)' : 'var(--text-muted)',
                cursor: 'pointer', padding: 0, position: 'relative',
              }}
            >
              {item.icon}
              {item.id === 'downloads' && activeCount > 0 && (
                <span style={{
                  position: 'absolute', top: 8, right: 'calc(50% - 20px)',
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: 'var(--brand)', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                }}>{activeCount}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
