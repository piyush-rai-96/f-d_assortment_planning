// peer.jsx — Peer Intelligence: Peer Comparison + SKU Opportunity Explorer (HERO)

const PeerComparisonView = ({ category, onCategoryChange, onOpenSku, density='comfy', showConfidence=true }) => {
  const cats = CATEGORIES;
  const compactPad = density === 'compact' ? 6 : 10;
  const toast = useToast();
  const [reviewList, setReviewList] = React.useState(new Set());
  const [exitFlags, setExitFlags] = React.useState(new Set());
  const addToReview = (sku) => {
    setReviewList(s => { const ns = new Set(s); ns.add(sku.id); return ns; });
    toast({kind:'success', message:`${sku.name} added to Review List`});
  };
  const addAllWinners = () => {
    const wins = SKUS.filter(s => s.flag === 'network-win');
    setReviewList(s => { const ns = new Set(s); wins.forEach(w => ns.add(w.id)); return ns; });
    toast({kind:'success', message:`${wins.length} Network Winners added to Review List`});
  };
  const flagExit = (sku) => {
    setExitFlags(s => { const ns = new Set(s); ns.add(sku.id); return ns; });
    toast({kind:'info', message:`${sku.name} flagged for exit review`});
  };
  const flagAllExits = () => {
    const losers = SKUS.filter(s => s.flag === 'network-loser' || s.flag === 'stale');
    setExitFlags(s => { const ns = new Set(s); losers.forEach(l => ns.add(l.id)); return ns; });
    toast({kind:'info', message:`${losers.length} SKUs flagged for exit review`});
  };

  // Per-SKU table: filter by category
  const filteredSkus = SKUS.filter(s =>
    !category || category === 'all' ||
    s.cat.toLowerCase().includes(cats.find(c=>c.id===category)?.name.toLowerCase().split(' ')[0]||'')
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      {/* Page header */}
      <div style={{ padding:'18px 20px 0', display:'flex', alignItems:'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10, fontFamily:'Manrope', fontSize: 11.5, fontWeight: 600, color:'#60697D', marginBottom: 6 }}>
            <span>Assortment Intelligence</span>
            <IconChevronRight size={11}/>
            <span style={{ color:'#1F2B4D' }}>Peer Intelligence</span>
            <span style={{ color:'#D9DDE7' }}>·</span>
            <Pill variant="review" size="sm" dot={false}>Stage 2</Pill>
          </div>
          <h2 className="ia" style={{ margin: 0, fontSize: 24, letterSpacing:'-0.01em' }}>Peer Comparison</h2>
          <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D', marginTop: 4 }}>
            Atlanta — Buckhead (S0142) <span style={{color:'#D9DDE7'}}>·</span> compared to <span style={{color:'#4259EE', fontWeight:600}}>Pro-Heavy South</span> cluster (18 stores)
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <Button variant="secondary" size="sm" leftIcon={<IconDownload size={13}/>}>Export</Button>
          <Button variant="secondary" size="sm" leftIcon={<IconFilter size={13}/>}>Filters</Button>
          <Button variant="primary" size="sm" leftIcon={<IconPlus size={13}/>} onClick={addAllWinners}>Add to Review List ({reviewList.size})</Button>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ padding:'14px 20px 0', display:'flex', alignItems:'center', gap: 8, flexWrap:'wrap' }}>
        <span style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 11, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', marginRight: 4 }}>Category</span>
        {[{id:'all', name:'All'}, ...cats].map(c => {
          const active = (category||'all') === c.id;
          return (
            <button key={c.id} onClick={()=>onCategoryChange(c.id)} style={{
              padding:'5px 12px', borderRadius: 9999,
              background: active ? '#4259EE' : '#fff',
              color: active ? '#fff' : '#1F2B4D',
              border: `1px solid ${active ? '#4259EE' : '#D9DDE7'}`,
              fontFamily:'Manrope', fontWeight: 600, fontSize: 12, cursor:'pointer',
              transition:'all 150ms', display:'inline-flex', alignItems:'center', gap: 6,
            }}>
              {c.name}
              {c.skuCount && <span style={{ fontSize: 10, opacity: .7 }}>{c.skuCount.toLocaleString()}</span>}
            </button>
          );
        })}
      </div>

      {/* My Store vs Cluster — 4 KPI comparison cards */}
      <div style={{ padding:'14px 20px 0' }}>
        <Card padding={0}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 10 }}>
            <SectionHeader
              icon={<IconUsers size={16}/>}
              title="My Store vs Cluster"
              subtitle="Tile category — 1,247 SKUs network-wide"
              style={{ marginBottom: 0, flex: 1 }}
            />
            <Pill variant="info" size="sm" dot={false}>Macro · Pro-Heavy South</Pill>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', borderBottom:'1px solid #F5F6FA' }}>
            <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 11, fontWeight:700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>Metric</div>
            <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 11, fontWeight:700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', textAlign:'right' }}>My Store</div>
            <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 11, fontWeight:700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', textAlign:'right' }}>Cluster Avg</div>
            <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 11, fontWeight:700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', textAlign:'right' }}>Top Quartile</div>
          </div>
          {[
            { metric:'# SKUs carried', a: '1,047', b: '1,128', c: '1,212', a_dir:'down' },
            { metric:'Avg sell-through rate', a: '64.2%', b: '67.1%', c: '74.8%', a_dir:'down' },
            { metric:'# Winners carried', a: '188', b: '212', c: '241', a_dir:'down' },
            { metric:'# Network Winners not carried', a: '24', b: '—', c: '—', a_dir:'down', highlight: 'win' },
            { metric:'# Losers still carried', a: '31', b: '24', c: '—', a_dir:'down', highlight: 'loser' },
            { metric:'Trapped capital estimate', a: '$184k', b: '$148k', c: '—', a_dir:'down', highlight: 'loser' },
          ].map((r, i, arr) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
              borderBottom: i < arr.length - 1 ? '1px solid #F5F6FA' : 0,
              background: r.highlight === 'win' ? '#F8FBF6' : r.highlight === 'loser' ? '#FEF8F8' : '#fff',
            }}>
              <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 12.5, fontWeight: 600, color:'#0D152C' }}>{r.metric}</div>
              <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 13, fontWeight: 700, color:'#0D152C', textAlign:'right', fontFeatureSettings:'"tnum"', display:'flex', alignItems:'center', justifyContent:'flex-end', gap: 4 }}>
                {r.a}
                {r.highlight === 'win' && <IconArrowUp size={12} style={{color:'#3BB273'}}/>}
                {r.highlight === 'loser' && <IconArrowDown size={12} style={{color:'#E74C67'}}/>}
              </div>
              <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 13, fontWeight: 600, color:'#60697D', textAlign:'right', fontFeatureSettings:'"tnum"' }}>{r.b}</div>
              <div style={{ padding:'10px 16px', fontFamily:'Manrope', fontSize: 13, fontWeight: 600, color:'#60697D', textAlign:'right', fontFeatureSettings:'"tnum"' }}>{r.c}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* SKU drill-downs — two columns */}
      <div style={{ padding:'16px 20px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
        {/* Network Winners Not Carried */}
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background:'#E7F6EC', color:'#217A4C',
                          display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
              <IconArrowUp size={14}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>Network Winners — Not Carried</div>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>Ranked by est. revenue opportunity</div>
            </div>
            <Pill variant="winner" size="sm">24</Pill>
          </div>
          <div>
            {SKUS.filter(s => s.flag === 'network-win').map((s, i, arr) => {
              const inList = reviewList.has(s.id);
              return (
              <div key={s.id} onClick={()=>onOpenSku(s)} style={{
                padding:'12px 14px', borderBottom: i < arr.length-1 ? '1px solid #F5F6FA' : 0,
                cursor:'pointer', display:'flex', gap: 10, alignItems:'flex-start',
                background: inList ? '#F8FBF6' : 'transparent', transition:'background 140ms',
              }}
              onMouseEnter={e=>{ if(!inList) e.currentTarget.style.background='#F8F9FB'; }}
              onMouseLeave={e=>{ if(!inList) e.currentTarget.style.background='transparent'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 10, color:'#60697D', fontFeatureSettings:'"tnum"' }}>{s.id}</span>
                    <span style={{color:'#D9DDE7', fontSize: 10}}>·</span>
                    <span style={{ fontFamily:'Manrope', fontSize: 10, color:'#60697D', fontWeight: 500 }}>{s.sub}</span>
                  </div>
                  <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap: 12, fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>
                    <span><strong style={{color:'#0D152C'}}>{s.peerCarry}%</strong> peers carry</span>
                    <span><strong style={{color:'#3BB273'}}>{s.peerST}%</strong> sell-through</span>
                    <span style={{display:'inline-flex', alignItems:'center', gap: 4}}>
                      <Sparkline data={s.trend} width={48} height={16} color="#3BB273" fill="#3BB273"/>
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 4, flex:'0 0 auto' }}>
                  <span style={{ fontFamily:'Manrope', fontWeight: 800, fontSize: 13, color:'#217A4C', fontFeatureSettings:'"tnum"' }}>+${(s.revOpp/1000).toFixed(0)}k</span>
                  {showConfidence && <ConfidenceBar score={s.confidence} width={50}/>}
                  <button onClick={e=>{e.stopPropagation(); addToReview(s);}} disabled={inList} style={{
                    background: inList ? '#E7F6EC' : '#fff', border: inList ? '1px solid #B6E0C4' : '1px solid #B6E0C4',
                    color:'#217A4C', fontFamily:'Manrope', fontWeight: 700, fontSize: 10,
                    padding:'2px 8px', borderRadius: 9999, cursor: inList ? 'default' : 'pointer',
                    display:'inline-flex', alignItems:'center', gap: 4, transition:'background 140ms',
                  }}>
                    {inList ? (<><IconCheck size={10}/> Added</>) : (<><IconPlus size={10}/> Review</>)}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
          <div style={{ padding:'10px 14px', borderTop:'1px solid #ECEDF3', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Button variant="ghost" size="sm" rightIcon={<IconArrowRight size={12}/>}>View all 24</Button>
            <Button variant="outline" size="sm" leftIcon={<IconBookmark size={12}/>} onClick={addAllWinners}>Add all to Review List</Button>
          </div>
        </Card>

        {/* Losers Still Carried */}
        <Card padding={0}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background:'#FDECF2', color:'#B42543',
                          display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
              <IconArrowDown size={14}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>Losers — Still Carried</div>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>Ranked by trapped capital</div>
            </div>
            <Pill variant="loser" size="sm">31</Pill>
          </div>
          <div>
            {SKUS.filter(s => s.flag === 'network-loser' || s.flag === 'stale').map((s, i, arr) => (
              <div key={s.id} onClick={()=>onOpenSku(s)} style={{
                padding:'12px 14px', borderBottom: i < arr.length-1 ? '1px solid #F5F6FA' : 0,
                cursor:'pointer', display:'flex', gap: 10, alignItems:'flex-start',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 10, color:'#60697D', fontFeatureSettings:'"tnum"' }}>{s.id}</span>
                    <span style={{color:'#D9DDE7', fontSize: 10}}>·</span>
                    <span style={{ fontFamily:'Manrope', fontSize: 10, color:'#60697D', fontWeight: 500 }}>{s.sub}</span>
                    {s.flag === 'stale' && <Pill variant="stale" size="sm">Stale</Pill>}
                  </div>
                  <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap: 12, fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 500 }}>
                    <span><strong style={{color:'#B42543'}}>{s.weeksAtLoser}w</strong> at status</span>
                    <span><strong style={{color:'#0D152C'}}>{s.plrCycles}</strong> PLR cycles</span>
                    <Sparkline data={s.trend} width={48} height={16} color="#E74C67" fill="#E74C67"/>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 4, flex:'0 0 auto' }}>
                  <span style={{ fontFamily:'Manrope', fontWeight: 800, fontSize: 13, color:'#B42543', fontFeatureSettings:'"tnum"' }}>−${(s.trapped/1000).toFixed(1)}k</span>
                  {showConfidence && <ConfidenceBar score={s.confidence} width={50}/>}
                  <button onClick={e=>{e.stopPropagation(); flagExit(s);}} disabled={exitFlags.has(s.id)} style={{
                    background: exitFlags.has(s.id) ? '#FDECF2' : '#fff', border:'1px solid #F1BFC0', color:'#B42543',
                    fontFamily:'Manrope', fontWeight: 700, fontSize: 10, padding:'2px 8px', borderRadius: 9999,
                    cursor: exitFlags.has(s.id) ? 'default' : 'pointer', display:'inline-flex', alignItems:'center', gap: 4,
                  }}>
                    {exitFlags.has(s.id) ? (<><IconCheck size={10}/> Flagged</>) : (<><IconFlag size={10}/> Flag for exit</>)}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:'10px 14px', borderTop:'1px solid #ECEDF3', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Button variant="ghost" size="sm" rightIcon={<IconArrowRight size={12}/>}>View all 31</Button>
            <Button variant="outline" size="sm" leftIcon={<IconFlag size={12}/>} onClick={flagAllExits}>Flag all for exit review</Button>
          </div>
        </Card>
      </div>

      {/* Cluster heatmap variance */}
      <div style={{ padding:'0 20px 20px' }}>
        <Card padding={0}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background:'#ECEEFD', color:'#4259EE',
                          display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
              <IconNetwork size={14}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13, color:'#0D152C' }}>Cross-Store Sell-Through Variance</div>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D' }}>Pro-Heavy South · 18 stores · 5 categories</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 6, fontFamily:'Manrope', fontSize: 10, color:'#60697D', fontWeight: 600 }}>
              <span>Low</span>
              <div style={{ width: 80, height: 8, borderRadius: 9999, background:'linear-gradient(90deg, #FDECF2, #FFFAD6, #F5F6FA, #ECEEFD, #DBE0FB)'}}/>
              <span>High</span>
            </div>
          </div>
          {/* Heatmap grid */}
          <div style={{ padding: 16, overflowX:'auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'160px repeat(6, 1fr)', gap: 4, minWidth: 800 }}>
              <div/>
              {STORES.slice(0,6).map(st => (
                <div key={st.id} style={{ fontFamily:'Manrope', fontSize: 10, fontWeight: 600, color:'#60697D', textAlign:'center', padding: 4 }}>
                  {st.name.split(' — ')[1] || st.name}
                  <div style={{ fontSize: 9, color:'#B4BAC7', fontWeight: 500 }}>{st.id}</div>
                </div>
              ))}
              {CATEGORIES.map((c, ci) => (
                <React.Fragment key={c.id}>
                  <div style={{ fontFamily:'Manrope', fontSize: 12, fontWeight: 600, color:'#0D152C', padding: 8, display:'flex', alignItems:'center', gap: 6 }}>
                    <span style={{ color:'#4259EE', fontSize: 14 }}>{c.icon}</span>
                    {c.name}
                  </div>
                  {STORES.slice(0,6).map((st, si) => {
                    // deterministic pseudo-value
                    const v = ((ci * 37 + si * 13) % 100) / 100;
                    const myStore = st.id === 'S0142';
                    const pct = Math.round(40 + v * 50);
                    return (
                      <div key={st.id} style={{
                        background: heatColor(v, 1),
                        border: myStore ? '2px solid #4259EE' : '1px solid #ECEDF3',
                        borderRadius: 6, padding: '8px 4px', textAlign:'center',
                        fontFamily:'Manrope', fontSize: 12, fontWeight: 700, color:'#0D152C', fontFeatureSettings:'"tnum"',
                        position:'relative',
                      }}>
                        {pct}%
                        {myStore && <span style={{ position:'absolute', top:-7, right:-7, background:'#4259EE', color:'#fff', fontSize: 8, padding:'1px 4px', borderRadius:9999, fontWeight: 700 }}>YOU</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// SKU Detail drawer
const SkuDetailDrawer = ({ sku, onClose }) => {
  if (!sku) return null;
  return (
    <div style={{
      position:'fixed', top: 0, right: 0, bottom: 0, width: 480, background:'#fff',
      borderLeft:'1px solid #D9DDE7', boxShadow:'-12px 0 24px rgba(13,21,44,.12)',
      zIndex: 80, display:'flex', flexDirection:'column',
      animation: 'slideInRight 200ms ease-out',
    }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 10 }}>
        <Pill variant={sku.flag==='network-win'?'winner':sku.flag==='network-loser'||sku.flag==='stale'?'loser':'emerging'} size="sm">
          {sku.flag === 'network-win' ? 'Network Win' : sku.flag === 'network-loser' ? 'Network Loser' : sku.flag === 'stale' ? 'Stale' : 'Emerging'}
        </Pill>
        <div style={{ flex: 1, fontFamily:'Manrope', fontWeight: 600, fontSize: 11, color:'#60697D', fontFeatureSettings:'"tnum"' }}>{sku.id}</div>
        <IconButton onClick={onClose}><IconX size={16}/></IconButton>
      </div>
      <div style={{ padding: 18, overflow:'auto', flex: 1 }}>
        <h3 className="ia" style={{ margin: '0 0 4px', fontSize: 18 }}>{sku.name}</h3>
        <div style={{ fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 500, marginBottom: 14 }}>
          {sku.cat} · {sku.sub} {sku.supplier && <>· Supplier: <strong style={{color:'#0D152C'}}>{sku.supplier}</strong></>}
        </div>

        {/* Big trend */}
        <Card padding={14} style={{ background:'#F8F9FB', marginBottom: 14 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 8, marginBottom: 8 }}>
            <span className="ia-kpi-value" style={{ fontSize: 28 }}>{sku.peerST||64}%</span>
            <span style={{ fontFamily:'Manrope', fontSize: 12, color:'#60697D', fontWeight: 600 }}>peer sell-through · 12-week trend</span>
          </div>
          <Sparkline data={sku.trend} width={420} height={72} color="#4259EE" fill="#4259EE" strokeWidth={2}/>
        </Card>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { l:'Cluster carry rate', v:`${sku.peerCarry}%` },
            { l:'Classification', v: sku.classification },
            { l:'Pro/DIY split', v: sku.proSplit },
            { l:'Confidence', v: `${sku.confidence}/100` },
            { l: sku.flag==='network-win' ? 'Est. revenue opportunity' : 'Est. trapped / risk',
              v: sku.flag==='network-win' ? `+$${(sku.revOpp/1000).toFixed(0)}k/yr` : `−$${((sku.trapped||Math.abs(sku.revOpp||0))/1000).toFixed(1)}k` },
            { l:'Cycles at status', v: sku.plrCycles ? `${sku.plrCycles} PLR · ${sku.weeksAtLoser}w` : '—' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'10px 12px', background:'#F8F9FB', borderRadius: 6, border:'1px solid #ECEDF3' }}>
              <div className="ia-kpi-label">{s.l}</div>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C', marginTop: 2, fontFeatureSettings:'"tnum"' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Confidence breakdown */}
        <Card padding={12} style={{ marginBottom: 14 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 10 }}>
            <IconInfo size={14} style={{color:'#4259EE'}}/>
            <span style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 12, color:'#0D152C' }}>Confidence breakdown</span>
            <span style={{ marginLeft:'auto', fontFamily:'Manrope', fontWeight: 800, fontSize: 16, color:'#217A4C', fontFeatureSettings:'"tnum"' }}>{sku.confidence}</span>
          </div>
          {[
            { label:'Data completeness', score: 92 },
            { label:'Peer agreement strength', score: sku.peerCarry },
            { label:'Trend significance (4w)', score: 78 },
            { label:'Annotation overrides', score: 88, note:'No overrides' },
          ].map((b, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap: 10, padding:'4px 0' }}>
              <span style={{ flex: 1, fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>{b.label}</span>
              <ConfidenceBar score={b.score} width={120}/>
            </div>
          ))}
        </Card>

        {/* Action buttons */}
        <div style={{ display:'flex', gap: 8, marginBottom: 14 }}>
          {sku.flag === 'network-win' && (
            <Button variant="primary" leftIcon={<IconBookmark size={14}/>} style={{flex:1, justifyContent:'center'}}>Add to Review List</Button>
          )}
          {(sku.flag === 'network-loser' || sku.flag === 'stale') && (
            <Button variant="destructive" leftIcon={<IconFlag size={14}/>} style={{flex:1, justifyContent:'center'}}>Flag for Exit Review</Button>
          )}
          <Button variant="secondary" leftIcon={<IconExternal size={14}/>}>PIM</Button>
        </div>

        {/* Disagree */}
        <Card padding={12} style={{background:'#FFFAD6', border:'1px solid #FFDD6B'}}>
          <div style={{ display:'flex', alignItems:'center', gap: 6, marginBottom: 4 }}>
            <IconWarning size={13} style={{color:'#8A6E00'}}/>
            <span style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 12, color:'#8A6E00' }}>Disagree with this signal?</span>
          </div>
          <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#8A6E00', fontWeight: 500, marginBottom: 8, lineHeight: 1.5 }}>
            Add local context. DA team reviews disagreements weekly.
          </div>
          <Button variant="secondary" size="sm" leftIcon={<IconMessage size={12}/>}>Disagree with reason</Button>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { PeerComparisonView, SkuDetailDrawer });
