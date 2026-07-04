const { useState, useEffect, useCallback } = React;

const API = '';

function useApi(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(() => {
    setLoading(true);
    fetch(API + path)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [path]);
  useEffect(refetch, deps);
  return { data, loading, refetch };
}

function Stat({ num, label, cls }) {
  return (
    <div className={'stat ' + (cls || '')}>
      <div className="num">{num}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function DecisionCard({ d }) {
  return (
    <div className="decision">
      <span className={'pill ' + d.priority}>{d.priority}</span>
      <div className="body">
        <div className="title">{d.title}</div>
        <div className="meta">
          <span className="tag">{d.domain}</span>
          <span className={'status ' + d.status}>{d.status}</span>
          <span>conf {Math.round(d.confidence * 100)}%</span>
          <span>src: {d.source}</span>
          {d.affectedModules && d.affectedModules.length > 0 && (
            <span>modules: {d.affectedModules.join(', ')}</span>
          )}
        </div>
        {d.rationale && <div className="rationale">{d.rationale}</div>}
      </div>
    </div>
  );
}

function DecisionsTab() {
  const { data: decisions, loading } = useApi('/api/decisions');
  const [priority, setPriority] = useState('');
  const [domain, setDomain] = useState('');
  const [q, setQ] = useState('');

  if (loading) return <div className="loading">Loading decisions…</div>;
  if (!decisions || decisions.length === 0)
    return <div className="empty">No decisions yet. Run <code>groundwork scan</code>.</div>;

  const domains = Array.from(new Set(decisions.map((d) => d.domain))).sort();
  const filtered = decisions.filter(
    (d) =>
      (!priority || d.priority === priority) &&
      (!domain || d.domain === domain) &&
      (!q || d.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <div className="filters">
        <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option>P0</option><option>P1</option><option>P2</option>
        </select>
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">All domains</option>
          {domains.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      {filtered.map((d) => <DecisionCard key={d.id} d={d} />)}
    </div>
  );
}

function ConflictsTab() {
  const { data: conflicts, loading } = useApi('/api/conflicts');
  if (loading) return <div className="loading">Loading conflicts…</div>;
  if (!conflicts || conflicts.length === 0)
    return <div className="empty">No conflicts detected. The graph is coherent. ✅</div>;
  return (
    <div>
      {conflicts.map((c) => (
        <div className="conflict" key={c.id}>
          <div className="desc">⚠️ {c.description}</div>
          <div className="when">detected {new Date(c.detectedAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [tab, setTab] = useState('decisions');
  const { data: stats, refetch: refetchStats } = useApi('/api/stats');
  const { data: conflicts } = useApi('/api/conflicts');
  const [scanning, setScanning] = useState(false);
  const [nonce, setNonce] = useState(0);

  const rescan = () => {
    setScanning(true);
    fetch(API + '/api/scan', { method: 'POST' })
      .then((r) => r.json())
      .then(() => { setScanning(false); refetchStats(); setNonce((n) => n + 1); })
      .catch(() => setScanning(false));
  };

  const byPriority = (stats && stats.byPriority) || {};
  const conflictCount = (conflicts && conflicts.length) || 0;

  return (
    <div className="app">
      <header className="masthead">
        <div className="logo">
          <div className="mark">G</div>
          <div>
            <h1>Groundwork</h1>
            <p>The architectural decisions your AI won't forget</p>
          </div>
        </div>
        <button className="rescan" onClick={rescan} disabled={scanning}>
          {scanning ? 'Scanning…' : 'Re-scan project'}
        </button>
      </header>

      <div className="stats">
        <Stat num={(stats && stats.total) || 0} label="Total decisions" />
        <Stat num={byPriority.P0 || 0} label="P0 · Critical" cls="p0" />
        <Stat num={byPriority.P1 || 0} label="P1 · Important" cls="p1" />
        <Stat num={byPriority.P2 || 0} label="P2 · Guidance" cls="p2" />
        <Stat num={conflictCount} label="Open conflicts" cls="conf" />
      </div>

      <div className="tabs">
        <button className={'tab ' + (tab === 'decisions' ? 'active' : '')} onClick={() => setTab('decisions')}>
          Decisions
        </button>
        <button className={'tab ' + (tab === 'conflicts' ? 'active' : '')} onClick={() => setTab('conflicts')}>
          Conflicts {conflictCount > 0 ? '(' + conflictCount + ')' : ''}
        </button>
      </div>

      {tab === 'decisions' ? <DecisionsTab key={nonce} /> : <ConflictsTab key={nonce} />}

      <footer>Groundwork · Layer 3 decision graph · groundwork.dev</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
