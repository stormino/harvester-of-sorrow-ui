const BASE = '/api';

async function request(method, path, params, body) {
  const url = new URL(BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(item => url.searchParams.append(k, item));
      else if (v != null) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}

// ── Search ──────────────────────────────────────────────────────────────────

export const searchAll = (query, type, source) =>
  request('GET', '/search', { query, type, source });

// ── Downloads ────────────────────────────────────────────────────────────────

export const listDownloads   = ()    => request('GET',    '/downloads');
export const cancelDownload  = (id)  => request('DELETE', `/downloads/${id}`);
export const retryDownload   = (id)  => request('POST',   `/downloads/${id}/retry`);

export const downloadVixSrcMovie = (tmdbId, languages, quality) =>
  request('POST', '/download/movie', null, { tmdbId, languages, quality });

export const downloadVixSrcTv = (tmdbId, season, episode, languages, quality) =>
  request('POST', '/download/tv', null, { tmdbId, season, episode, languages, quality });

export const downloadRaiPlayMovie = (pathId, title, year) =>
  request('POST', '/download/raiplay/movie', null, { pathId, title, year });

export const downloadRaiPlayTv = (pathId, title, season, episode, episodeName) =>
  request('POST', '/download/raiplay/tv', null, { pathId, title, season, episode, episodeName });

// ── Library ──────────────────────────────────────────────────────────────────

export const scanLibrary       = ()         => request('GET',    '/library');
export const listMonitored     = ()         => request('GET',    '/library/monitored');
export const addMonitored      = (body)     => request('POST',   '/library/monitored', null, body);
export const updateMonitored   = (id, body) => request('PUT',    `/library/monitored/${id}`, null, body);
export const removeMonitored   = (id)       => request('DELETE', `/library/monitored/${id}`);
export const enableMonitoring  = (id)       => request('POST',   `/library/monitored/${id}/enable`);
export const disableMonitoring = (id)       => request('POST',   `/library/monitored/${id}/disable`);
export const checkNow          = (id)       => request('POST',   `/library/monitored/${id}/check`);
