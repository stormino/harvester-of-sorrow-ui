import { useState, useEffect, useCallback, useRef } from 'react';
import { listDownloads, cancelDownload, retryDownload } from '../api/client.js';

export function useDownloads() {
  const [tasks, setTasks]         = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading]     = useState(true);
  const esRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const data = await listDownloads();
      setTasks(data ?? []);
    } catch {
      // ignore — SSE keeps state up to date
    } finally {
      setLoading(false);
    }
  }, []);

  const applyUpdate = useCallback((update) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== update.taskId) return t;
      const updated = {
        ...t,
        status:                  update.status        ?? t.status,
        aggregatedProgress:      update.progress      ?? t.aggregatedProgress,
        aggregatedDownloadSpeed: update.downloadSpeed ?? t.aggregatedDownloadSpeed,
        aggregatedEtaSeconds:    update.etaSeconds    ?? t.aggregatedEtaSeconds,
        errorMessage:            update.errorMessage  ?? t.errorMessage,
      };
      if (update.subTaskId && t.subTasks) {
        updated.subTasks = t.subTasks.map(st =>
          st.id === update.subTaskId
            ? { ...st,
                status:        update.status        ?? st.status,
                progress:      update.progress      ?? st.progress,
                downloadSpeed: update.downloadSpeed ?? st.downloadSpeed,
                etaSeconds:    update.etaSeconds    ?? st.etaSeconds,
              }
            : st
        );
      }
      return updated;
    }));
  }, []);

  useEffect(() => {
    // One-time load for initial task list, then SSE takes over
    fetchAll();

    const es = new EventSource('/api/progress/stream');
    esRef.current = es;

    es.onopen    = () => setConnected(true);
    es.onmessage = (e) => { try { applyUpdate(JSON.parse(e.data)); } catch {} };
    es.onerror   = () => setConnected(false);

    return () => es.close();
  }, [fetchAll, applyUpdate]);

  const cancel = useCallback(async (id) => {
    await cancelDownload(id);
  }, []);

  const retry = useCallback(async (id) => {
    await retryDownload(id);
  }, []);

  const toggleExpanded = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, _expanded: !t._expanded } : t));
  }, []);

  const clearCompleted = useCallback(async () => {
    const completed = tasks.filter(t =>
      ['COMPLETED', 'CANCELLED', 'NOT_FOUND'].includes(t.status)
    );
    await Promise.allSettled(completed.map(t => cancelDownload(t.id)));
    setTasks(prev => prev.filter(t => !['COMPLETED', 'CANCELLED', 'NOT_FOUND'].includes(t.status)));
  }, [tasks]);

  return { tasks, connected, loading, cancel, retry, toggleExpanded, clearCompleted };
}
