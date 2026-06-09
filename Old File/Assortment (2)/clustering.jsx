// clustering.jsx — Clustering module
// Dashboard (active clusters + run history) → Create wizard (Input → Attributes → Finalize)

const cl_breadcrumb = (path) => (
  <div style={{ display:'flex', alignItems:'center', gap: 10, fontFamily:'Manrope', fontSize: 11.5, fontWeight: 600, color:'#60697D', marginBottom: 6 }}>
    {path.map((p, i, arr) => (
      <React.Fragment key={i}>
        <span style={{ color: i === arr.length-1 ? '#1F2B4D' : '#60697D' }}>{p}</span>
        {i < arr.length-1 && <IconChevronRight size={11}/>}
      </React.Fragment>
    ))}
  </div>
);

// Mini-map of stores colored by cluster — simple region grid layout
const ClusterMiniMap = ({ stores, clusterColors, height=120 }) => {
  // simple geographic-ish projection using state -> grid
  const STATE_POS = {
    GA:[8,4], FL:[8,5], TN:[7,4], AL:[7,5], NC:[8,3], VA:[8,2], TX:[5,5], AZ:[3,5], NV:[2,5], CO:[4,4], UT:[3,4], IL:[6,3], IN:[7,3], OH:[7,2],
  };
  const w = 240, h = height, cols = 10, rows = 6;
  const dotR = 6;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      <rect width={w} height={h} fill="#F8F9FB" rx="6"/>
      {stores.map((s, i) => {
        const pos = STATE_POS[s.state] || [Math.random()*cols, Math.random()*rows];
        const cx = (pos[0]+0.5)*(w/cols) + (i%3 - 1)*4;
        const cy = (pos[1]+0.5)*(h/rows) + ((i%2)-0.5)*4;
        const color = clusterColors[s.cluster] || '#60697D';
        return <circle key={s.id} cx={cx} cy={cy} r={dotR} fill={color} stroke="#fff" strokeWidth="1.5"/>;
      })}
    </svg>
  );
};

// =================================================================
// DASHBOARD
// =================================================================

const ClusteringDashboard = ({ onNew, onOpenCluster, onOpenRun }) => {
  const colors = Object.fromEntries(ACTIVE_CLUSTERS.map(c => [c.id, c.color]));
  const totalStores = ACTIVE_CLUSTERS.reduce((s,c)=>s+c.stores,0);
  return (
    <div style={{ padding: 20 }}>
      {cl_breadcrumb(['Assortment Intelligence', 'Clustering'])}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18, gap: 16, flexWrap:'wrap' }}>
        <div>
          <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>Clustering</h2>
          <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D', marginTop: 4 }}>
            Group stores into peer cohorts. Assortment recommendations and Hindsight benchmarks read from the live cluster set.
          </div>
        </div>
        <div style={{ display:'flex', gap: 8 }}>
          <Button variant="secondary" leftIcon={<IconRefresh size={14}/>}>Re-run latest</Button>
          <Button variant="primary" leftIcon={<IconPlus size={14}/>} onClick={onNew}>New cluster run</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label:'Active clusters', value: ACTIVE_CLUSTERS.length, sub:'k=5 · live' },
          { label:'Stores assigned', value: totalStores, sub:'70 / 70 covered' },
          { label:'Avg cohesion', value: '0.80', sub:'good · >0.75 healthy' },
          { label:'Pending re-run', value: 'Apr 12', sub:'next quarterly cycle' },
        ].map(k => (
          <Card key={k.label} padding={14}>
            <div style={{ fontFamily:'Manrope', fontSize: 11, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</div>
            <div className="ia-kpi-value" style={{ marginTop: 6 }}>{k.value}</div>
            <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500, marginTop: 2 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Active clusters */}
      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Active cluster set · CR-018</div>
            <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>k-means · 4 attributes · run Jan 12, 2026 by D. Rivera</div>
          </div>
          <ClusterMiniMap stores={NETWORK_STORES} clusterColors={colors} height={86}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 70px 90px 90px 1.4fr 1fr 90px', padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                      fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>
          <div>Cluster</div>
          <div style={{textAlign:'right'}}>Stores</div>
          <div style={{textAlign:'right'}}>Pro avg</div>
          <div style={{textAlign:'right'}}>Cohesion</div>
          <div>Dominant categories</div>
          <div>SKU set</div>
          <div></div>
        </div>
        {ACTIVE_CLUSTERS.map((c, i) => (
          <div key={c.id} onClick={() => onOpenCluster(c.id)}
            style={{ display:'grid', gridTemplateColumns:'1.5fr 70px 90px 90px 1.4fr 1fr 90px', padding:'14px', alignItems:'center',
                     borderBottom: i < ACTIVE_CLUSTERS.length-1 ? '1px solid #F5F6FA' : 0, cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.background='#F8F9FB'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 9999, background: c.color, flex:'0 0 auto' }}/>
              <div>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>{c.name}</div>
                <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>{c.id}</div>
              </div>
            </div>
            <div style={{ textAlign:'right', fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C', fontFeatureSettings:'"tnum"' }}>{c.stores}</div>
            <div style={{ textAlign:'right', fontFamily:'Manrope', fontWeight: 600, fontSize: 12, color:'#0D152C', fontFeatureSettings:'"tnum"' }}>{c.proAvg}%</div>
            <div style={{ textAlign:'right', fontFamily:'Manrope', fontWeight: 700, fontSize: 12, color: c.cohesion >= 0.8 ? '#3BB273' : '#E1BC29', fontFeatureSettings:'"tnum"' }}>{c.cohesion.toFixed(2)}</div>
            <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
              {c.dominantCats.map(d => <Pill key={d} variant="neutral" size="sm" dot={false}>{d}</Pill>)}
            </div>
            <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 600, fontFeatureSettings:'"tnum"' }}>{c.skus.toLocaleString()} SKUs</div>
            <div style={{ textAlign:'right' }}>
              <Button variant="ghost" size="xs" rightIcon={<IconArrowRight size={11}/>}>Open</Button>
            </div>
          </div>
        ))}
      </Card>

      {/* Run history */}
      <Card padding={0}>
        <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Run history</div>
            <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>Past clustering runs · diff against live to evaluate change</div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<IconDownload size={12}/>}>Export</Button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2.2fr 1fr 100px 90px 1.1fr 90px 100px', padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                      fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>
          <div>Run</div><div>Method</div><div style={{textAlign:'right'}}>Attributes</div><div style={{textAlign:'right'}}>Cohesion</div><div>Author</div><div style={{textAlign:'right'}}>Status</div><div></div>
        </div>
        {CLUSTER_RUNS.map((r, i) => (
          <div key={r.id} onClick={() => onOpenRun(r.id)}
            style={{ display:'grid', gridTemplateColumns:'2.2fr 1fr 100px 90px 1.1fr 90px 100px', padding:'12px 14px', alignItems:'center',
                     borderBottom: i < CLUSTER_RUNS.length-1 ? '1px solid #F5F6FA' : 0, cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.background='#F8F9FB'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>{r.name}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>{r.id} · {r.date}</div>
            </div>
            <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 600 }}>{r.method}</div>
            <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontFeatureSettings:'"tnum"' }}>{r.attrs}</div>
            <div style={{ textAlign:'right', fontFamily:'Manrope', fontWeight: 700, fontSize: 12, color: r.cohesion >= 0.75 ? '#3BB273' : '#E1BC29', fontFeatureSettings:'"tnum"' }}>{r.cohesion.toFixed(2)}</div>
            <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 600 }}>{r.author}</div>
            <div style={{ textAlign:'right' }}>
              {r.status === 'live'
                ? <Pill variant="approved" size="sm">Live</Pill>
                : <Pill variant="neutral" size="sm" dot={false}>Archived</Pill>}
            </div>
            <div style={{ textAlign:'right' }}>
              <Button variant="ghost" size="xs" rightIcon={<IconArrowRight size={11}/>}>Open</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// =================================================================
// CREATE WIZARD — STEP 1: INPUT (scope + method)
// =================================================================

const StepRail = ({ step, steps, onJump }) => (
  <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 18, fontFamily:'Manrope' }}>
    {steps.map((s, i) => {
      const active = i === step;
      const done = i < step;
      const clickable = i <= step;
      return (
        <React.Fragment key={s}>
          <button onClick={() => clickable && onJump(i)} disabled={!clickable} style={{
            display:'inline-flex', alignItems:'center', gap: 8, background:'transparent', border:0, padding:0,
            cursor: clickable ? 'pointer' : 'not-allowed',
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: 9999,
              background: active ? '#4259EE' : done ? '#3BB273' : '#ECEEFD',
              color: active || done ? '#fff' : '#4259EE',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontWeight: 800, fontSize: 12, boxShadow: active ? '0 0 0 4px #ECEEFD' : 'none',
              transition:'background 140ms',
            }}>
              {done ? <IconCheck size={13}/> : i+1}
            </span>
            <span style={{ fontWeight: active ? 700 : 600, fontSize: 13, color: active ? '#0D152C' : done ? '#0D152C' : '#60697D' }}>{s}</span>
          </button>
          {i < steps.length-1 && <div style={{ flex:'0 0 32px', height: 1, background:'#ECEDF3' }}/>}
        </React.Fragment>
      );
    })}
  </div>
);

const RadioCard = ({ checked, onClick, title, desc, badge, disabled }) => (
  <div onClick={!disabled ? onClick : undefined} style={{
    border: checked ? '2px solid #4259EE' : '1.5px solid #ECEDF3',
    background: checked ? '#F6F7FE' : disabled ? '#F8F9FB' : '#fff',
    borderRadius: 10, padding: 14, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition:'border-color 140ms, background 140ms', position:'relative',
  }}>
    <div style={{ display:'flex', alignItems:'flex-start', gap: 10 }}>
      <span style={{
        width: 16, height: 16, borderRadius: 9999, marginTop: 2,
        border: `2px solid ${checked ? '#4259EE' : '#B4BAC7'}`,
        background:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto',
      }}>
        {checked && <span style={{ width: 8, height: 8, borderRadius: 9999, background:'#4259EE' }}/>}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
          <span style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13.5, color:'#0D152C' }}>{title}</span>
          {badge && <Pill variant="info" size="sm" dot={false}>{badge}</Pill>}
        </div>
        <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 500, marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  </div>
);

const ClusterCreate = ({ onCancel, onComplete }) => {
  const [step, setStep] = React.useState(0);
  const [scope, setScope] = React.useState('network');
  const [method, setMethod] = React.useState('kmeans');
  const [k, setK] = React.useState(5);
  const [name, setName] = React.useState('Network 5-cluster (k-means)');
  const [attrs, setAttrs] = React.useState(['pro_split','climate','sales_velocity','cat_mix']);
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const toast = useToast();

  const STEPS = ['Input','Attributes','Finalize'];

  const toggleAttr = (id) => setAttrs(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  // Preview clusters that respond to attributes/k — simple deterministic regrouping for the prototype
  const previewClusters = React.useMemo(() => {
    const base = ACTIVE_CLUSTERS.slice(0, k);
    return base.map((c, i) => ({
      ...c,
      stores: Math.max(6, Math.round(c.stores + (attrs.length - 4) * 1.5 + (i % 2 ? -1 : 1))),
      cohesion: Math.max(0.55, Math.min(0.92, 0.62 + attrs.length * 0.05 + (method === 'hierarchical' ? -0.03 : 0))),
    }));
  }, [k, attrs, method]);

  const runJob = () => {
    setRunning(true);
    setProgress(0);
    let p = 0;
    const tick = () => {
      p += 6 + Math.random()*10;
      if (p >= 100) { p = 100; setProgress(p); setRunning(false); setDone(true); return; }
      setProgress(p);
      setTimeout(tick, 180);
    };
    setTimeout(tick, 200);
  };

  const next = () => {
    if (step === 0) {
      if (!name.trim()) { toast({kind:'error', message:'Name your run before continuing'}); return; }
      setStep(1);
    } else if (step === 1) {
      if (attrs.length === 0) { toast({kind:'error', message:'Select at least one attribute'}); return; }
      setStep(2);
    }
  };
  const back = () => setStep(s => Math.max(0, s-1));

  return (
    <div style={{ padding: 20, maxWidth: 1280 }}>
      {cl_breadcrumb(['Assortment Intelligence', 'Clustering', 'New cluster run'])}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18, gap: 16 }}>
        <div>
          <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>New cluster run</h2>
          <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D', marginTop: 4 }}>
            Group stores into peer cohorts based on the attributes you choose. Preview results before publishing as the live set.
          </div>
        </div>
      </div>

      <StepRail step={step} steps={STEPS} onJump={setStep}/>

      {/* STEP 0 — INPUT */}
      {step === 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
            <Card padding={16}>
              <SectionHeader title="Run details" subtitle="A clear name helps your team find this run later"/>
              <label style={{ display:'block', fontFamily:'Manrope', fontSize: 11, fontWeight: 700, color:'#60697D', marginBottom: 6, textTransform:'uppercase', letterSpacing:'.06em' }}>Name</label>
              <Input value={name} onChange={e=>setName(e.target.value)} style={{ width:'100%' }}/>
              <div style={{ display:'flex', gap: 12, marginTop: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', fontFamily:'Manrope', fontSize: 11, fontWeight: 700, color:'#60697D', marginBottom: 6, textTransform:'uppercase', letterSpacing:'.06em' }}>Notes (optional)</label>
                  <Input placeholder="e.g. Quarterly refresh — same attributes as CR-018" style={{ width:'100%' }}/>
                </div>
              </div>
            </Card>

            <Card padding={16}>
              <SectionHeader title="Scope" subtitle="Which stores should the algorithm consider?"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
                <RadioCard checked={scope==='network'} onClick={()=>setScope('network')}
                  title="Entire network" desc="All 70 stores. Default for quarterly refresh."/>
                <RadioCard checked={scope==='region'} onClick={()=>setScope('region')}
                  title="Single region" desc="Cluster within Southeast / Midwest / West only."/>
                <RadioCard checked={scope==='format'} onClick={()=>setScope('format')}
                  title="Format-only" desc="Compare Standard vs Large vs Compact in isolation."/>
                <RadioCard checked={scope==='custom'} onClick={()=>setScope('custom')}
                  title="Custom store list" desc="Hand-picked subset (e.g. pilot stores)."/>
              </div>
              {scope === 'custom' && (
                <div style={{ marginTop: 12, padding: 10, background:'#F8F9FB', borderRadius: 8, border:'1px dashed #D9DDE7',
                              fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 500 }}>
                  <span style={{ color:'#4259EE', fontWeight: 700 }}>0 stores selected.</span> Click to upload CSV or pick from list.
                </div>
              )}
            </Card>

            <Card padding={16}>
              <SectionHeader title="Method"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
                <RadioCard checked={method==='kmeans'} onClick={()=>setMethod('kmeans')} badge="Recommended"
                  title="k-means" desc="Hard partitioning into k clusters. Fast, interpretable, great when k is known."/>
                <RadioCard checked={method==='hierarchical'} onClick={()=>setMethod('hierarchical')}
                  title="Hierarchical (Ward)" desc="Tree-based grouping. Useful when you want to inspect a dendrogram and decide k afterwards."/>
                <RadioCard checked={method==='dbscan'} onClick={()=>setMethod('dbscan')}
                  title="DBSCAN" desc="Density-based — finds outlier stores. Good for spotting unique markets."/>
                <RadioCard disabled checked={method==='gmm'} onClick={()=>setMethod('gmm')}
                  title="Gaussian mixture" desc="Soft assignment with probabilities. Coming in Stage 2."/>
              </div>
              {method === 'kmeans' && (
                <div style={{ marginTop: 14, padding: 12, background:'#F6F7FE', borderRadius: 8, display:'flex', alignItems:'center', gap: 12 }}>
                  <span style={{ fontFamily:'Manrope', fontSize: 12, fontWeight: 700, color:'#0D152C' }}>k =</span>
                  <input type="range" min={3} max={9} value={k} onChange={e=>setK(parseInt(e.target.value))} style={{ flex: 1, accentColor:'#4259EE' }}/>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize: 14, fontWeight: 700, color:'#4259EE', width: 24, textAlign:'center' }}>{k}</span>
                  <span style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>3 clusters too coarse · 9 too thin</span>
                </div>
              )}
            </Card>
          </div>

          <Card padding={16} style={{ alignSelf:'start', position:'sticky', top: 76 }}>
            <SectionHeader title="What happens next" icon={<IconInfo size={16}/>}/>
            <ol style={{ margin: 0, paddingLeft: 18, fontFamily:'Manrope', fontSize: 12.5, color:'#1F2B4D', lineHeight: 1.7 }}>
              <li>Pick the attributes the algorithm uses to compare stores</li>
              <li>Preview cluster shapes and per-cluster cohesion</li>
              <li>Promote to live set — Recommendations & Hindsight read it next cycle</li>
            </ol>
            <Divider style={{ margin:'14px 0' }}/>
            <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>
              <strong style={{ color:'#0D152C' }}>Tip · </strong>
              Quarterly cadence is the norm. Mid-quarter re-runs require Category Manager approval.
            </div>
            <div style={{ marginTop: 14, padding: 10, background:'#F8F9FB', borderRadius: 8 }}>
              <div style={{ fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 6 }}>Last live run</div>
              <div style={{ fontFamily:'Manrope', fontSize: 12.5, fontWeight: 700, color:'#0D152C' }}>CR-018 · k-means · k=5</div>
              <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>Cohesion 0.80 · Jan 12, 2026</div>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 1 — ATTRIBUTES */}
      {step === 1 && <ClusterAttributes attrs={attrs} toggleAttr={toggleAttr} previewClusters={previewClusters} method={method} k={k}/>}

      {/* STEP 2 — FINALIZE */}
      {step === 2 && <ClusterFinalize previewClusters={previewClusters} attrs={attrs} method={method} k={k} name={name} scope={scope}
        running={running} progress={progress} done={done} onRun={runJob}/>}

      {/* Footer nav */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginTop: 18, paddingTop: 16, borderTop:'1px solid #ECEDF3',
      }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <div style={{ display:'flex', gap: 8 }}>
          {step > 0 && <Button variant="secondary" onClick={back} leftIcon={<IconChevronLeft size={14}/>}>Back</Button>}
          {step < 2 && <Button variant="primary" onClick={next} rightIcon={<IconArrowRight size={14}/>}>Continue</Button>}
          {step === 2 && !done && !running && <Button variant="primary" onClick={runJob} leftIcon={<IconBolt size={14}/>}>Run clustering</Button>}
          {step === 2 && done && <Button variant="success" leftIcon={<IconCheck size={14}/>} onClick={() => { toast({kind:'success', message:'Cluster set CR-019 promoted to live'}); onComplete(); }}>Promote to live</Button>}
        </div>
      </div>
    </div>
  );
};

// =================================================================
// STEP 1 — ATTRIBUTES (input step)
// =================================================================

const ClusterAttributes = ({ attrs, toggleAttr, previewClusters, method, k }) => {
  const groups = [...new Set(CLUSTER_ATTRIBUTES.map(a => a.group))];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 16 }}>
      <Card padding={16}>
        <SectionHeader title="Choose attributes" subtitle="The algorithm compares stores along these dimensions. 3–5 typically works best."
          right={<Pill variant={attrs.length >= 3 && attrs.length <= 6 ? 'approved' : 'pending'} size="sm">{attrs.length} selected</Pill>}/>
        <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
          {groups.map(g => (
            <div key={g}>
              <div style={{ fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 8 }}>{g}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
                {CLUSTER_ATTRIBUTES.filter(a => a.group === g).map(a => {
                  const checked = attrs.includes(a.id);
                  return (
                    <div key={a.id} onClick={()=>toggleAttr(a.id)} style={{
                      border: checked ? '2px solid #4259EE' : '1.5px solid #ECEDF3',
                      background: checked ? '#F6F7FE' : '#fff',
                      borderRadius: 8, padding: 10, cursor:'pointer',
                      display:'flex', alignItems:'flex-start', gap: 8,
                      transition:'border-color 140ms, background 140ms',
                    }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 4, marginTop: 1,
                        border: `2px solid ${checked ? '#4259EE' : '#B4BAC7'}`,
                        background: checked ? '#4259EE' : '#fff',
                        display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto',
                      }}>
                        {checked && <IconCheck size={10} style={{color:'#fff'}}/>}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                          <span style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 12.5, color:'#0D152C' }}>{a.name}</span>
                          {a.recommended && <span style={{ fontFamily:'Manrope', fontSize: 9.5, fontWeight: 700, color:'#3BB273', textTransform:'uppercase', letterSpacing:'.06em' }}>★ Rec</span>}
                        </div>
                        <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500, marginTop: 2 }}>{a.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Live preview */}
      <Card padding={16} style={{ alignSelf:'start', position:'sticky', top: 76 }}>
        <SectionHeader title="Live preview" subtitle="Updates as you change attributes" icon={<IconBolt size={16}/>}/>
        <div style={{ marginBottom: 12, padding: 8, background:'#F6F7FE', borderRadius: 6, fontFamily:'Manrope', fontSize: 11, color:'#1F2B4D', fontWeight: 600 }}>
          {method === 'kmeans' ? `k-means · k=${k}` : method} · {attrs.length} attribute{attrs.length === 1 ? '' : 's'}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
          {previewClusters.map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap: 10, padding: 8, borderRadius: 6, background:'#F8F9FB' }}>
              <span style={{ width: 10, height: 10, borderRadius: 9999, background: c.color, flex:'0 0 auto' }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 12, color:'#0D152C', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                <div style={{ fontFamily:'Manrope', fontSize: 10.5, color:'#60697D', fontWeight: 500 }}>{c.stores} stores · cohesion {c.cohesion.toFixed(2)}</div>
              </div>
              <div style={{ height: 4, width: 60, background:'#ECEDF3', borderRadius: 9999, overflow:'hidden' }}>
                <div style={{ width: `${c.cohesion * 100}%`, height:'100%', background: c.cohesion >= 0.75 ? '#3BB273' : '#E1BC29' }}/>
              </div>
            </div>
          ))}
        </div>
        <Divider style={{ margin:'12px 0' }}/>
        <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500, lineHeight: 1.6 }}>
          <strong style={{ color:'#0D152C' }}>Cohesion</strong> measures how tightly stores within each cluster resemble each other. Above 0.75 is healthy.
        </div>
      </Card>
    </div>
  );
};

// =================================================================
// STEP 2 — FINALIZE (run + review + promote)
// =================================================================

const ClusterFinalize = ({ previewClusters, attrs, method, k, name, scope, running, progress, done, onRun }) => {
  const colors = Object.fromEntries(previewClusters.map(c => [c.id, c.color]));

  return (
    <div style={{ display:'grid', gridTemplateColumns: done ? '1fr' : '1.4fr 1fr', gap: 16 }}>
      {/* Job & summary */}
      <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
        {!done && (
          <Card padding={16}>
            <SectionHeader title="Run summary" subtitle="Confirm configuration before kicking off the job"/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
              {[
                { label:'Name', value: name },
                { label:'Scope', value: { network:'Entire network · 70 stores', region:'Single region', format:'Format-only', custom:'Custom store list' }[scope] },
                { label:'Method', value: method === 'kmeans' ? `k-means · k=${k}` : method === 'hierarchical' ? 'Hierarchical (Ward)' : 'DBSCAN' },
                { label:'Attributes', value: `${attrs.length} selected` },
              ].map(r => (
                <div key={r.label} style={{ padding: 10, background:'#F8F9FB', borderRadius: 6 }}>
                  <div style={{ fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontFamily:'Manrope', fontSize: 13, fontWeight: 700, color:'#0D152C' }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: 12, background:'#FFFAD6', borderRadius: 8, display:'flex', gap: 10, alignItems:'flex-start' }}>
              <IconWarning size={16} style={{color:'#8A6E00', flex:'0 0 auto', marginTop: 2}}/>
              <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#1F2B4D', fontWeight: 500, lineHeight: 1.5 }}>
                Running this will produce a <strong>preview</strong> cluster set. It will not affect the live recommendations until you click <strong>Promote to live</strong>.
              </div>
            </div>
          </Card>
        )}

        {(running || done) && (
          <Card padding={16}>
            <SectionHeader title={done ? 'Run complete' : 'Running…'}
              subtitle={done ? 'Review the cluster set below, then promote to live' : 'Computing distance matrix · 70 stores'}
              right={done && <Pill variant="approved">Done</Pill>}/>
            <div style={{ height: 6, background:'#ECEDF3', borderRadius: 9999, overflow:'hidden' }}>
              <div style={{ height:'100%', width: `${progress}%`, background: done ? '#3BB273' : '#4259EE', transition:'width 200ms' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 8, fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 600 }}>
              <span>{progress < 30 ? 'Standardising features…' : progress < 60 ? 'Computing centroids…' : progress < 90 ? 'Assigning stores…' : 'Computing cohesion…'}</span>
              <span style={{ fontFeatureSettings:'"tnum"' }}>{Math.round(progress)}%</span>
            </div>
          </Card>
        )}

        {done && (
          <Card padding={0}>
            <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Preview · CR-019</div>
                <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>{previewClusters.length} clusters · cohesion {(previewClusters.reduce((s,c)=>s+c.cohesion,0)/previewClusters.length).toFixed(2)} · {attrs.length} attrs</div>
              </div>
              <ClusterMiniMap stores={NETWORK_STORES} clusterColors={colors} height={86}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1.4fr 70px 90px 90px 1.4fr 1fr 100px', padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                          fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>
              <div>Cluster</div><div style={{textAlign:'right'}}>Stores</div><div style={{textAlign:'right'}}>Pro avg</div><div style={{textAlign:'right'}}>Cohesion</div><div>Dominant categories</div><div>Δ vs live</div><div></div>
            </div>
            {previewClusters.map((c, i) => {
              const live = ACTIVE_CLUSTERS.find(x => x.id === c.id);
              const delta = live ? c.stores - live.stores : 0;
              return (
                <div key={c.id} style={{ display:'grid', gridTemplateColumns:'1.4fr 70px 90px 90px 1.4fr 1fr 100px', padding:'14px', alignItems:'center',
                                          borderBottom: i < previewClusters.length-1 ? '1px solid #F5F6FA' : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 9999, background: c.color, flex:'0 0 auto' }}/>
                    <div>
                      <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>{c.name}</div>
                      <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>{c.id}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C', fontFeatureSettings:'"tnum"' }}>{c.stores}</div>
                  <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 600, fontFeatureSettings:'"tnum"' }}>{c.proAvg}%</div>
                  <div style={{ textAlign:'right', fontFamily:'Manrope', fontWeight: 700, fontSize: 12, color: c.cohesion >= 0.75 ? '#3BB273' : '#E1BC29', fontFeatureSettings:'"tnum"' }}>{c.cohesion.toFixed(2)}</div>
                  <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
                    {c.dominantCats.map(d => <Pill key={d} variant="neutral" size="sm" dot={false}>{d}</Pill>)}
                  </div>
                  <div style={{ fontFamily:'Manrope', fontSize: 12, fontWeight: 700, color: delta === 0 ? '#60697D' : delta > 0 ? '#3BB273' : '#E74C67', fontFeatureSettings:'"tnum"' }}>
                    {delta === 0 ? '· no change' : delta > 0 ? `+${delta} stores` : `${delta} stores`}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <Button variant="ghost" size="xs">Members</Button>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* Right rail summary (only before run) */}
      {!done && (
        <Card padding={16} style={{ alignSelf:'start', position:'sticky', top: 76 }}>
          <SectionHeader title="Configuration"/>
          <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
            {[
              { label:'Method', v: method === 'kmeans' ? `k-means · k=${k}` : method === 'hierarchical' ? 'Hierarchical (Ward)' : 'DBSCAN' },
              { label:'Scope', v: scope === 'network' ? '70 stores' : scope },
              { label:'Attributes', v: `${attrs.length} selected` },
              { label:'Estimated runtime', v:'~12 seconds' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', fontFamily:'Manrope', fontSize: 12 }}>
                <span style={{ color:'#60697D', fontWeight: 600 }}>{r.label}</span>
                <span style={{ color:'#0D152C', fontWeight: 700 }}>{r.v}</span>
              </div>
            ))}
          </div>
          <Divider style={{ margin:'14px 0' }}/>
          <div style={{ fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 6 }}>Selected attributes</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap: 4 }}>
            {attrs.map(id => {
              const a = CLUSTER_ATTRIBUTES.find(x=>x.id===id);
              return <Pill key={id} variant="info" size="sm" dot={false}>{a?.name}</Pill>;
            })}
            {attrs.length === 0 && <span style={{ fontFamily:'Manrope', fontSize: 11, color:'#E74C67', fontWeight: 600 }}>None — go back and pick at least one</span>}
          </div>
        </Card>
      )}
    </div>
  );
};

// =================================================================
// CLUSTER DETAIL — readonly view of a single live cluster
// =================================================================

const ClusterDetail = ({ clusterId, onBack }) => {
  const c = ACTIVE_CLUSTERS.find(x => x.id === clusterId);
  if (!c) return null;
  const members = NETWORK_STORES.filter(s => s.cluster === clusterId);
  const others = NETWORK_STORES.filter(s => s.cluster !== clusterId);
  return (
    <div style={{ padding: 20 }}>
      {cl_breadcrumb(['Assortment Intelligence', 'Clustering', c.name])}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18, gap: 16 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 9999, background: c.color }}/>
            <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>{c.name}</h2>
            <Pill variant="approved" size="sm">Live</Pill>
          </div>
          <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D' }}>
            {c.stores} stores · pro avg {c.proAvg}% · cohesion {c.cohesion.toFixed(2)} · {c.skus.toLocaleString()} SKUs in cluster assortment
          </div>
        </div>
        <Button variant="secondary" leftIcon={<IconChevronLeft size={14}/>} onClick={onBack}>Back to Clustering</Button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3' }}>
            <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Member stores</div>
            <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>{members.length} stores assigned</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'70px 1.6fr 100px 90px 90px 70px', padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                        fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>
            <div>Store</div><div>Name</div><div>Region</div><div style={{textAlign:'right'}}>Pro %</div><div style={{textAlign:'right'}}>Sqft</div><div style={{textAlign:'right'}}>Tier</div>
          </div>
          {members.map((s, i) => (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'70px 1.6fr 100px 90px 90px 70px', padding:'12px 14px', alignItems:'center',
                                      borderBottom: i < members.length-1 ? '1px solid #F5F6FA' : 0 }}>
              <div style={{ fontFamily:'JetBrains Mono', fontSize: 11.5, color:'#4259EE', fontWeight: 700 }}>{s.id}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 13, color:'#0D152C', fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 600 }}>{s.region}</div>
              <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 600, fontFeatureSettings:'"tnum"' }}>{s.proSplit}%</div>
              <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 600, fontFeatureSettings:'"tnum"' }}>{(s.sqft/1000).toFixed(0)}k</div>
              <div style={{ textAlign:'right' }}><Pill variant={s.tier === 'A' ? 'approved' : s.tier === 'B' ? 'info' : 'neutral'} size="sm" dot={false}>{s.tier}</Pill></div>
            </div>
          ))}
        </Card>

        <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
          <Card padding={16}>
            <SectionHeader title="Cluster fingerprint"/>
            <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
              {[
                { l:'Avg pro split', v: `${c.proAvg}%` },
                { l:'Avg sqft', v: `${(c.avgSqft/1000).toFixed(0)}k` },
                { l:'Cohesion', v: c.cohesion.toFixed(2) },
                { l:'Method', v: c.method },
                { l:'Last run', v: c.lastRun },
                { l:'Next run', v: c.nextRun },
              ].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', fontFamily:'Manrope', fontSize: 12 }}>
                  <span style={{ color:'#60697D', fontWeight: 600 }}>{r.l}</span>
                  <span style={{ color:'#0D152C', fontWeight: 700 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card padding={16}>
            <SectionHeader title="Dominant categories"/>
            <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
              {c.dominantCats.map((d, i) => (
                <div key={d} style={{ display:'flex', alignItems:'center', gap: 10 }}>
                  <span style={{ fontFamily:'Manrope', fontSize: 12, fontWeight: 700, color:'#0D152C', width: 130 }}>{d}</span>
                  <div style={{ flex: 1, height: 6, background:'#ECEDF3', borderRadius: 9999, overflow:'hidden' }}>
                    <div style={{ width: `${88 - i*14}%`, height:'100%', background: c.color }}/>
                  </div>
                  <span style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 600, fontFeatureSettings:'"tnum"' }}>{88 - i*14}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// CLUSTERING SCREEN — top-level router for the module
// =================================================================

const ClusteringScreen = () => {
  const [view, setView] = React.useState('dashboard');
  const [activeCluster, setActiveCluster] = React.useState(null);
  const toast = useToast();

  if (view === 'create')
    return <ClusterCreate
      onCancel={() => setView('dashboard')}
      onComplete={() => { setView('dashboard'); toast({kind:'success', message:'New cluster set is now live across StoreHub'}); }}/>;

  if (view === 'detail' && activeCluster)
    return <ClusterDetail clusterId={activeCluster} onBack={() => setView('dashboard')}/>;

  return <ClusteringDashboard
    onNew={() => setView('create')}
    onOpenCluster={(id) => { setActiveCluster(id); setView('detail'); }}
    onOpenRun={(id) => toast({kind:'info', message:`Opened run ${id} (read-only archive)`})}
  />;
};

Object.assign(window, { ClusteringScreen });
