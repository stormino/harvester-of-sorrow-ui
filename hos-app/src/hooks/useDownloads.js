import { useState, useEffect, useRef } from 'react';

const OVERVIEWS = {
  dune: 'Paul Atreides unites with the Fremen to wage war against House Harkonnen and avenge his family.',
  opp:  'The story of J. Robert Oppenheimer and his role developing the atomic bomb during WWII.',
  bb:   "A chemistry teacher diagnosed with cancer turns to manufacturing meth to secure his family's future.",
  mare: 'Teenagers serve sentences in a juvenile prison in Naples, caught between loyalty and redemption.',
  perf: 'Seven friends share the contents of every text and call at a dinner party, with explosive results.',
  bear: 'A young chef returns home to Chicago to run his late brother\'s chaotic sandwich shop.',
};

const vixTracks = [
  { kind:'video', label:'Video · 1080p', frac:1 },
  { kind:'audio', label:'Audio · it',    frac:0.06 },
  { kind:'audio', label:'Audio · en',    frac:0.06 },
  { kind:'sub',   label:'Subtitle · it', frac:0.002 },
  { kind:'sub',   label:'Subtitle · en', frac:0.002 },
];
const raiTracks = [
  { kind:'video', label:'Video · 1080p', frac:1 },
  { kind:'audio', label:'Audio · it',    frac:0.06 },
  { kind:'sub',   label:'Subtitle · it', frac:0.002 },
];

function cloneTracks(arr) { return arr.map(t => ({ ...t })); }

const SEED_RESULTS = [
  { id:'r1', type:'movie', source:'VixSrc',  title:'Dune: Part Two',       year:'2024', rating:'8.4', tmdb:'TMDB 693134', seasons:null, episodes:null, overview: OVERVIEWS.dune },
  { id:'r2', type:'tv',    source:'VixSrc',  title:'Breaking Bad',          year:'2008', rating:'8.9', tmdb:'TMDB 1396',   seasons:5, episodes:62,   overview: OVERVIEWS.bb },
  { id:'r3', type:'movie', source:'VixSrc',  title:'Oppenheimer',           year:'2023', rating:'8.1', tmdb:'TMDB 872585', seasons:null, episodes:null, overview: OVERVIEWS.opp },
  { id:'r4', type:'tv',    source:'RaiPlay', title:'Mare Fuori',            year:'2020', rating:'7.9', tmdb:'TMDB 95080',  seasons:4, episodes:48,   overview: OVERVIEWS.mare },
  { id:'r5', type:'movie', source:'RaiPlay', title:'Perfetti sconosciuti',  year:'2016', rating:'7.7', tmdb:'TMDB 376867', seasons:null, episodes:null, overview: OVERVIEWS.perf },
  { id:'r6', type:'tv',    source:'VixSrc',  title:'The Bear',              year:'2022', rating:'8.5', tmdb:'TMDB 136315', seasons:3, episodes:28,   overview: OVERVIEWS.bear },
];

const SEED_TASKS = [
  { id:'t1', source:'RAIPLAY', name:'Il Commissario Montalbano — S14E02', status:'DOWNLOADING', progress:41.8,  totalBytes:2.1e9, downloadedBytes:0.88e9,  speed:11.2e6, etaSec:108, createdAt:'09:14:02', _baseSpeed:12e6,  tracks:cloneTracks(raiTracks), expanded:false },
  { id:'t2', source:'VIXSRC',  name:'Dune: Part Two (2024)',              status:'DOWNLOADING', progress:73.5,  totalBytes:4.7e9, downloadedBytes:3.45e9,  speed:18.6e6, etaSec:67,  createdAt:'09:11:48', _baseSpeed:19e6,  tracks:cloneTracks(vixTracks), expanded:true },
  { id:'t3', source:'VIXSRC',  name:'Oppenheimer (2023)',                 status:'EXTRACTING',  progress:0,     totalBytes:5.2e9, downloadedBytes:0,        speed:0,       etaSec:0,   createdAt:'09:15:30', _baseSpeed:16e6, _phase:4, tracks:cloneTracks(vixTracks), expanded:false },
  { id:'t4', source:'VIXSRC',  name:'Breaking Bad — S05E14',             status:'QUEUED',      progress:0,     totalBytes:1.6e9, downloadedBytes:0,        speed:0,       etaSec:0,   createdAt:'09:16:05', _baseSpeed:14e6, _wait:6, tracks:cloneTracks(vixTracks), expanded:false },
  { id:'t5', source:'VIXSRC',  name:'The Bear — S03E01',                 status:'COMPLETED',   progress:100,   totalBytes:1.3e9, downloadedBytes:1.3e9,   speed:0,       etaSec:0,   createdAt:'08:52:11', tracks:cloneTracks(vixTracks).map(t=>({...t,frac:1})), expanded:false },
  { id:'t6', source:'RAIPLAY', name:'Mare Fuori — S04E06',               status:'COMPLETED',   progress:100,   totalBytes:1.45e9, downloadedBytes:1.45e9, speed:0,       etaSec:0,   createdAt:'08:40:55', tracks:cloneTracks(raiTracks).map(t=>({...t,frac:1})), expanded:false },
  { id:'t7', source:'VIXSRC',  name:'Poor Things (2023)',                 status:'FAILED',      progress:62.4,  totalBytes:4.9e9, downloadedBytes:3.06e9,  speed:0,       etaSec:0,   createdAt:'08:31:20', error:'Segment 142 download failed: HTTP 403 from CDN after 3 retries. The source token may have expired — retry to re-extract.', tracks:cloneTracks(vixTracks), expanded:false },
  { id:'t8', source:'VIXSRC',  name:'Furiosa (2024)',                     status:'NOT_FOUND',   progress:0,     totalBytes:0,      downloadedBytes:0,       speed:0,       etaSec:0,   createdAt:'08:20:09', expanded:false },
  { id:'t9', source:'RAIPLAY', name:'Doc — Nelle tue mani — S02E11',     status:'CANCELLED',   progress:28.1,  totalBytes:1.5e9, downloadedBytes:0.42e9,  speed:0,       etaSec:0,   createdAt:'08:05:44', expanded:false },
];

const SEED_LIBRARY = [
  { id:'l1', dir:'Breaking Bad',              seasons:5,  episodes:62, status:'monitoring', source:'VixSrc',  lastChecked:'2026-06-20 08:30', _checking:false },
  { id:'l2', dir:'Mare Fuori',                seasons:4,  episodes:48, status:'paused',     source:'RaiPlay', lastChecked:'2026-06-19 22:10', _checking:false },
  { id:'l3', dir:'The Bear',                  seasons:3,  episodes:28, status:'none',       source:'VixSrc',  lastChecked:'-',               _checking:false },
  { id:'l4', dir:'Il Commissario Montalbano', seasons:14, episodes:37, status:'monitoring', source:'RaiPlay', lastChecked:'2026-06-20 06:00', _checking:false },
  { id:'l5', dir:"Doc - Nelle tue mani",      seasons:2,  episodes:24, status:'none',       source:'RaiPlay', lastChecked:'-',               _checking:false },
];

export function useDownloads() {
  const [tasks, setTasks]     = useState(() => SEED_TASKS.map(t => ({ ...t, tracks: t.tracks ? t.tracks.map(x=>({...x})) : undefined })));
  const [results, setResults] = useState(SEED_RESULTS);
  const [library, setLibrary] = useState(SEED_LIBRARY);
  const [diskFreeGB, setDiskFreeGB] = useState(482.31);
  const diskRef = useRef(482.31);

  useEffect(() => {
    const iv = setInterval(() => {
      setTasks(prev => {
        let disk = diskRef.current;
        const next = prev.map(o => {
          const x = { ...o, tracks: o.tracks ? o.tracks.map(t=>({...t})) : o.tracks };
          switch (x.status) {
            case 'QUEUED':
              x._wait = (x._wait ?? 4) - 1;
              if (x._wait <= 0) { x.status = 'EXTRACTING'; x._phase = 4; }
              break;
            case 'EXTRACTING':
              x._phase = (x._phase ?? 4) - 1;
              if (x._phase <= 0) { x.status = 'DOWNLOADING'; x.progress = 0; x.speed = x._baseSpeed || 10e6; }
              break;
            case 'DOWNLOADING': {
              const jit = 0.55 + Math.random() * 0.95;
              x.speed = Math.max(1.5e6, (x._baseSpeed || 10e6) * jit);
              x.progress = Math.min(100, x.progress + (x.speed / x.totalBytes) * 100);
              x.downloadedBytes = x.totalBytes * x.progress / 100;
              x.etaSec = x.speed > 0 ? (x.totalBytes - x.downloadedBytes) / x.speed : 0;
              disk = Math.max(0, disk - x.speed / 1e9);
              if (x.tracks) x.tracks.forEach((t, i) => {
                t._p = Math.min(100, x.progress * (i === 0 ? 1 : t.frac > 0.5 ? 1 : 0.6) + (i % 2 ? 4 : -3));
              });
              if (x.progress >= 100) { x.status = 'MERGING'; x._phase = 3; x.speed = 0; x.etaSec = 0; x.progress = 100; }
              break;
            }
            case 'MERGING':
              x._phase = (x._phase ?? 3) - 1;
              if (x._phase <= 0) { x.status = 'COPYING'; x._phase = 2; }
              break;
            case 'COPYING':
              x._phase = (x._phase ?? 2) - 1;
              if (x._phase <= 0) { x.status = 'COMPLETED'; x.downloadedBytes = x.totalBytes; }
              break;
            default: break;
          }
          return x;
        });
        diskRef.current = disk;
        setDiskFreeGB(disk);
        return next;
      });
    }, 500);
    return () => clearInterval(iv);
  }, []);

  const cancelTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'CANCELLED', speed: 0 } : t));
  const retryTask  = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'QUEUED', progress: 0, downloadedBytes: 0, speed: 0, _wait: 4 } : t));
  const toggleExpanded = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, expanded: !t.expanded } : t));
  const clearCompleted = () => setTasks(prev => prev.filter(t => !['COMPLETED','CANCELLED','NOT_FOUND'].includes(t.status)));

  const addTask = (item) => {
    const newTask = {
      id: 't' + Date.now(),
      source: item.source.toUpperCase().replace(' ', ''),
      name: item.title + (item.year ? ` (${item.year})` : ''),
      status: 'QUEUED',
      progress: 0,
      totalBytes: 2e9,
      downloadedBytes: 0,
      speed: 0,
      etaSec: 0,
      createdAt: new Date().toTimeString().slice(0,8),
      _baseSpeed: 12e6,
      _wait: 4,
      tracks: cloneTracks(item.source === 'RaiPlay' ? raiTracks : vixTracks),
      expanded: false,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleLibraryMonitor = (id) => setLibrary(prev => prev.map(s => {
    if (s.id !== id) return s;
    const next = s.status === 'none' ? 'monitoring' : s.status === 'monitoring' ? 'paused' : 'monitoring';
    return { ...s, status: next };
  }));
  const removeLibraryEntry = (id) => setLibrary(prev => prev.filter(s => s.id !== id));

  return { tasks, results, library, diskFreeGB, cancelTask, retryTask, toggleExpanded, clearCompleted, addTask, toggleLibraryMonitor, removeLibraryEntry };
}
