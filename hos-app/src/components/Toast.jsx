import { useState, useCallback } from 'react';

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

const ACCENT = { success: 'var(--success)', error: 'var(--error)', info: 'var(--brand)', warning: 'var(--warning)' };

export function ToastContainer({ toasts }) {
  return (
    <div style={{ position:'fixed', right:20, bottom:20, zIndex:80, display:'flex', flexDirection:'column', gap:9, alignItems:'flex-end', pointerEvents:'none' }}>
      {toasts.map(z => {
        const accent = ACCENT[z.type] || ACCENT.info;
        return (
          <div key={z.id} style={{
            display:'flex', alignItems:'center', gap:10,
            minWidth:240, maxWidth:380,
            padding:'12px 15px',
            borderRadius:10,
            background:'var(--elevated)',
            border:`1px solid var(--border-strong)`,
            borderLeft:`3px solid ${accent}`,
            boxShadow:'0 10px 30px -8px rgba(0,0,0,.5)',
            animation:'hos-toast .2s ease',
            pointerEvents:'auto',
          }}>
            <span style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:accent }} />
            <span style={{ fontSize:13, color:'var(--text)' }}>{z.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
