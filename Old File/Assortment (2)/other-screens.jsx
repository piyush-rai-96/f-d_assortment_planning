// other-screens.jsx — District, Store Deep Dive, AI Copilot, simple stubs

const _os_breadcrumb = (path) => (
  <div style={{ display:'flex', alignItems:'center', gap: 10, fontFamily:'Manrope', fontSize: 11.5, fontWeight: 600, color:'#60697D', marginBottom: 6 }}>
    {path.map((p, i, arr) => (
      <React.Fragment key={i}>
        <span style={{color: i === arr.length-1 ? '#1F2B4D' : '#60697D'}}>{p}</span>
        {i < arr.length-1 && <IconChevronRight size={11}/>}
      </React.Fragment>
    ))}
  </div>
);

// =================================================================
// DISTRICT — clickable rows route to Store Deep Dive
// =================================================================
const DistrictScreen = ({ onOpenStore }) => {
  const toast = useToast();
  return (
    <div style={{ padding: 20 }}>
      {_os_breadcrumb(['District Intelligence'])}
      <div style={{ marginBottom: 18 }}>
        <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>District Intelligence — Southeast Region</h2>
        <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D', marginTop: 4 }}>
          18 stores · 3 clusters · ranked by assortment health
        </div>
      </div>

      <Card padding={0}>
        <div style={{ display:'grid', gridTemplateColumns:'40px 2fr 1fr 1fr 1fr 1fr 1fr 100px',
                      padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                      fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D',
                      textTransform:'uppercase', letterSpacing:'.06em' }}>
          <div>#</div><div>Store</div><div>Cluster</div><div style={{textAlign:'right'}}>Health</div>
          <div style={{textAlign:'right'}}>Wins / Losers</div><div style={{textAlign:'right'}}>Trapped</div>
          <div style={{textAlign:'right'}}>Pro/DIY</div><div></div>
        </div>
        {STORES.map((st, i) => {
          const health = 92 - i*4 + (i%2 ? 3 : 0);
          const cluster = CLUSTERS.find(c => c.id === st.cluster);
          return (
            <div key={st.id}
              onClick={() => onOpenStore && onOpenStore(st.id)}
              onMouseEnter={e => e.currentTarget.style.background='#F8F9FB'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
              style={{
                display:'grid', gridTemplateColumns:'40px 2fr 1fr 1fr 1fr 1fr 1fr 100px',
                padding:'12px 14px', borderBottom: i < STORES.length - 1 ? '1px solid #F5F6FA' : 0,
                alignItems:'center', cursor:'pointer', transition:'background 120ms',
              }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 800, fontSize: 13, color:'#60697D', fontFeatureSettings:'"tnum"' }}>{i+1}</div>
              <div>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>{st.name}</div>
                <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>{st.id} · {st.format} · {(st.sqft/1000).toFixed(0)}k sqft</div>
              </div>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: cluster?.color }}/>
                  <span style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 12, color:'#0D152C' }}>{cluster?.name}</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{ display:'flex', justifyContent:'flex-end', gap: 6, alignItems:'center' }}>
                  <ConfidenceBar score={health} width={60}/>
                </div>
              </div>
              <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 600, fontFeatureSettings:'"tnum"' }}>
                <span style={{color:'#3BB273'}}>{180 + i*4}</span> / <span style={{color:'#E74C67'}}>{30 + i*2}</span>
              </div>
              <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 700, fontFeatureSettings:'"tnum"' }}>
                ${(120 + i*18)}k
              </div>
              <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 600, fontFeatureSettings:'"tnum"' }}>
                {st.proSplit}% / {100-st.proSplit}%
              </div>
              <div style={{ textAlign:'right' }}>
                <Button variant="ghost" size="xs" rightIcon={<IconArrowRight size={11}/>}
                  onClick={(e) => { e.stopPropagation(); onOpenStore && onOpenStore(st.id); }}>Open</Button>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

// =================================================================
// STORE DEEP DIVE — full screen
// =================================================================
const StoreDeepDiveScreen = ({ storeId='S0142', onBack, onOpenSku }) => {
  const store = STORES.find(s => s.id === storeId) || STORES[0];
  const cluster = CLUSTERS.find(c => c.id === store.cluster);
  const [tab, setTab] = React.useState('overview');
  const toast = useToast();

  // KPIs
  const kpis = [
    { label:'Net sales (52w)', value:'$48.2M', delta:'+5.4%', dir:'up', spark: trendUp(401, 60), color:'#4259EE' },
    { label:'Sell-through', value:'72.8%', delta:'+1.6pp', dir:'up', spark: trendUp(402, 65), color:'#3BB273' },
    { label:'Trapped capital', value:'$182k', delta:'-$24k', dir:'down', spark: trendDown(403, 55), color:'#E74C67' },
    { label:'Cluster fit', value:'0.86', delta:'+0.02', dir:'up', spark: trendUp(404, 70), color:'#8C9AF4' },
  ];

  // Category breakdown for THIS store
  const catBreakdown = [
    { cat:'Tile',         color:'#4259EE', sales: 18.4, share: 38, winners: 42, losers: 11, stale: 4 },
    { cat:'Wood',         color:'#3BB273', sales: 11.2, share: 23, winners: 28, losers: 9,  stale: 3 },
    { cat:'Installation', color:'#E1BC29', sales:  8.6, share: 18, winners: 22, losers: 4,  stale: 1 },
    { cat:'Stone',        color:'#8C9AF4', sales:  5.1, share: 11, winners: 11, losers: 6,  stale: 2 },
    { cat:'Decorative',   color:'#E74C67', sales:  4.9, share: 10, winners:  6, losers: 14, stale: 7 },
  ];

  // Peer comparison row
  const peerStores = NETWORK_STORES.filter(s => s.cluster === store.cluster && s.id !== store.id).slice(0, 5);

  return (
    <div style={{ padding: 20 }}>
      {_os_breadcrumb(['Store Deep Dive', store.id])}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 16, gap: 16, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 6 }}>
            <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>{store.name}</h2>
            <Pill variant="info" size="sm" dot={false}>{store.id}</Pill>
            <Pill variant="approved" size="sm">Healthy</Pill>
          </div>
          <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D' }}>
            {store.format} format · {(store.sqft/1000).toFixed(0)}k sqft · {store.region} ·
            <span style={{ marginLeft: 6, display:'inline-flex', alignItems:'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: cluster?.color }}/>
              <span style={{ color:'#0D152C', fontWeight: 600 }}>{cluster?.name}</span>
            </span>
          </div>
        </div>
        <div style={{ display:'flex', gap: 8 }}>
          {onBack && <Button variant="secondary" leftIcon={<IconChevronLeft size={14}/>} onClick={onBack}>Back to District</Button>}
          <Button variant="secondary" leftIcon={<IconDownload size={14}/>} onClick={()=>toast({kind:'info', message:'Store scorecard exported (CSV)'})}>Export</Button>
          <Button variant="primary" leftIcon={<IconBolt size={14}/>} onClick={()=>toast({kind:'success', message:'Opened 12 recommendations for this store'})}>Open recs (12)</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {kpis.map(k => (
          <Card key={k.label} padding={14}>
            <div style={{ fontFamily:'Manrope', fontSize: 11, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop: 6 }}>
              <span className="ia-kpi-value" style={{ fontSize: 22 }}>{k.value}</span>
              <Sparkline data={k.spark} width={56} height={20} color={k.color}/>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap: 4, marginTop: 4,
                          fontFamily:'Manrope', fontSize: 11.5, fontWeight: 700,
                          color: k.dir === 'up' ? '#3BB273' : '#E74C67' }}>
              {k.dir === 'up' ? <IconArrowUp size={11}/> : <IconArrowDown size={11}/>}
              <span>{k.delta}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onChange={setTab} style={{ marginBottom: 16 }}
        tabs={[
          { id:'overview', label:'Overview' },
          { id:'categories', label:'Categories', count: 5 },
          { id:'skus', label:'SKU ledger', count: SKUS.length },
          { id:'peers', label:'Peer compare', count: peerStores.length },
        ]}/>

      {tab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 16 }}>
          <Card padding={0}>
            <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3' }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Category mix · 52w net sales</div>
              <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>$48.2M total · click any row to drill</div>
            </div>
            <div style={{ padding: 14 }}>
              {/* Stacked bar */}
              <div style={{ display:'flex', height: 18, borderRadius: 4, overflow:'hidden', marginBottom: 14 }}>
                {catBreakdown.map(c => (
                  <div key={c.cat} title={`${c.cat} ${c.share}%`}
                    style={{ width: `${c.share}%`, background: c.color }}/>
                ))}
              </div>
              {catBreakdown.map((c, i) => (
                <div key={c.cat} onClick={()=>toast({kind:'info', message:`Drilling into ${c.cat}`})}
                  style={{ display:'grid', gridTemplateColumns:'14px 1.4fr 80px 80px 1fr 70px',
                           padding:'10px 0', alignItems:'center', cursor:'pointer',
                           borderBottom: i < catBreakdown.length-1 ? '1px solid #F5F6FA' : 0, gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 9999, background: c.color }}/>
                  <span style={{ fontFamily:'Manrope', fontSize: 13, color:'#0D152C', fontWeight: 700 }}>{c.cat}</span>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize: 12, color:'#0D152C', fontWeight: 600, textAlign:'right' }}>${c.sales}M</span>
                  <span style={{ fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 600, textAlign:'right' }}>{c.share}%</span>
                  <div style={{ display:'flex', gap: 6 }}>
                    <Pill variant="approved" size="sm" dot={false}>{c.winners}W</Pill>
                    <Pill variant="loser" size="sm" dot={false}>{c.losers}L</Pill>
                    <Pill variant="neutral" size="sm" dot={false}>{c.stale}S</Pill>
                  </div>
                  <Button variant="ghost" size="xs" rightIcon={<IconArrowRight size={11}/>}>Open</Button>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            <Card padding={14}>
              <SectionHeader title="Top opportunities" subtitle="Network winners not carried here"/>
              {SKUS.filter(s => s.flag === 'network-win').slice(0, 4).map((s, i) => (
                <div key={s.id} onClick={()=>onOpenSku && onOpenSku(s)}
                  style={{ display:'flex', gap: 10, alignItems:'center', padding:'10px 0',
                           borderTop: i > 0 ? '1px solid #F5F6FA' : 0, cursor:'pointer' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily:'JetBrains Mono', fontSize: 11, color:'#4259EE', fontWeight: 700 }}>{s.id}</div>
                    <div style={{ fontFamily:'Manrope', fontSize: 12.5, color:'#0D152C', fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'JetBrains Mono', fontSize: 12.5, fontWeight: 700, color:'#3BB273' }}>+${(s.revOpp/1000).toFixed(0)}k</div>
                    <div style={{ fontFamily:'Manrope', fontSize: 10.5, color:'#60697D', fontWeight: 600 }}>{s.peerCarry}% peer carry</div>
                  </div>
                </div>
              ))}
            </Card>

            <Card padding={14}>
              <SectionHeader title="Risk watchlist" subtitle="Losers + stale still on shelf"/>
              {SKUS.filter(s => s.flag === 'network-loser' || s.flag === 'stale').map((s, i) => (
                <div key={s.id} onClick={()=>onOpenSku && onOpenSku(s)}
                  style={{ display:'flex', gap: 10, alignItems:'center', padding:'10px 0',
                           borderTop: i > 0 ? '1px solid #F5F6FA' : 0, cursor:'pointer' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily:'JetBrains Mono', fontSize: 11, color:'#E74C67', fontWeight: 700 }}>{s.id}</div>
                    <div style={{ fontFamily:'Manrope', fontSize: 12.5, color:'#0D152C', fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'JetBrains Mono', fontSize: 12.5, fontWeight: 700, color:'#E74C67' }}>${(s.trapped/1000).toFixed(0)}k</div>
                    <div style={{ fontFamily:'Manrope', fontSize: 10.5, color:'#60697D', fontWeight: 600 }}>{s.weeksAtLoser}w trapped</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <Card padding={0}>
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 100px 100px 1fr 1fr 100px',
                        padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                        fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>
            <div>Category</div><div style={{textAlign:'right'}}>Sales</div><div style={{textAlign:'right'}}>Share</div><div>Classification mix</div><div>Trend</div><div></div>
          </div>
          {catBreakdown.map((c, i) => (
            <div key={c.cat} style={{ display:'grid', gridTemplateColumns:'1.6fr 100px 100px 1fr 1fr 100px',
                                      padding:'14px', alignItems:'center',
                                      borderBottom: i < catBreakdown.length-1 ? '1px solid #F5F6FA' : 0 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 9999, background: c.color }}/>
                <span style={{ fontFamily:'Manrope', fontSize: 13, color:'#0D152C', fontWeight: 700 }}>{c.cat}</span>
              </div>
              <div style={{ textAlign:'right', fontFamily:'JetBrains Mono', fontSize: 12, color:'#0D152C', fontWeight: 700 }}>${c.sales}M</div>
              <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 600 }}>{c.share}%</div>
              <div style={{ display:'flex', height: 6, borderRadius: 9999, overflow:'hidden', background:'#F5F6FA' }}>
                <div style={{ width:`${(c.winners/(c.winners+c.losers+c.stale))*100}%`, background:'#3BB273' }}/>
                <div style={{ width:`${(c.losers/(c.winners+c.losers+c.stale))*100}%`, background:'#E74C67' }}/>
                <div style={{ width:`${(c.stale/(c.winners+c.losers+c.stale))*100}%`, background:'#B4BAC7' }}/>
              </div>
              <Sparkline data={trendUp(500+i, 50)} width={80} color={c.color}/>
              <div style={{ textAlign:'right' }}>
                <Button variant="ghost" size="xs" rightIcon={<IconArrowRight size={11}/>}>Drill</Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'skus' && (
        <Card padding={0}>
          <div style={{ display:'grid', gridTemplateColumns:'90px 2fr 1fr 100px 100px 100px 90px',
                        padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                        fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>
            <div>SKU</div><div>Name</div><div>Category</div><div style={{textAlign:'right'}}>Class</div><div style={{textAlign:'right'}}>Confidence</div><div style={{textAlign:'right'}}>Trend</div><div></div>
          </div>
          {SKUS.map((s, i) => (
            <div key={s.id} onClick={()=>onOpenSku && onOpenSku(s)}
              onMouseEnter={e=>e.currentTarget.style.background='#F8F9FB'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              style={{ display:'grid', gridTemplateColumns:'90px 2fr 1fr 100px 100px 100px 90px',
                       padding:'12px 14px', alignItems:'center', cursor:'pointer',
                       borderBottom: i < SKUS.length-1 ? '1px solid #F5F6FA' : 0 }}>
              <div style={{ fontFamily:'JetBrains Mono', fontSize: 11.5, color:'#4259EE', fontWeight: 700 }}>{s.id}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 12.5, color:'#0D152C', fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 600 }}>{s.cat}</div>
              <div style={{ textAlign:'right' }}>
                <Pill size="sm" variant={s.classification === 'Winner' ? 'approved' : s.classification === 'Loser' ? 'loser' : 'neutral'}>{s.classification}</Pill>
              </div>
              <div style={{ textAlign:'right' }}><ConfidenceBar score={s.confidence} width={60}/></div>
              <div style={{ textAlign:'right' }}><Sparkline data={s.trend} width={70} color={s.classification === 'Winner' ? '#3BB273' : s.classification === 'Loser' ? '#E74C67' : '#4259EE'}/></div>
              <div style={{ textAlign:'right' }}><Button variant="ghost" size="xs" rightIcon={<IconArrowRight size={11}/>}>Open</Button></div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'peers' && (
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3' }}>
            <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Peer stores in {cluster?.name}</div>
            <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>Stores most similar to {store.id} by attribute fingerprint</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'90px 1.6fr 1fr 90px 90px 100px',
                        padding:'10px 14px', background:'#F8F9FB', borderBottom:'1px solid #ECEDF3',
                        fontFamily:'Manrope', fontSize: 10.5, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>
            <div>Store</div><div>Name</div><div>Region</div><div style={{textAlign:'right'}}>Pro %</div><div style={{textAlign:'right'}}>Sqft</div><div></div>
          </div>
          {peerStores.map((p, i) => (
            <div key={p.id} style={{ display:'grid', gridTemplateColumns:'90px 1.6fr 1fr 90px 90px 100px',
                                     padding:'12px 14px', alignItems:'center',
                                     borderBottom: i < peerStores.length-1 ? '1px solid #F5F6FA' : 0 }}>
              <div style={{ fontFamily:'JetBrains Mono', fontSize: 11.5, color:'#4259EE', fontWeight: 700 }}>{p.id}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 13, color:'#0D152C', fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 600 }}>{p.region}</div>
              <div style={{ textAlign:'right', fontFamily:'JetBrains Mono', fontSize: 12, fontWeight: 700, color:'#0D152C' }}>{p.proSplit}%</div>
              <div style={{ textAlign:'right', fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 600 }}>{(p.sqft/1000).toFixed(0)}k</div>
              <div style={{ textAlign:'right' }}><Button variant="ghost" size="xs" rightIcon={<IconArrowRight size={11}/>}>Open</Button></div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

// =================================================================
// AI COPILOT — chat with prebuilt Q&A
// =================================================================

const COPILOT_QA = [
  {
    q: 'Which SKUs are network winners my store doesn\'t carry?',
    a: ({onOpenSku}) => (
      <div>
        <div style={{ marginBottom: 10 }}>I found <strong>4 network-winner SKUs</strong> absent from S0142 Atlanta Buckhead, ranked by estimated revenue opportunity:</div>
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          {SKUS.filter(s=>s.flag==='network-win').map(s => (
            <div key={s.id} onClick={()=>onOpenSku && onOpenSku(s)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#F8F9FB', borderRadius:6, cursor:'pointer',
                       border:'1px solid #ECEDF3' }}>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#4259EE', fontWeight:700, width:80 }}>{s.id}</span>
              <span style={{ flex:1, fontFamily:'Manrope', fontSize:12.5, color:'#0D152C', fontWeight:600 }}>{s.name}</span>
              <span style={{ fontFamily:'Manrope', fontSize:11, color:'#60697D', fontWeight:600 }}>{s.peerCarry}% carry</span>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:12, fontWeight:700, color:'#3BB273' }}>+${(s.revOpp/1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, fontFamily:'Manrope', fontSize:12, color:'#60697D', fontWeight:500 }}>Total opportunity: <strong style={{color:'#3BB273'}}>+$352k</strong> annualised. All 4 are queued in PLR-2026-W18.</div>
      </div>
    ),
  },
  {
    q: 'How much trapped capital is on my shelves?',
    a: () => (
      <div>
        <div style={{ marginBottom: 10 }}>Across S0142, you have <strong style={{color:'#E74C67'}}>$182k trapped capital</strong> on Loser + Stale SKUs. Down $24k from last cycle.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'Decorative', value:'$84k', sub:'7 stale + 14 losers' },
            { label:'Tile', value:'$58k', sub:'Glass/mosaic concentration' },
            { label:'Wood', value:'$40k', sub:'Solid hardwood drag' },
          ].map(c => (
            <div key={c.label} style={{ padding:10, background:'#FBE8EC', borderRadius:6, border:'1px solid #F2C5CD' }}>
              <div style={{ fontFamily:'Manrope', fontSize:10.5, fontWeight:700, color:'#8A2C3F', textTransform:'uppercase', letterSpacing:'.06em' }}>{c.label}</div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:18, fontWeight:800, color:'#A6253A', marginTop:4 }}>{c.value}</div>
              <div style={{ fontFamily:'Manrope', fontSize:11, color:'#60697D', fontWeight:600, marginTop:2 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    q: 'Why was Mediterranean Mosaic flagged as a Loser?',
    a: () => (
      <div>
        <div style={{ marginBottom: 8 }}><strong>TIL-22014 · Mediterranean Mosaic 2x2 Glass — Teal</strong> hit Loser classification 14 weeks ago. Three signals fired:</div>
        <ol style={{ margin:'0 0 10px 0', paddingLeft:20, fontFamily:'Manrope', fontSize:12.5, color:'#1F2B4D', lineHeight:1.7 }}>
          <li>Sell-through dropped to <strong>22%</strong> — bottom quartile in your cluster (Pro-Heavy South)</li>
          <li>Carried in only <strong>48% of peers</strong>, and a Loser in <strong>9 of 18</strong> of those</li>
          <li>3 PLR cycles without recovery — confidence <strong>79%</strong></li>
        </ol>
        <div style={{ padding:10, background:'#FFFAD6', borderRadius:6, fontFamily:'Manrope', fontSize:12, color:'#1F2B4D', fontWeight:500 }}>
          <strong>Recommended action:</strong> DROP. $41.2k trapped. R-2040 is pending in your queue.
        </div>
      </div>
    ),
  },
  {
    q: 'What\'s changed since the last cluster run?',
    a: () => (
      <div>
        <div style={{ marginBottom: 10 }}>The current live cluster set <strong>CR-018</strong> ran Jan 12, 2026. Compared with the previous baseline:</div>
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          {[
            { type:'add', text:'2 stores moved into Pro-Heavy South (S0188 Orlando, S0244 Nashville)' },
            { type:'remove', text:'1 store left DIY-Heavy West (S0419 Salt Lake — moved to a new outlier cluster)' },
            { type:'change', text:'Cohesion improved: 0.74 → 0.80 average across all clusters' },
            { type:'change', text:'14 SKUs reclassified after cluster reassignment — 9 winners, 5 losers' },
          ].map((e, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 10px', background:'#F8F9FB', borderRadius:6 }}>
              <span style={{
                width:18, height:18, borderRadius:9999, flex:'0 0 auto', display:'inline-flex', alignItems:'center', justifyContent:'center',
                background: e.type==='add'?'#E7F6EC':e.type==='remove'?'#FBE8EC':'#ECEEFD',
                color: e.type==='add'?'#3BB273':e.type==='remove'?'#E74C67':'#4259EE',
              }}>
                {e.type==='add'?<IconPlus size={11}/>:e.type==='remove'?<IconX size={11}/>:<IconRefresh size={10}/>}
              </span>
              <span style={{ fontFamily:'Manrope', fontSize:12.5, color:'#1F2B4D', fontWeight:500, lineHeight:1.5 }}>{e.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    q: 'Compare Atlanta Buckhead vs Houston Westheimer',
    a: () => (
      <div>
        <div style={{ marginBottom: 10 }}>Both stores are in <strong>Pro-Heavy South</strong> cluster — strong peer comparison.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
          {[
            { id:'S0142', name:'Atlanta — Buckhead', sales:'$48.2M', proSplit:'72%', sellThrough:'72.8%' },
            { id:'S0089', name:'Houston — Westheimer', sales:'$45.7M', proSplit:'74%', sellThrough:'69.4%' },
          ].map(s => (
            <div key={s.id} style={{ padding:12, background:'#F6F7FE', borderRadius:8, border:'1px solid #C5CFF9' }}>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#4259EE', fontWeight:700 }}>{s.id}</div>
              <div style={{ fontFamily:'Manrope', fontSize:13, color:'#0D152C', fontWeight:700, marginTop:2 }}>{s.name}</div>
              <div style={{ marginTop:8, fontFamily:'Manrope', fontSize:11.5, fontWeight:600, color:'#60697D', display:'flex', flexDirection:'column', gap:3 }}>
                <span>52w sales: <strong style={{ color:'#0D152C', fontFamily:'JetBrains Mono' }}>{s.sales}</strong></span>
                <span>Pro split: <strong style={{ color:'#0D152C' }}>{s.proSplit}</strong></span>
                <span>Sell-through: <strong style={{ color:'#0D152C' }}>{s.sellThrough}</strong></span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, padding:10, background:'#E7F6EC', borderRadius:6, fontFamily:'Manrope', fontSize:12, color:'#1F2B4D', fontWeight:500 }}>
          <strong>Insight:</strong> Atlanta outperforms Houston on sell-through despite slightly lower Pro mix. Atlanta carries 3 Tile winners that Houston is missing — <strong>$74k</strong> opportunity.
        </div>
      </div>
    ),
  },
  {
    q: 'Show me my pending recommendations',
    a: () => (
      <div>
        <div style={{ marginBottom:10 }}>You have <strong>{RECOMMENDATIONS.filter(r=>r.status==='pending').length} pending recommendations</strong> in cycle PLR-2026-W18:</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {RECOMMENDATIONS.filter(r=>r.status==='pending').map(r => (
            <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#F8F9FB', borderRadius:6, border:'1px solid #ECEDF3' }}>
              <Pill size="sm" variant={r.action==='ADD'?'approved':r.action==='DROP'?'loser':'info'}>{r.action}</Pill>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:11, color:'#4259EE', fontWeight:700 }}>{r.sku}</span>
              <span style={{ flex:1, fontFamily:'Manrope', fontSize:12.5, color:'#0D152C', fontWeight:600 }}>{r.name}</span>
              <ConfidenceBar score={r.confidence} width={50}/>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const CopilotScreen = ({ onOpenSku }) => {
  const [chat, setChat] = React.useState([
    { role:'assistant', text:'Hi M. Chen — I read the same data StoreHub does. Ask me about SKUs, clusters, recommendations, or trapped capital. Try a suggestion below to get started.' },
  ]);
  const [input, setInput] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const scrollerRef = React.useRef(null);
  const toast = useToast();

  React.useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [chat, thinking]);

  const ask = (question) => {
    setChat(c => [...c, { role:'user', text: question }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      // match question to canned answer; fallback otherwise
      const match = COPILOT_QA.find(qa => qa.q.toLowerCase() === question.toLowerCase())
                 || COPILOT_QA.find(qa => question.toLowerCase().split(' ').some(w => w.length > 3 && qa.q.toLowerCase().includes(w)));
      const answer = match
        ? { role:'assistant', kind:'rich', render: match.a }
        : { role:'assistant', text:'I can answer questions about SKUs, clusters, recommendations, peer comparisons, and trapped capital. Try one of the suggestions on the right — or rephrase your question with a SKU code, store ID, or category.' };
      setChat(c => [...c, answer]);
      setThinking(false);
    }, 700 + Math.random()*400);
  };

  return (
    <div style={{ padding: 20, height:'calc(100vh - 56px)', display:'flex', flexDirection:'column' }}>
      {_os_breadcrumb(['Command Center', 'AI Copilot'])}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 14, gap: 16 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background:'linear-gradient(135deg, #4259EE 0%, #8C9AF4 100%)',
                          color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center',
                          boxShadow:'0 2px 8px rgba(66,89,238,.45)' }}>
              <IconSparkles size={18}/>
            </div>
            <div>
              <h2 className="ia" style={{ margin: 0, fontSize: 22 }}>AI Copilot</h2>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 12.5, color:'#60697D' }}>
                Ask in plain English · grounded on your live assortment data
              </div>
            </div>
          </div>
        </div>
        <Pill variant="approved" size="sm">Live</Pill>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Chat column */}
        <Card padding={0} style={{ display:'flex', flexDirection:'column', minHeight: 0 }}>
          <div ref={scrollerRef} style={{ flex: 1, overflowY:'auto', padding: 18, display:'flex', flexDirection:'column', gap: 14 }}>
            {chat.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'78%', display:'flex', alignItems:'flex-start', gap: 8, flexDirection: m.role==='user'?'row-reverse':'row' }}>
                  {m.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, borderRadius: 9999, background:'linear-gradient(135deg, #4259EE 0%, #8C9AF4 100%)',
                                  color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
                      <IconSparkles size={14}/>
                    </div>
                  )}
                  <div style={{
                    padding:'12px 14px', borderRadius: 10,
                    background: m.role==='user' ? '#4259EE' : '#F8F9FB',
                    color: m.role==='user' ? '#fff' : '#0D152C',
                    fontFamily:'Manrope', fontSize: 13, fontWeight: 500, lineHeight: 1.5,
                    border: m.role==='user' ? 0 : '1px solid #ECEDF3',
                  }}>
                    {m.kind === 'rich' ? m.render({ onOpenSku }) : m.text}
                  </div>
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9999, background:'linear-gradient(135deg, #4259EE 0%, #8C9AF4 100%)',
                              color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                  <IconSparkles size={14}/>
                </div>
                <div style={{ display:'flex', gap: 4, padding:'10px 14px', background:'#F8F9FB', borderRadius: 10, border:'1px solid #ECEDF3' }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: 9999, background:'#8C9AF4',
                                            animation:`pulseDot 1.2s ${i*0.2}s infinite ease-in-out` }}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: 14, borderTop:'1px solid #ECEDF3', display:'flex', gap: 8 }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && input.trim() && !thinking) ask(input.trim()); }}
              placeholder="Ask about SKUs, clusters, recommendations…"
              style={{
                flex: 1, padding:'10px 14px', border:'1px solid #D9DDE7', borderRadius: 8,
                fontFamily:'Manrope', fontSize: 13, fontWeight: 500, color:'#0D152C',
                outline:'none', background:'#fff',
              }}/>
            <Button variant="primary" disabled={!input.trim() || thinking} onClick={()=>ask(input.trim())} rightIcon={<IconArrowRight size={14}/>}>Send</Button>
          </div>
        </Card>

        {/* Suggestions column */}
        <Card padding={14} style={{ alignSelf:'stretch', display:'flex', flexDirection:'column' }}>
          <SectionHeader title="Try asking…" subtitle="Click any prompt"/>
          <div style={{ display:'flex', flexDirection:'column', gap: 8, flex:1, overflowY:'auto' }}>
            {COPILOT_QA.map((qa, i) => (
              <button key={i} onClick={()=>!thinking && ask(qa.q)}
                style={{
                  textAlign:'left', padding:'10px 12px', borderRadius: 8,
                  background:'#F8F9FB', border:'1px solid #ECEDF3',
                  cursor: thinking ? 'not-allowed' : 'pointer',
                  fontFamily:'Manrope', fontSize: 12.5, fontWeight: 600, color:'#1F2B4D',
                  lineHeight: 1.4, transition:'background 140ms, border-color 140ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#ECEEFD'; e.currentTarget.style.borderColor='#C5CFF9'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#F8F9FB'; e.currentTarget.style.borderColor='#ECEDF3'; }}>
                {qa.q}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: 10, background:'#F6F7FE', borderRadius: 6, fontFamily:'Manrope', fontSize: 11, color:'#1F2B4D', fontWeight: 500, lineHeight: 1.5 }}>
            Copilot reads from the same data sources as Hindsight, Peer Intelligence, and Recommendations.
          </div>
        </Card>
      </div>
    </div>
  );
};

// =================================================================
// Stubs that remain
// =================================================================
const SimpleStub = ({ title, breadcrumb, blurb, icon }) => (
  <div style={{ padding: 20 }}>
    <div style={{ marginBottom: 18 }}>
      {_os_breadcrumb(breadcrumb)}
      <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>{title}</h2>
    </div>
    <Card padding={48} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap: 14, textAlign:'center', minHeight: 320, background:'linear-gradient(180deg, #F8F9FB 0%, #fff 100%)' }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, background:'#ECEEFD', color:'#4259EE',
                    display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
      <div>
        <div style={{ fontFamily:'Manrope', fontWeight: 800, fontSize: 18, color:'#0D152C', marginBottom: 4 }}>{title}</div>
        <div style={{ fontFamily:'Manrope', fontSize: 13, color:'#60697D', fontWeight: 500, maxWidth: 480, margin:'0 auto' }}>{blurb}</div>
      </div>
    </Card>
  </div>
);

const POGScreen = () => <SimpleStub title="Master POG Management" breadcrumb={['Planogram Intelligence', 'Master POG Management']}
  blurb="Authoring layer for the planogram set used across the network." icon={<IconBlueprint size={28}/>}/>;
const QueueScreen = () => <SimpleStub title="Action Queue" breadcrumb={['Command Center', 'Action Queue']}
  blurb="Single chronological surface for everything that needs your attention." icon={<IconBolt size={28}/>}/>;
const CommsScreen = () => <SimpleStub title="Communications" breadcrumb={['Command Center', 'Communications']}
  blurb="HQ broadcasts, training updates, comms calendar." icon={<IconMail size={28}/>}/>;

// Admin — interactive role + threshold management
const AdminScreen = () => {
  const [users, setUsers] = React.useState([
    { name:'A. Patel', initials:'AP', email:'a.patel@floordecor.com', role:'AMS', store:'S0142 Atlanta', color:'#3BB273' },
    { name:'M. Chen', initials:'MC', email:'m.chen@floordecor.com', role:'AMM', store:'Southeast region', color:'#4259EE' },
    { name:'D. Rivera', initials:'DR', email:'d.rivera@floordecor.com', role:'CM', store:'Network · Tile & Stone', color:'#E1BC29' },
    { name:'J. Park', initials:'JP', email:'j.park@floordecor.com', role:'AMS', store:'S0455 Charlotte', color:'#8C9AF4' },
    { name:'R. Diaz', initials:'RD', email:'r.diaz@floordecor.com', role:'AMM', store:'West region', color:'#E74C67' },
  ]);
  const [thresh, setThresh] = React.useState({ confidence: 70, alertVolume: 'standard', autoApprove: false });
  const toast = useToast();
  const setRole = (i, role) => { setUsers(u => u.map((x, j) => j === i ? { ...x, role } : x)); toast({kind:'success', message:`Role updated to ${role}`}); };

  return (
    <div style={{ padding: 20 }}>
      {_os_breadcrumb(['Application Configuration', 'User Access Management'])}
      <div style={{ marginBottom: 18 }}>
        <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>User Access Management</h2>
        <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D', marginTop: 4 }}>
          Manage roles, alert thresholds, and recommendation auto-approval rules.
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Users · {users.length}</div>
              <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>Click a role to change it</div>
            </div>
            <Button variant="primary" size="sm" leftIcon={<IconPlus size={12}/>} onClick={()=>toast({kind:'info', message:'Invite flow coming soon'})}>Invite</Button>
          </div>
          {users.map((u, i) => (
            <div key={u.email} style={{ display:'grid', gridTemplateColumns:'40px 1.6fr 1.4fr 1fr 80px',
                                         padding:'12px 14px', alignItems:'center',
                                         borderBottom: i < users.length-1 ? '1px solid #F5F6FA' : 0, gap: 10 }}>
              <Avatar initials={u.initials} size={32} color={u.color}/>
              <div>
                <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>{u.name}</div>
                <div style={{ fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>{u.email}</div>
              </div>
              <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 600 }}>{u.store}</div>
              <div style={{ display:'flex', gap: 4 }}>
                {['AMS','AMM','CM'].map(r => (
                  <button key={r} onClick={()=>setRole(i, r)} style={{
                    padding:'4px 8px', borderRadius: 6, fontFamily:'Manrope', fontSize: 11, fontWeight: 700, cursor:'pointer',
                    background: u.role === r ? '#4259EE' : '#F5F6FA', color: u.role === r ? '#fff' : '#60697D',
                    border: u.role === r ? '1px solid #4259EE' : '1px solid #ECEDF3',
                  }}>{r}</button>
                ))}
              </div>
              <Button variant="ghost" size="xs" onClick={()=>toast({kind:'info', message:`Audit log for ${u.name}`})}>Audit</Button>
            </div>
          ))}
        </Card>

        <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
          <Card padding={16}>
            <SectionHeader title="Recommendation thresholds"/>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontFamily:'Manrope', fontSize: 11.5, fontWeight: 600, color:'#60697D' }}>Min confidence to surface (%)</label>
              <div style={{ display:'flex', alignItems:'center', gap: 12, marginTop: 6 }}>
                <input type="range" min={50} max={95} value={thresh.confidence}
                  onChange={e=>setThresh(t=>({...t, confidence: parseInt(e.target.value)}))}
                  style={{ flex: 1, accentColor:'#4259EE' }}/>
                <span style={{ fontFamily:'JetBrains Mono', fontSize: 14, fontWeight: 700, color:'#4259EE', width: 30, textAlign:'right' }}>{thresh.confidence}</span>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={{ fontFamily:'Manrope', fontSize: 11.5, fontWeight: 600, color:'#60697D' }}>Alert volume</label>
              <div style={{ display:'flex', gap: 6, marginTop: 6 }}>
                {['quiet','standard','verbose'].map(v => (
                  <button key={v} onClick={()=>setThresh(t=>({...t, alertVolume: v}))} style={{
                    flex: 1, padding:'6px 8px', borderRadius: 6, fontFamily:'Manrope', fontSize: 11.5, fontWeight: 700, cursor:'pointer',
                    background: thresh.alertVolume === v ? '#4259EE' : '#F5F6FA', color: thresh.alertVolume === v ? '#fff' : '#60697D',
                    border: thresh.alertVolume === v ? '1px solid #4259EE' : '1px solid #ECEDF3', textTransform:'capitalize',
                  }}>{v}</button>
                ))}
              </div>
            </div>
            <Divider style={{ margin:'14px 0' }}/>
            <Toggle checked={thresh.autoApprove} onChange={v=>setThresh(t=>({...t, autoApprove: v}))}
              label="Auto-approve ADD recommendations above 90% confidence"/>
            <div style={{ marginTop: 14, display:'flex', justifyContent:'flex-end' }}>
              <Button variant="primary" size="sm" leftIcon={<IconCheck size={12}/>} onClick={()=>toast({kind:'success', message:'Settings saved'})}>Save</Button>
            </div>
          </Card>
          <Card padding={16}>
            <SectionHeader title="Audit log" subtitle="Last 5 events"/>
            {[
              { who:'D. Rivera', what:'promoted CR-018 to live cluster set', when:'Jan 12, 14:02' },
              { who:'M. Chen',   what:'modified R-2037 (Ranch Pine) — hold one cycle', when:'Jan 11, 09:48' },
              { who:'A. Patel',  what:'shared 5-SKU review list with M. Chen', when:'Jan 10, 16:21' },
              { who:'M. Chen',   what:'escalated R-2036 (Vintage Tin) to CM', when:'Jan 10, 11:05' },
              { who:'D. Rivera', what:'changed alert threshold 65% → 70%', when:'Jan 9, 17:40' },
            ].map((e, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap: 2, padding:'8px 0',
                                    borderTop: i > 0 ? '1px solid #F5F6FA' : 0 }}>
                <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#0D152C', fontWeight: 500 }}>
                  <strong>{e.who}</strong> {e.what}
                </div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize: 10.5, color:'#60697D', fontWeight: 600 }}>{e.when}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DistrictScreen, StoreDeepDiveScreen, POGScreen, CopilotScreen, QueueScreen, CommsScreen, AdminScreen });
