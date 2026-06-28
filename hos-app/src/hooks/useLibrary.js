import { useState, useCallback } from 'react';
import {
  scanLibrary, listMonitored,
  enableMonitoring, disableMonitoring,
  removeMonitored, checkNow,
} from '../api/client.js';

export function useLibrary() {
  const [entries, setEntries]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [checkingId, setCheckingId] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [lib, monitored] = await Promise.all([scanLibrary(), listMonitored()]);
      // scanLibrary returns LibraryEntry[] which already embeds monitoredShow
      // listMonitored gives us the full list in case scan misses any
      const monitoredMap = Object.fromEntries((monitored ?? []).map(m => [m.directoryName, m]));
      const merged = (lib ?? []).map(e => ({
        ...e,
        monitoredShow: e.monitoredShow ?? monitoredMap[e.directoryName] ?? null,
        monitored: e.monitored || !!monitoredMap[e.directoryName],
      }));
      setEntries(merged);
    } catch (err) {
      console.error('Library load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMonitor = useCallback(async (entry) => {
    const show = entry.monitoredShow;
    if (!show) return;
    try {
      if (show.enabled) {
        await disableMonitoring(show.id);
      } else {
        await enableMonitoring(show.id);
      }
      await refresh();
    } catch (err) {
      console.error('Toggle monitor failed:', err);
    }
  }, [refresh]);

  const remove = useCallback(async (id) => {
    try {
      await removeMonitored(id);
      await refresh();
    } catch (err) {
      console.error('Remove monitored failed:', err);
    }
  }, [refresh]);

  const check = useCallback(async (id) => {
    setCheckingId(id);
    try {
      const result = await checkNow(id);
      await refresh();
      return result;
    } catch (err) {
      console.error('Check now failed:', err);
      return null;
    } finally {
      setCheckingId(null);
    }
  }, [refresh]);

  return { entries, loading, checkingId, refresh, toggleMonitor, remove, check };
}
