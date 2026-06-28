import { useState, useEffect, useCallback, useRef } from 'react';
import { listDownloads, cancelDownload, retryDownload } from '../api/client.js';

const POLL_MS = 3000;

export function useDownloads() {
  const [tasks, setTasks]           = useState([]);
  const [connected, setConnected]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const esRef = useRef(null);

  // Initial load
  const fetchAll = useCallback(async () => {
    try {
      const data = await listDownloads();
      setTasks(data ?? []);
    } catch {
      // backend unreachable — tasks stay as-is
    } finally {
      setLoading(false);
    }
  }, []);

  // Merge a single SSE progress update into the task list
  const applyUpdate = useCallback((update) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== update.taskId) return t;
      const updated = {
        ...t,
        status:                update.status        ?? t.status,
        aggregatedProgress:    update.progress      ?? t.aggregatedProgress,
        aggregatedDownloadSpeed: update.downloadSpeed ?? t.aggregatedDownloadSpeed,
        aggregatedEtaSeconds:  update.etaSeconds    ?? t.aggregatedEtaSeconds,
        errorMessage:          update.errorMessage  ?? t.errorMessage,
      };
      // If it's a sub-task update, merge into subTasks too
      if (update.subTaskId && t.subTasks) {
        updated.subTasks = t.subTasks.map(st =>
          st.id === update.subTaskId
            ? { ...st,
                status:        update.status       ?? st.status,
                progress:      update.progress     ?? st.progress,
                downloadSpeed: update.downloadSpeed ?? st.downloadSpeed,
                etaSeconds:    update.etaSeconds   ?? st.etaSeconds,
              }
            : st
        );
      }
      return updated;
    }));

    // On terminal states, do a full refresh to get accurate final data
    if (['COMPLETED','FAILED','CANCELLED','NOT_FOUND'].includes(update.status)) {
      setTimeout(fetchAll, 500);
    }
  }, [fetchAll]);

  // SSE connection
  useEffect(() => {
    fetchAll();

    let es;
    let pollTimer;
    let reconnectTimer;

    const connect = () => {
      es = new EventSource('/api/progress/stream');
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
        clearInterval(pollTimer);
      };

      es.onmessage = (e) => {
        try { applyUpdate(JSON.parse(e.data)); } catch {}
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Fall back to polling while SSE is down
        pollTimer = setInterval(fetchAll, POLL_MS);
        // Try to reconnect SSE after 5s
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      es?.close();
      clearInterval(pollTimer);
      clearTimeout(reconnectTimer);
    };
  }, [fetchAll, applyUpdate]);

  const cancel = useCallback(async (id) => {
    await cancelDownload(id);
    fetchAll();
  }, [fetchAll]);

  const retry = useCallback(async (id) => {
    await retryDownload(id);
    fetchAll();
  }, [fetchAll]);

  const toggleExpanded = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, _expanded: !t._expanded } : t));
  }, []);

  const clearCompleted = useCallback(async () => {
    const completed = tasks.filter(t =>
      ['COMPLETED','CANCELLED','NOT_FOUND'].includes(t.status)
    );
    await Promise.allSettled(completed.map(t => cancelDownload(t.id)));
    fetchAll();
  }, [tasks, fetchAll]);

  const refresh = fetchAll;

  return { tasks, connected, loading, cancel, retry, toggleExpanded, clearCompleted, refresh };
}
