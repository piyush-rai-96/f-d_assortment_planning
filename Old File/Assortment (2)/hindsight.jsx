// hindsight.jsx — Hindsight Analytics with filter bar, 3-group KPIs, TreeMap, Bubble Graph

const hs_breadcrumb = (path) => (
  <div style={{ display:'flex', alignItems:'center', gap: 10, fontFamily:'Manrope', fontSize: 11.5, fontWeight: 600, color:'#60697D', marginBottom: 6 }}>
    {path.map((p, i, arr) => (
      <React.Fragment key={i}>
        <span style={{ color: i === arr.length-1 ? '#1F2B4D' : '#60697D' }}>{p}</span>
        {i < arr.length-1 && <IconChevronRight size={11}/>}
      </React.Fragment>
    ))}
  </div>
);

// =================================================================
// FILTER BAR
// =================================================================

const FilterChip = ({ label, value, onClick, active }) => (
  <button onClick={onClick} style={{
    display:'inline-flex', alignItems:'center', gap: 6, padding:'6px 10px',
    background: active ? '#ECEEFD' : '#fff',
    border: `1px solid ${active ? '#4259EE' : '#D9DDE7'}`,
    borderRadius: 7, cursor:'pointer', fontFamily:'Manrope',
    fontSize: 11.5, fontWeight: 600, color: active ? '#4259EE' : '#1F2B4D',
    transition:'border-color 140ms, background 140ms',
  }}>
    <span style={{ fontWeight: 700, color:'#60697D', fontSize: 10.5, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</span>
    <span>{value}</span>
    <IconChevronDown size={11} style={{ color: active ? '#4259EE' : '#60697D' }}/>
  </button>
);

const HindsightFilterBar = ({ filters, setFilters }) => {
  const [open, setOpen] = React.useState(null);
  const close = () => setOpen(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest || !e.target.closest('[data-filter-popover]')) close();
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const setOne = (k, v) => { setFilters(f => ({ ...f, [k]: v })); close(); };

  return (
    <Card padding={0} style={{ marginBottom: 16 }}>
      <div data-filter-popover style={{ display:'flex', alignItems:'center', gap: 8, padding:'10px 14px', flexWrap:'wrap' }}>
        <IconFilter size={14} style={{ color:'#60697D' }}/>
        <span style={{ fontFamily:'Manrope', fontSize: 11, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em', marginRight: 4 }}>Filters</span>

        {/* Time period */}
        <div style={{ position:'relative' }}>
          <FilterChip label="Period" value={filters.period} active={open==='period'} onClick={()=>setOpen(o=>o==='period'?null:'period')}/>
          {open === 'period' && <FilterPopover>
            {['Last 13 weeks','Last 26 weeks','Last 52 weeks','Year to date','Trailing 3 years'].map(p =>
              <FilterOption key={p} active={p===filters.period} onClick={()=>setOne('period', p)}>{p}</FilterOption>
            )}
          </FilterPopover>}
        </div>

        {/* Cluster */}
        <div style={{ position:'relative' }}>
          <FilterChip label="Cluster" value={filters.cluster} active={open==='cluster'} onClick={()=>setOpen(o=>o==='cluster'?null:'cluster')}/>
          {open === 'cluster' && <FilterPopover>
            <FilterOption active={'All clusters'===filters.cluster} onClick={()=>setOne('cluster','All clusters')}>All clusters</FilterOption>
            {ACTIVE_CLUSTERS.map(c =>
              <FilterOption key={c.id} active={c.name===filters.cluster} onClick={()=>setOne('cluster', c.name)} dot={c.color}>{c.name}</FilterOption>
            )}
          </FilterPopover>}
        </div>

        {/* Category */}
        <div style={{ position:'relative' }}>
          <FilterChip label="Category" value={filters.category} active={open==='category'} onClick={()=>setOpen(o=>o==='category'?null:'category')}/>
          {open === 'category' && <FilterPopover>
            <FilterOption active={'All categories'===filters.category} onClick={()=>setOne('category','All categories')}>All categories</FilterOption>
            {['Tile','Wood','Stone','Installation','Decorative'].map(c =>
              <FilterOption key={c} active={c===filters.category} onClick={()=>setOne('category', c)} dot={CAT_COLOR[c]}>{c}</FilterOption>
            )}
          </FilterPopover>}
        </div>

        {/* Region */}
        <div style={{ position:'relative' }}>
          <FilterChip label="Region" value={filters.region} active={open==='region'} onClick={()=>setOpen(o=>o==='region'?null:'region')}/>
          {open === 'region' && <FilterPopover>
            {['All regions','Southeast','South Central','West','Midwest','Mid-Atlantic'].map(r =>
              <FilterOption key={r} active={r===filters.region} onClick={()=>setOne('region', r)}>{r}</FilterOption>
            )}
          </FilterPopover>}
        </div>

        {/* Customer */}
        <div style={{ position:'relative' }}>
          <FilterChip label="Customer" value={filters.customer} active={open==='customer'} onClick={()=>setOpen(o=>o==='customer'?null:'customer')}/>
          {open === 'customer' && <FilterPopover>
            {['All customers','Pro contractors','DIY consumers','Mixed'].map(c =>
              <FilterOption key={c} active={c===filters.customer} onClick={()=>setOne('customer', c)}>{c}</FilterOption>
            )}
          </FilterPopover>}
        </div>

        <div style={{ flex: 1 }}/>

        <Pill variant="info" size="sm" dot={false}>Updated 12 min ago</Pill>
        <Button variant="ghost" size="sm" leftIcon={<IconDownload size={12}/>}>Export</Button>
      </div>
    </Card>
  );
};

const FilterPopover = ({ children }) => (
  <div data-filter-popover style={{
    position:'absolute', top:'calc(100% + 6px)', left: 0, zIndex: 50,
    background:'#fff', border:'1px solid #D9DDE7', borderRadius: 10,
    boxShadow:'0 10px 28px rgba(13,21,44,.15)', minWidth: 200, padding: 6,
    animation:'fadeIn 140ms ease-out',
  }}>{children}</div>
);

const FilterOption = ({ children, active, onClick, dot }) => (
  <button onClick={onClick} style={{
    display:'flex', alignItems:'center', gap: 8, width:'100%', padding:'7px 10px',
    background: active ? '#ECEEFD' : 'transparent', border:0, cursor:'pointer',
    fontFamily:'Manrope', fontSize: 12, fontWeight: active ? 700 : 500,
    color: active ? '#4259EE' : '#1F2B4D',
    borderRadius: 6, textAlign:'left',
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8F9FB'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
    {dot && <span style={{ width: 8, height: 8, borderRadius: 9999, background: dot, flex:'0 0 auto' }}/>}
    <span style={{ flex: 1 }}>{children}</span>
    {active && <IconCheck size={12}/>}
  </button>
);

// =================================================================
// 3-GROUP KPI BLOCKS
// =================================================================

const KpiSparkRow = ({ kpis, accent }) => (
  <div style={{ display:'grid', gridTemplateColumns:`repeat(${kpis.length}, 1fr)`, gap: 0 }}>
    {kpis.map((k, i) => {
      const dir = k.deltaDir;
      return (
        <div key={k.label} style={{
          padding: '14px 16px',
          borderRight: i < kpis.length-1 ? '1px solid #ECEDF3' : 0,
        }}>
          <div style={{ fontFamily:'Manrope', fontSize: 11, fontWeight: 700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</div>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop: 6 }}>
            <span className="ia-kpi-value" style={{ fontSize: 22 }}>{k.value}</span>
            <Sparkline data={k.spark} width={56} height={20} color={accent}/>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap: 4, marginTop: 4,
                        fontFamily:'Manrope', fontSize: 11.5, fontWeight: 700,
                        color: dir === 'up' ? '#3BB273' : dir === 'down' ? '#E74C67' : '#60697D' }}>
            {dir === 'up' ? <IconArrowUp size={11}/> : dir === 'down' ? <IconArrowDown size={11}/> : null}
            <span>{k.delta}</span>
          </div>
        </div>
      );
    })}
  </div>
);

const KpiGroupBlock = ({ group }) => (
  <Card padding={0}>
    <div style={{ padding:'12px 16px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 10 }}>
      <span style={{ width: 4, height: 18, background: group.accent, borderRadius: 2 }}/>
      <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 13.5, color:'#0D152C' }}>{group.label}</div>
    </div>
    <KpiSparkRow kpis={group.kpis} accent={group.accent}/>
  </Card>
);

// =================================================================
// TREEMAP — squarified-ish layout via shelf packing
// =================================================================

const buildTreemap = (data, w, h) => {
  // Sum all leaf values
  const totals = data.map(cat => ({
    cat,
    sum: cat.children.reduce((s, c) => s + c.value, 0),
  }));
  const grandTotal = totals.reduce((s, t) => s + t.sum, 0);

  // Lay out categories left to right in proportional columns (variable height not needed since we want simple).
  // Actually use a simple binary slice layout for visual interest: alternate horizontal/vertical splits.
  const rects = [];
  let x = 0;
  totals.forEach((t, i) => {
    const colW = (t.sum / grandTotal) * w;
    // Within column, stack subcats by value
    let y = 0;
    const subTotal = t.sum;
    t.cat.children.forEach((sub, j) => {
      const subH = (sub.value / subTotal) * h;
      rects.push({
        x, y, w: colW, h: subH,
        cat: t.cat.cat, color: t.cat.color, name: sub.name,
        value: sub.value, winners: sub.winners, losers: sub.losers, stale: sub.stale,
      });
      y += subH;
    });
    x += colW;
  });
  return rects;
};

const HindsightTreemap = ({ onClick }) => {
  const W = 760, H = 320;
  const rects = React.useMemo(() => buildTreemap(HINDSIGHT_TREEMAP, W, H), []);
  const [hover, setHover] = React.useState(null);

  return (
    <Card padding={0}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Revenue contribution by category & subcategory</div>
          <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>Last 52 weeks · color = category · area = net sales · click any tile to drill</div>
        </div>
        <div style={{ display:'flex', gap: 8 }}>
          {Object.entries(CAT_COLOR).map(([k, v]) => (
            <span key={k} style={{ display:'inline-flex', alignItems:'center', gap: 5, fontFamily:'Manrope', fontSize: 11, fontWeight: 600, color:'#1F2B4D' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: v }}/>
              {k}
            </span>
          ))}
        </div>
      </div>
      <div style={{ position:'relative', padding: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height: 'auto', display:'block' }}>
          {rects.map((r, i) => {
            const isHover = hover === i;
            const winnerShare = r.winners / Math.max(1, r.winners + r.losers + r.stale);
            const opacity = 0.55 + winnerShare * 0.45;
            return (
              <g key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} onClick={()=>onClick && onClick(r)} style={{ cursor:'pointer' }}>
                <rect x={r.x+1.5} y={r.y+1.5} width={r.w-3} height={r.h-3}
                      fill={r.color} fillOpacity={opacity}
                      stroke={isHover ? '#0D152C' : '#fff'} strokeWidth={isHover ? 2 : 1.5}
                      rx={4}/>
                {r.w > 80 && r.h > 32 && (
                  <>
                    <text x={r.x + 10} y={r.y + 18} fontFamily="Manrope" fontWeight="700" fontSize={r.w > 140 ? 13 : 11} fill="#fff">
                      {r.name}
                    </text>
                    <text x={r.x + 10} y={r.y + 18 + (r.w > 140 ? 16 : 14)} fontFamily="JetBrains Mono" fontWeight="600" fontSize={r.w > 140 ? 11 : 10} fill="rgba(255,255,255,.9)">
                      ${r.value}M
                    </text>
                  </>
                )}
                {r.w > 80 && r.h > 60 && (
                  <text x={r.x + 10} y={r.y + r.h - 10} fontFamily="Manrope" fontWeight="600" fontSize={10} fill="rgba(255,255,255,.85)">
                    {r.winners}W · {r.losers}L · {r.stale}S
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover != null && (
          <div style={{
            position:'absolute', top: 12, right: 24, background:'#0F172A', color:'#fff',
            padding: '10px 12px', borderRadius: 8, fontFamily:'Manrope',
            boxShadow:'0 8px 24px rgba(13,21,44,.25)', minWidth: 180,
            pointerEvents:'none',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color:'#8C9AF4', textTransform:'uppercase', letterSpacing:'.06em' }}>{rects[hover].cat}</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{rects[hover].name}</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 6, color:'#E5E7F4', display:'flex', justifyContent:'space-between' }}>
              <span>Revenue</span><span style={{ fontFamily:'JetBrains Mono', fontWeight: 700 }}>${rects[hover].value}M</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 6, color:'#8C9AF4' }}>
              <span style={{color:'#3BB273'}}>{rects[hover].winners} winners</span> · <span style={{color:'#E74C67'}}>{rects[hover].losers} losers</span> · <span>{rects[hover].stale} stale</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// =================================================================
// BUBBLE GRAPH — sell-through (x) vs margin (y), bubble = revenue
// =================================================================

const HindsightBubble = ({ onClick }) => {
  const W = 760, H = 360, M = { l: 56, r: 24, t: 24, b: 48 };
  const innerW = W - M.l - M.r, innerH = H - M.t - M.b;
  const xMin = 20, xMax = 100, yMin = 25, yMax = 50;
  const xScale = v => M.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const yScale = v => M.t + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  const rMax = Math.sqrt(Math.max(...HINDSIGHT_BUBBLES.map(b => b.revenue)));
  const rScale = v => 6 + (Math.sqrt(v) / rMax) * 30;
  const [hover, setHover] = React.useState(null);

  // Quadrant labels (median margin & sell-through)
  const xMid = xScale(60), yMid = yScale(38);

  return (
    <Card padding={0}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #ECEDF3' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C' }}>Subcategory matrix · sell-through × margin</div>
            <div style={{ fontFamily:'Manrope', fontSize: 11.5, color:'#60697D', fontWeight: 500 }}>X = sell-through · Y = margin · bubble = 52w revenue · color = category</div>
          </div>
          <div style={{ display:'flex', gap: 12, fontFamily:'Manrope', fontSize: 11, fontWeight: 600 }}>
            {['Tile','Wood','Stone','Installation','Decorative'].map(k => (
              <span key={k} style={{ display:'inline-flex', alignItems:'center', gap: 5, color:'#1F2B4D' }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: CAT_COLOR[k] }}/>
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: 12, position:'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height: 'auto', display:'block' }}>
          {/* Grid */}
          {[30,40,50,60,70,80,90].map(t => (
            <line key={`vx-${t}`} x1={xScale(t)} x2={xScale(t)} y1={M.t} y2={M.t+innerH} stroke="#F5F6FA" strokeWidth="1"/>
          ))}
          {[30,35,40,45].map(t => (
            <line key={`vy-${t}`} y1={yScale(t)} y2={yScale(t)} x1={M.l} x2={M.l+innerW} stroke="#F5F6FA" strokeWidth="1"/>
          ))}
          {/* Quadrant divider — median lines */}
          <line x1={xMid} x2={xMid} y1={M.t} y2={M.t+innerH} stroke="#D9DDE7" strokeWidth="1" strokeDasharray="3 3"/>
          <line y1={yMid} y2={yMid} x1={M.l} x2={M.l+innerW} stroke="#D9DDE7" strokeWidth="1" strokeDasharray="3 3"/>

          {/* Quadrant labels */}
          <text x={M.l + innerW - 10} y={M.t + 16} textAnchor="end" fontFamily="Manrope" fontWeight="700" fontSize="10" fill="#3BB273" letterSpacing=".06em">★ HEROES — high sell-through, high margin</text>
          <text x={M.l + 10} y={M.t + 16} fontFamily="Manrope" fontWeight="700" fontSize="10" fill="#E1BC29" letterSpacing=".06em">PRESTIGE — low velocity, high margin</text>
          <text x={M.l + innerW - 10} y={M.t + innerH - 10} textAnchor="end" fontFamily="Manrope" fontWeight="700" fontSize="10" fill="#4259EE" letterSpacing=".06em">VOLUME — high velocity, low margin</text>
          <text x={M.l + 10} y={M.t + innerH - 10} fontFamily="Manrope" fontWeight="700" fontSize="10" fill="#E74C67" letterSpacing=".06em">EXIT REVIEW — low both</text>

          {/* Axes */}
          <line x1={M.l} x2={M.l+innerW} y1={M.t+innerH} y2={M.t+innerH} stroke="#1F2B4D" strokeWidth="1"/>
          <line x1={M.l} x2={M.l} y1={M.t} y2={M.t+innerH} stroke="#1F2B4D" strokeWidth="1"/>

          {/* X ticks */}
          {[20,40,60,80,100].map(t => (
            <g key={`xt-${t}`}>
              <text x={xScale(t)} y={M.t+innerH+18} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#60697D">{t}%</text>
            </g>
          ))}
          {/* Y ticks */}
          {[25,30,35,40,45,50].map(t => (
            <g key={`yt-${t}`}>
              <text x={M.l-10} y={yScale(t)+4} textAnchor="end" fontFamily="JetBrains Mono" fontSize="10" fill="#60697D">{t}%</text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={M.l + innerW/2} y={H-10} textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="11" fill="#1F2B4D">Sell-through →</text>
          <text x={-(M.t + innerH/2)} y={16} transform="rotate(-90)" textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize="11" fill="#1F2B4D">Margin →</text>

          {/* Bubbles */}
          {HINDSIGHT_BUBBLES.map((b, i) => {
            const cx = xScale(b.sellThrough), cy = yScale(b.margin), r = rScale(b.revenue);
            const color = CAT_COLOR[b.cat];
            const isHover = hover === i;
            return (
              <g key={b.name} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} onClick={()=>onClick && onClick(b)} style={{cursor:'pointer'}}>
                <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={isHover ? 0.55 : 0.35}
                        stroke={color} strokeWidth={isHover ? 2.5 : 1.5}/>
                {(isHover || r >= 18) && (
                  <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="Manrope" fontWeight="700" fontSize={r >= 22 ? 11 : 10} fill="#0D152C">
                    {b.name.length > 16 ? b.name.split(' ')[0] : b.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hover != null && (
          <div style={{
            position:'absolute', top: 24, right: 32, background:'#0F172A', color:'#fff',
            padding: '12px 14px', borderRadius: 8, fontFamily:'Manrope',
            boxShadow:'0 8px 24px rgba(13,21,44,.25)', minWidth: 200,
            pointerEvents:'none', borderLeft: `3px solid ${CAT_COLOR[HINDSIGHT_BUBBLES[hover].cat]}`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color:'#8C9AF4', textTransform:'uppercase', letterSpacing:'.06em' }}>{HINDSIGHT_BUBBLES[hover].cat}</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{HINDSIGHT_BUBBLES[hover].name}</div>
            <div style={{ fontSize: 11.5, marginTop: 8, color:'#E5E7F4', display:'flex', flexDirection:'column', gap: 3 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span>Sell-through</span><span style={{ fontFamily:'JetBrains Mono', fontWeight: 700 }}>{HINDSIGHT_BUBBLES[hover].sellThrough}%</span></div>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span>Margin</span><span style={{ fontFamily:'JetBrains Mono', fontWeight: 700 }}>{HINDSIGHT_BUBBLES[hover].margin}%</span></div>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span>Revenue (52w)</span><span style={{ fontFamily:'JetBrains Mono', fontWeight: 700 }}>${HINDSIGHT_BUBBLES[hover].revenue}M</span></div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color:
                HINDSIGHT_BUBBLES[hover].classification === 'Winner' ? '#3BB273'
                : HINDSIGHT_BUBBLES[hover].classification === 'Loser' ? '#E74C67' : '#E1BC29',
              marginTop: 6, textTransform:'uppercase', letterSpacing:'.06em' }}>
              {HINDSIGHT_BUBBLES[hover].classification}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// =================================================================
// MAIN HINDSIGHT SCREEN
// =================================================================

const HindsightScreen = ({ onOpenSku }) => {
  const [filters, setFilters] = React.useState({
    period: 'Last 52 weeks',
    cluster: 'All clusters',
    category: 'All categories',
    region: 'All regions',
    customer: 'All customers',
  });
  const toast = useToast();

  return (
    <div style={{ padding: 20 }}>
      {hs_breadcrumb(['Assortment Intelligence', 'Hindsight Analytics'])}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 14, gap: 16, flexWrap:'wrap' }}>
        <div>
          <h2 className="ia" style={{ margin: 0, fontSize: 24 }}>Hindsight Analytics</h2>
          <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 13, color:'#60697D', marginTop: 4 }}>
            3-year history · refreshes weekly with PLR cycle · 4,412 SKUs in scope
          </div>
        </div>
        <div style={{ display:'flex', gap: 8 }}>
          <Button variant="secondary" leftIcon={<IconRefresh size={14}/>}>Re-run analysis</Button>
          <Button variant="primary" leftIcon={<IconArrowRight size={14}/>} onClick={() => toast({kind:'info', message:'Sent 14 winner SKUs to Recommendations queue'})}>Send winners to Recs</Button>
        </div>
      </div>

      <HindsightFilterBar filters={filters} setFilters={setFilters}/>

      {/* 3-group KPI blocks */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap: 12, marginBottom: 16 }}>
        {HINDSIGHT_KPI_GROUPS.map(g => <KpiGroupBlock key={g.id} group={g}/>)}
      </div>

      {/* Visualisations */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap: 16 }}>
        <HindsightTreemap onClick={(r) => toast({kind:'info', message:`Drilling into ${r.cat} → ${r.name}`})}/>
        <HindsightBubble  onClick={(b) => toast({kind:'info', message:`Drilling into ${b.cat} → ${b.name}`})}/>
      </div>
    </div>
  );
};

Object.assign(window, { HindsightScreen });
