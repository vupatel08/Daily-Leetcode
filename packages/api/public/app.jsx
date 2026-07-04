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

const EDGE_COLORS = {
  CONSTRAINS: '#5b8cff',
  DEPENDS_ON: '#3ddc84',
  CONFLICTS_WITH: '#ff5c5c',
  SUPERSEDES: '#c77dff',
};
const PRIORITY_COLORS = { P0: '#ff5c5c', P1: '#ffb84d', P2: '#6b7688' };

function GraphTab() {
  const { data: graph, loading } = useApi('/api/graph');
  const [hover, setHover] = useState(null);

  if (loading) return <div className="loading">Building graph…</div>;
  if (!graph || graph.nodes.length === 0)
    return <div className="empty">No graph yet. Run <code>groundwork scan</code>.</div>;

  // Circular layout
  const size = 620;
  const cx = size / 2, cy = size / 2, r = size / 2 - 60;
  const n = graph.nodes.length;
  const pos = {};
  graph.nodes.forEach((node, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    pos[node.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), node };
  });

  const connected = new Set();
  if (hover) {
    graph.edges.forEach((e) => {
      if (e.source === hover || e.target === hover) { connected.add(e.source); connected.add(e.target); }
    });
  }

  return (
    <div>
      <div className="legend">
        {Object.entries(EDGE_COLORS).map(([type, color]) => (
          <span key={type} className="legend-item">
            <span className="swatch" style={{ background: color }}></span>{type}
          </span>
        ))}
      </div>
      <div className="graph-wrap">
        <svg viewBox={`0 0 ${size} ${size}`} className="graph-svg">
          {graph.edges.map((e, i) => {
            const s = pos[e.source], t = pos[e.target];
            if (!s || !t) return null;
            const dim = hover && e.source !== hover && e.target !== hover;
            return (
              <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={EDGE_COLORS[e.type] || '#555'} strokeWidth={dim ? 0.4 : 1.4}
                opacity={dim ? 0.12 : 0.7} />
            );
          })}
          {graph.nodes.map((node) => {
            const p = pos[node.id];
            const dim = hover && hover !== node.id && !connected.has(node.id);
            return (
              <g key={node.id} onMouseEnter={() => setHover(node.id)} onMouseLeave={() => setHover(null)}
                 style={{ cursor: 'pointer' }} opacity={dim ? 0.25 : 1}>
                <circle cx={p.x} cy={p.y} r={node.priority === 'P0' ? 8 : node.priority === 'P1' ? 6 : 4.5}
                  fill={PRIORITY_COLORS[node.priority]}
                  stroke={node.status === 'DISPUTED' ? '#c77dff' : '#0a0c12'} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
        {hover && pos[hover] && (
          <div className="graph-tip">
            <b>{pos[hover].node.title}</b>
            <span>{pos[hover].node.domain} · {pos[hover].node.priority} · {pos[hover].node.status}</span>
          </div>
        )}
      </div>
      <p className="muted graph-caption">
        {graph.nodes.length} decisions · {graph.edges.length} relationships. Hover a node to trace its connections.
      </p>
    </div>
  );
}

function TimelineTab() {
  const { data: timeline, loading } = useApi('/api/timeline');
  if (loading) return <div className="loading">Loading timeline…</div>;
  if (!timeline || timeline.length === 0)
    return <div className="empty">No decisions yet.</div>;
  return (
    <div className="timeline">
      {timeline.map((t) => (
        <div className="tl-item" key={t.id}>
          <div className={'tl-dot ' + t.priority}></div>
          <div className="tl-body">
            <div className="tl-title">{t.title}</div>
            <div className="tl-meta">
              <span className={'pill ' + t.priority}>{t.priority}</span>
              <span className="tag">{t.domain}</span>
              <span className={'status ' + t.status}>{t.status}</span>
              <span>{new Date(t.madeAt).toLocaleString()}</span>
              <span>src: {t.source}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const VALID_TABS = ['decisions', 'graph', 'timeline', 'conflicts'];
function initialTab() {
  const q = new URLSearchParams(window.location.search).get('tab');
  return VALID_TABS.includes(q) ? q : 'decisions';
}

function App() {
  const [tab, setTabState] = useState(initialTab);
  const setTab = (t) => {
    setTabState(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.replaceState({}, '', url);
  };
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
        <button className={'tab ' + (tab === 'graph' ? 'active' : '')} onClick={() => setTab('graph')}>
          Graph
        </button>
        <button className={'tab ' + (tab === 'timeline' ? 'active' : '')} onClick={() => setTab('timeline')}>
          Timeline
        </button>
        <button className={'tab ' + (tab === 'conflicts' ? 'active' : '')} onClick={() => setTab('conflicts')}>
          Conflicts {conflictCount > 0 ? '(' + conflictCount + ')' : ''}
        </button>
      </div>

      {tab === 'decisions' && <DecisionsTab key={nonce} />}
      {tab === 'graph' && <GraphTab key={nonce} />}
      {tab === 'timeline' && <TimelineTab key={nonce} />}
      {tab === 'conflicts' && <ConflictsTab key={nonce} />}

      <footer>Groundwork · Layer 3 decision graph · groundwork.dev</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
