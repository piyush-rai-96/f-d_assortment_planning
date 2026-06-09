// command-palette.jsx — ⌘K command palette (search SKUs, navigate, run actions)

const CommandPalette = ({ open, onClose, onNavigate, onOpenSku }) => {
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) { setQ(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const navOptions = [
    { kind:'nav', id:'home', label:'Home', sub:'Dashboard', icon:<IconHome size={14}/> },
    { kind:'nav', id:'peer', label:'Peer Intelligence', sub:'Stage 2 hero', icon:<IconUsers size={14}/> },
    { kind:'nav', id:'recs', label:'Category Recommendations', sub:'PLR-2026-W18', icon:<IconLayers size={14}/> },
    { kind:'nav', id:'hindsight', label:'Hindsight Analytics', sub:'Reports', icon:<IconChart size={14}/> },
    { kind:'nav', id:'district', label:'District Intelligence', sub:'Cross-store ranking', icon:<IconNetwork size={14}/> },
    { kind:'nav', id:'store', label:'Store Deep Dive', sub:'S0142', icon:<IconStore size={14}/> },
    { kind:'nav', id:'clustering', label:'Clustering', sub:'5 clusters · live', icon:<IconNetwork size={14}/> },
    { kind:'nav', id:'copilot', label:'AI Copilot', sub:'Ask anything', icon:<IconSparkles size={14}/> },
  ];
  const skuOptions = SKUS.map(s => ({
    kind:'sku', id:s.id, label:s.name, sub:`${s.id} · ${s.cat} · ${s.sub}`,
    icon:<IconBox size={14}/>, sku: s,
    flag: s.flag,
  }));
  const actionOptions = [
    { kind:'action', id:'add-review', label:'Add to Review List', sub:'Flag selected SKUs', icon:<IconBookmark size={14}/> },
    { kind:'action', id:'export', label:'Export current view as CSV', sub:'Download', icon:<IconDownload size={14}/> },
    { kind:'action', id:'refresh', label:'Refresh data sync', sub:'Last 12 min ago', icon:<IconRefresh size={14}/> },
  ];

  const all = [...navOptions, ...skuOptions, ...actionOptions];
  const filtered = q
    ? all.filter(o => o.label.toLowerCase().includes(q.toLowerCase()) || (o.sub||'').toLowerCase().includes(q.toLowerCase()))
    : [...navOptions, ...skuOptions.slice(0, 4), ...actionOptions];

  const groups = {};
  filtered.forEach(o => { (groups[o.kind] = groups[o.kind] || []).push(o); });
  const orderedKinds = ['nav','sku','action'].filter(k => groups[k]?.length);
  const flatList = orderedKinds.flatMap(k => groups[k]);
  const safeIdx = Math.min(idx, Math.max(0, flatList.length - 1));

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(flatList.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = flatList[safeIdx];
      if (!sel) return;
      if (sel.kind === 'nav') onNavigate(sel.id);
      else if (sel.kind === 'sku') onOpenSku(sel.sku);
      onClose();
    }
  };

  if (!open) return null;
  const KIND_LABELS = { nav:'Pages', sku:'SKUs', action:'Actions' };

  let runningIdx = -1;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(13,21,44,.45)', backdropFilter:'blur(4px)',
      zIndex: 150, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop: '12vh',
      animation:'fadeIn 150ms ease-out',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff', width: 580, maxHeight:'70vh',
        borderRadius: 12, boxShadow:'0 24px 64px rgba(13,21,44,.32)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        border:'1px solid #E0E2EE',
        animation:'paletteIn 180ms cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10, padding:'14px 16px', borderBottom:'1px solid #ECEDF3' }}>
          <IconSearch size={18} style={{color:'#60697D', flex:'0 0 auto'}}/>
          <input ref={inputRef} value={q} onChange={e=>{setQ(e.target.value); setIdx(0);}} onKeyDown={onKey}
            placeholder="Search SKUs, navigate, run an action…"
            style={{
              flex: 1, border: 0, outline:'none', fontFamily:'Manrope', fontSize: 15, fontWeight: 500,
              color:'#0D152C', background:'transparent',
            }}/>
          <Kbd>esc</Kbd>
        </div>
        <div style={{ flex: 1, overflowY:'auto', padding: 6 }}>
          {orderedKinds.length === 0 ? (
            <div style={{ padding:'40px 16px', textAlign:'center', fontFamily:'Manrope', fontSize: 13, color:'#60697D', fontWeight: 500 }}>
              No results for "{q}"
            </div>
          ) : orderedKinds.map(k => (
            <div key={k} style={{ padding: 4 }}>
              <div style={{ padding:'8px 10px 4px', fontFamily:'Manrope', fontSize: 10, fontWeight: 700,
                            color:'#60697D', textTransform:'uppercase', letterSpacing:'.08em' }}>{KIND_LABELS[k]}</div>
              {groups[k].map(o => {
                runningIdx++;
                const active = runningIdx === safeIdx;
                return (
                  <div key={o.id+o.kind} onMouseEnter={() => setIdx(runningIdx)}
                    onClick={() => {
                      if (o.kind === 'nav') onNavigate(o.id);
                      else if (o.kind === 'sku') onOpenSku(o.sku);
                      onClose();
                    }}
                    style={{
                      display:'flex', alignItems:'center', gap: 12,
                      padding:'9px 12px', borderRadius: 7, cursor:'pointer',
                      background: active ? '#ECEEFD' : 'transparent',
                      transition:'background 100ms',
                    }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 6, flex:'0 0 auto',
                      background: active ? '#fff' : '#F5F6FA',
                      color: active ? '#4259EE' : '#60697D',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                    }}>{o.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 13, color:'#0D152C',
                                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.label}</div>
                      <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 11, color:'#60697D',
                                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.sub}</div>
                    </div>
                    {o.kind === 'sku' && o.flag && (
                      <Pill variant={o.flag==='network-win'?'winner':o.flag==='network-loser'?'loser':o.flag==='stale'?'stale':'emerging'} size="sm">
                        {o.flag.replace('network-','').replace('-',' ')}
                      </Pill>
                    )}
                    {active && <IconArrowRight size={14} style={{color:'#4259EE'}}/>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding:'8px 14px', borderTop:'1px solid #ECEDF3', background:'#F8F9FB',
                      display:'flex', alignItems:'center', gap: 14, fontFamily:'Manrope', fontSize: 11, color:'#60697D', fontWeight: 600 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap: 4 }}><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap: 4 }}><Kbd>↵</Kbd> open</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap: 4 }}><Kbd>esc</Kbd> close</span>
          <span style={{ marginLeft:'auto' }}>{flatList.length} results</span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CommandPalette });
