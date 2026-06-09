// home.jsx — Home dashboard, role-aware

const KpiCard = ({ label, value, delta, deltaDir, sub, icon }) => (
  <Card padding={14} style={{ flex: 1, minWidth: 0 }}>
    <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 6 }}>
      {icon && <div style={{ width:28, height:28, borderRadius:6, background:'#ECEEFD', color:'#4259EE',
                              display:'inline-flex', alignItems:'center', justifyContent:'center'}}>{icon}</div>}
      <div className="ia-kpi-label" style={{ flex: 1 }}>{label}</div>
    </div>
    <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
      <div className="ia-kpi-value">{value}</div>
      {delta !== undefined && (
        <span style={{ display:'inline-flex', alignItems:'center', gap: 2, fontSize: 11, fontWeight: 700,
                       color: deltaDir==='up' ? '#217A4C' : deltaDir==='down' ? '#B42543' : '#60697D' }}>
          {deltaDir==='up' && <IconArrowUp size={12}/>}{deltaDir==='down' && <IconArrowDown size={12}/>}
          {delta}
        </span>
      )}
    </div>
    {sub && <div style={{ fontSize: 11, color:'#60697D', fontWeight: 500, marginTop: 4, fontFamily:'Manrope' }}>{sub}</div>}
  </Card>
);

const AlertRow = ({ alert, onClick }) => {
  const [h, setH] = React.useState(false);
  const variant = alert.type === 'network-win' ? 'winner'
    : alert.type === 'network-loser' ? 'loser'
    : alert.type === 'emerging' ? 'emerging' : 'stale';
  const label = alert.type === 'network-win' ? 'Network Win' :
                alert.type === 'network-loser' ? 'Network Loser' :
                alert.type === 'emerging' ? 'Emerging Winner' : 'Stale';
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3', cursor:'pointer',
               background: h ? '#F8F9FB' : 'transparent', transition:'background 120ms',
               display:'flex', alignItems:'flex-start', gap: 12 }}>
      <Pill variant={variant} size="sm" style={{flex:'0 0 auto'}}>{label}</Pill>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 13, color:'#0D152C', marginBottom: 2 }}>
          {alert.title}
        </div>
        <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 12, color:'#60697D', lineHeight: 1.45 }}>
          {alert.detail}
        </div>
      </div>
      <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 4, flex:'0 0 auto' }}>
        <span style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 12,
                       color: alert.impact >=0 ? '#217A4C' : '#B42543', fontFeatureSettings:'"tnum"' }}>
          {alert.impact >= 0 ? '+' : '−'}${Math.abs(alert.impact/1000).toFixed(1)}k
        </span>
        <span style={{ fontFamily:'Manrope', fontSize: 10, color:'#B4BAC7', fontWeight: 600 }}>{alert.age}</span>
      </div>
    </div>
  );
};

const TaskItem = ({ task, onClick }) => {
  const [h, setH] = React.useState(false);
  const dotColor = task.priority === 'high' ? '#E74C67' : task.priority === 'med' ? '#E1BC29' : '#3BB273';
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ padding:'10px 12px', borderRadius: 6, cursor:'pointer',
               background: h ? '#F5F6FA' : 'transparent', transition:'background 120ms',
               display:'flex', alignItems:'flex-start', gap: 10 }}>
      <span style={{ width: 6, height: 6, borderRadius:9999, background: dotColor, marginTop: 7, flex:'0 0 auto' }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 12.5, color:'#0D152C', marginBottom: 2 }}>{task.title}</div>
        <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>{task.detail}</div>
      </div>
      <IconChevronRight size={14} style={{color:'#B4BAC7', marginTop: 4}}/>
    </div>
  );
};

// Cluster ring: small visualisation of stores in cluster
const ClusterRing = ({ proSplit, size=64 }) => {
  const r = size/2 - 6;
  const c = 2 * Math.PI * r;
  const proPct = proSplit / 100;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ECEDF3" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#4259EE" strokeWidth="6"
              strokeDasharray={`${c*proPct} ${c}`}
              strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2-2} textAnchor="middle" fontFamily="Manrope" fontWeight="800" fontSize="14" fill="#0D152C">{proSplit}%</text>
      <text x={size/2} y={size/2+11} textAnchor="middle" fontFamily="Manrope" fontWeight="600" fontSize="8" fill="#60697D">PRO</text>
    </svg>
  );
};

const HomeScreen = ({ role, onNavigate }) => {
  const u = ROLE_USER[role];
  const isAMS = role === 'AMS';
  const isAMM = role === 'AMM';
  const isCM = role === 'CM';

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap: 16, padding: 20, minHeight:'100%' }}>
      {/* MAIN COLUMN */}
      <div style={{ display:'flex', flexDirection:'column', gap: 16, minWidth: 0 }}>
        {/* Greeting header */}
        <Card padding={20} style={{
          background: 'linear-gradient(135deg, #ECEEFD 0%, #F5F6FA 60%, #fff 100%)',
          border:'1px solid #DBE0FB', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', right:-30, top:-30, opacity:.1 }}>
            <div style={{ width: 220, height: 220, borderRadius: 9999, background:'#4259EE' }}/>
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap: 20, position:'relative' }}>
            <ClusterRing proSplit={isAMS ? 72 : isAMM ? 64 : 58}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontSize: 11, fontWeight: 700, color:'#4259EE', letterSpacing:'.06em', textTransform:'uppercase', marginBottom: 6 }}>
                {isAMS && 'My Store'}{isAMM && 'My Region'}{isCM && 'My Network'}
              </div>
              <div style={{ fontFamily:'Manrope', fontSize: 22, fontWeight: 800, color:'#0D152C', letterSpacing:'-0.01em' }}>
                Good morning, {u.name.split(' ')[1] || u.name}.
              </div>
              <div style={{ fontFamily:'Manrope', fontSize: 13, fontWeight: 500, color:'#60697D', marginTop: 4 }}>
                {isAMS && 'Atlanta — Buckhead · S0142 · Pro-Heavy South cluster · Standard format (78,000 sq ft)'}
                {isAMM && 'Southeast Region · 18 stores across C-Pro-South & C-Mixed-East · 3 stores need attention'}
                {isCM && 'Tile & Stone · 70 stores · PLR-2026-W18 cycle window opens in 3 days'}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap: 12, marginTop: 12, fontSize: 11, color:'#60697D', fontFamily:'Manrope', fontWeight: 500 }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap: 4 }}>
                  <IconClock size={12}/> Last refreshed 12 min ago
                </span>
                <span>·</span>
                <span>Next PLR cycle: Apr 30, 2026</span>
              </div>
            </div>
          </div>

          {/* AI daily brief */}
          <div style={{ marginTop: 16, padding: 14, background:'rgba(255,255,255,.7)', borderRadius: 8,
                        border:'1px solid #DBE0FB', display:'flex', alignItems:'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8,
                          background:'linear-gradient(135deg, #4259EE, #8C9AF4)',
                          color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto'}}>
              <IconSparkles size={16}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>AI Daily Brief</span>
                <Pill variant="review" size="sm" dot={false}>Overnight</Pill>
              </div>
              <div style={{ fontFamily:'Manrope', fontSize: 12.5, fontWeight: 500, color:'#1F2B4D', lineHeight: 1.55 }}>
                {isAMS && '4 new Network Win opportunities surfaced overnight, weighted toward porcelain tile. 2 Stale SKUs crossed the 36-week threshold — recommended for exit review. Compliance score holding at 94%.'}
                {isAMM && 'Across your 18 stores, 23 SKUs flipped status overnight. 6 became Network Winners cluster-wide; 4 dropped to Loser. PLR-2026-W18 recommendation set is ready for your review (12 ADD · 5 DROP · 2 CARRY).'}
                {isCM && 'Pilot category (Porcelain Tile, Pro-Heavy South cluster) shows +2.4% sell-through delta vs. control over the 8-week window. AMM modification rate stable at 14% — within target band.'}
              </div>
            </div>
            <IconButton><IconChevronRight size={16}/></IconButton>
          </div>
        </Card>

        {/* KPI strip */}
        <div style={{ display:'flex', gap: 12 }}>
          {isAMS && (<>
            <KpiCard label="SKUs Managed" value="4,412" delta="+38" deltaDir="up" sub="vs. last week" icon={<IconBox size={14}/>}/>
            <KpiCard label="Tasks Today" value="7" sub="3 high priority" icon={<IconBolt size={14}/>}/>
            <KpiCard label="Compliance Score" value="94%" delta="+1.2%" deltaDir="up" sub="vs. cluster avg 91%" icon={<IconShield size={14}/>}/>
            <KpiCard label="NPS Score" value="72" delta="−3" deltaDir="down" sub="vs. last quarter" icon={<IconStar size={14}/>}/>
          </>)}
          {isAMM && (<>
            <KpiCard label="Stores Managed" value="18" sub="3 need attention" icon={<IconStore size={14}/>}/>
            <KpiCard label="Network Wins Surfaced" value="142" delta="+24" deltaDir="up" sub="this week" icon={<IconTrend size={14}/>}/>
            <KpiCard label="Trapped Capital" value="$1.84M" delta="−$112k" deltaDir="up" sub="vs. last cycle" icon={<IconRing size={14}/>}/>
            <KpiCard label="Pending Reviews" value="19" sub="cycle closes Fri" icon={<IconClock size={14}/>}/>
          </>)}
          {isCM && (<>
            <KpiCard label="Pipeline" value="84" sub="recs in flight" icon={<IconLayers size={14}/>}/>
            <KpiCard label="Acceptance Rate" value="78%" delta="+4%" deltaDir="up" sub="last 4 weeks" icon={<IconCheck size={14}/>}/>
            <KpiCard label="Modification Rate" value="14%" delta="−2%" deltaDir="up" sub="trending down" icon={<IconFlag size={14}/>}/>
            <KpiCard label="Outcome Δ vs Baseline" value="+2.4%" delta="ST 8-wk" deltaDir="up" sub="pilot category" icon={<IconChart size={14}/>}/>
          </>)}
        </div>

        {/* Issues + Positive — two columns */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
          <Card padding={0}>
            <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3',
                          display:'flex', alignItems:'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background:'#FDECF2', color:'#B42543',
                            display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                <IconWarning size={14}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>Assortment Risk</div>
                <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>Issues needing attention</div>
              </div>
              <Pill variant="rejected" size="sm">5</Pill>
            </div>
            <div>
              {ALERTS.slice(0, 3).map(a => <AlertRow key={a.id} alert={a} onClick={()=>onNavigate('peer')}/>)}
            </div>
            <div style={{ padding:'10px 14px', textAlign:'center' }}>
              <button onClick={()=>onNavigate('peer')} style={{
                background:'transparent', border:0, color:'#4259EE', fontFamily:'Manrope',
                fontWeight: 600, fontSize: 12, cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 4,
              }}>
                View all 5 issues <IconArrowRight size={12}/>
              </button>
            </div>
          </Card>

          <Card padding={0}>
            <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3',
                          display:'flex', alignItems:'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background:'#E7F6EC', color:'#217A4C',
                            display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                <IconCheck size={14}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>Positive Signals</div>
                <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>Holding strong</div>
              </div>
            </div>
            <div style={{ padding:'4px 8px' }}>
              {[
                { title: 'Strong Performance', detail: 'Porcelain tile +12% sell-through vs cluster median', icon: <IconTrend size={14}/>, c:'#3BB273' },
                { title: 'Compliance On Track', detail: 'PLR cycle adherence at 94% — top quartile', icon: <IconShield size={14}/>, c:'#4259EE' },
                { title: 'Customer Satisfaction', detail: 'NPS 72 — above network median of 68', icon: <IconStar size={14}/>, c:'#E1BC29' },
                { title: 'Emerging Wins', detail: '2 SKUs trending +28% over trailing 4w', icon: <IconSparkles size={14}/>, c:'#8C9AF4' },
              ].map((s, i) => (
                <div key={i} style={{ padding:'10px 8px', display:'flex', gap: 10, alignItems:'flex-start',
                                      borderBottom: i < 3 ? '1px solid #F5F6FA' : 0 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background:'#F5F6FA', color: s.c,
                                display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto'}}>{s.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 12.5, color:'#0D152C' }}>{s.title}</div>
                    <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Cluster snapshot */}
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3',
                        display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background:'#ECEEFD', color:'#4259EE',
                          display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
              <IconUsers size={14}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>
                {isAMS ? 'My cluster: Pro-Heavy South' : 'Cluster snapshot'}
              </div>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>
                {isAMS ? '18 stores · 70% Pro avg · 79,000 sq ft avg' : 'All clusters in your scope'}
              </div>
            </div>
            <Button variant="secondary" size="sm" rightIcon={<IconArrowRight size={12}/>} onClick={()=>onNavigate('peer')}>Open Peer Intelligence</Button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 0 }}>
            {CLUSTERS.map((c, i) => (
              <div key={c.id} style={{
                padding: 14, borderRight: i<4 ? '1px solid #ECEDF3' : 0,
                display:'flex', flexDirection:'column', gap: 6,
                background: isAMS && c.id==='C-Pro-South' ? '#F8F9FB' : '#fff',
                position:'relative',
              }}>
                {isAMS && c.id==='C-Pro-South' && (
                  <span style={{ position:'absolute', top: 8, right: 8 }}>
                    <Pill variant="review" size="sm" dot={false}>Yours</Pill>
                  </span>
                )}
                <div style={{ width: 8, height: 8, borderRadius: 9999, background: c.color }}/>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 12, color:'#0D152C' }}>{c.name}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
                  <span className="ia-kpi-value" style={{ fontSize: 18 }}>{c.stores}</span>
                  <span style={{ fontFamily:'Manrope', fontSize: 10, color:'#60697D', fontWeight: 600 }}>stores</span>
                </div>
                <div style={{ fontFamily:'Manrope', fontSize: 10, color:'#60697D', fontWeight: 500, lineHeight: 1.4 }}>
                  {c.proAvg}% Pro · {(c.avgSqft/1000).toFixed(0)}k sqft<br/>
                  {c.dominantCats.slice(0,2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
        {/* Action Queue */}
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3',
                        display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background:'#ECEEFD', color:'#4259EE',
                          display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
              <IconBolt size={14}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>Action Queue</div>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>Top 5 priorities</div>
            </div>
          </div>
          <div style={{ padding: 6 }}>
            {TASKS.map(t => <TaskItem key={t.id} task={t} onClick={()=>onNavigate('recs')}/>)}
          </div>
        </Card>

        {/* HQ Broadcasts */}
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3',
                        display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background:'#FFFAD6', color:'#8A6E00',
                          display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
              <IconMessage size={14}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>HQ Broadcasts</div>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>Critical updates</div>
            </div>
          </div>
          <div>
            {BROADCASTS.map((b, i) => (
              <div key={b.id} style={{ padding:'10px 14px', borderBottom: i < BROADCASTS.length-1 ? '1px solid #F5F6FA' : 0,
                                       display:'flex', alignItems:'flex-start', gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius:9999, background:'#4259EE', marginTop: 6, flex:'0 0 auto' }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 12.5, color:'#0D152C', marginBottom: 2 }}>{b.title}</div>
                  <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>{b.when} · {b.type}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stage progress card */}
        <Card padding={14}>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>Rollout</div>
            <Pill variant="review" size="sm" dot={false}>Stage 2</Pill>
          </div>
          {[
            { name: 'Stage 1 — Hindsight + Clustering', done: true, weeks: 'W1–W12' },
            { name: 'Stage 2 — Peer Intelligence', done: false, current: true, weeks: 'W13–W28' },
            { name: 'Stage 3 — Centralized Category Mgmt', done: false, weeks: 'W29–W44' },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', gap: 10, padding:'8px 0', borderBottom: i<2 ? '1px solid #F5F6FA' : 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: 9999, marginTop: 2, flex:'0 0 auto',
                            background: s.done ? '#3BB273' : s.current ? '#fff' : '#F5F6FA',
                            border: s.current ? '2px solid #4259EE' : 'none',
                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                            color: s.done ? '#fff' : '#4259EE'}}>
                {s.done && <IconCheck size={12}/>}
                {s.current && <span style={{width:6,height:6,borderRadius:9999,background:'#4259EE'}}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 12, color: s.done || s.current ? '#0D152C' : '#60697D' }}>{s.name}</div>
                <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 10.5, color:'#60697D' }}>{s.weeks}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { HomeScreen });
