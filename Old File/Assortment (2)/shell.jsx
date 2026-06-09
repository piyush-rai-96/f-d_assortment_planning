// shell.jsx — App shell: Header + Sidebar + AppShell

const NAV_GROUPS = [
  { items: [
    { id: 'home', label: 'Home', Icon: IconHome },
  ]},
  { label: 'Insight', items: [
    { id: 'district', label: 'District Intelligence', Icon: IconNetwork },
    { id: 'store', label: 'Store Deep Dive', Icon: IconStore },
  ]},
  { label: 'Assortment Intelligence', items: [
    { id: 'hindsight', label: 'Hindsight Analytics', Icon: IconChart },
    { id: 'clustering', label: 'Clustering', Icon: IconNetwork },
    { id: 'peer', label: 'Peer Intelligence', Icon: IconUsers, badge: 5 },
    { id: 'recs', label: 'Category Recommendations', Icon: IconLayers, badge: 12, badgeVariant: 'review' },
  ]},
  { label: 'Command Center', items: [
    { id: 'copilot', label: 'AI Copilot', Icon: IconSparkles },
  ]},
  { label: 'Configuration', items: [
    { id: 'admin', label: 'User Access Management', Icon: IconCog },
  ]},
];

const ROLE_VISIBILITY = {
  AMS: { 'home':1, 'store':1, 'hindsight':1, 'clustering':1, 'peer':1, 'recs':1, 'copilot':1 },
  AMM: { 'home':1, 'district':1, 'store':1, 'hindsight':1, 'clustering':1, 'peer':1, 'recs':1, 'copilot':1 },
  CM:  { 'home':1, 'district':1, 'store':1, 'hindsight':1, 'clustering':1, 'peer':1, 'recs':1, 'copilot':1, 'admin':1 },
};

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 60;
const HEADER_H = 56;

const SidebarItem = ({ item, active, onClick, collapsed }) => {
  const [h, setH] = React.useState(false);
  const bg = active ? 'rgba(66,89,238,0.18)' : h ? 'rgba(255,255,255,0.05)' : 'transparent';
  const iconColor = active ? '#fff' : h ? '#E5E7F4' : '#9098AE';
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      title={collapsed ? item.label : undefined}
      style={{
        position:'relative',
        display: 'flex', alignItems: 'center', gap: 11,
        padding: collapsed ? '9px 0' : '8px 12px',
        margin: collapsed ? '0 8px' : '0 8px',
        borderRadius: 7, background: bg,
        color: active ? '#fff' : h ? '#E5E7F4' : '#9098AE',
        fontFamily: 'Manrope', fontSize: 12.5, fontWeight: active ? 600 : 500,
        border: 0, cursor: 'pointer', width: 'calc(100% - 16px)', textAlign: 'left',
        transition: 'background 140ms, color 140ms',
        justifyContent: collapsed ? 'center' : 'flex-start',
        letterSpacing: '-0.005em',
      }}>
      {active && !collapsed && (
        <span style={{ position:'absolute', left: -8, top: 6, bottom: 6, width: 3,
                       background:'#4259EE', borderRadius:'0 3px 3px 0' }}/>
      )}
      <item.Icon size={17} style={{color: iconColor, flex:'0 0 auto'}}/>
      {!collapsed && (
        <>
          <span style={{flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.label}</span>
          {item.badge && (
            <span style={{
              minWidth: 18, height: 18, padding:'0 5px',
              background: item.badgeVariant === 'review' ? '#E1BC29' : '#E74C67',
              color:'#fff', borderRadius: 9999,
              fontFamily:'Manrope', fontWeight: 800, fontSize: 10,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}>{item.badge}</span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span style={{ position:'absolute', top: 4, right: 6, width: 7, height: 7, borderRadius: 9999,
                       background: item.badgeVariant === 'review' ? '#E1BC29' : '#E74C67',
                       boxShadow:'0 0 0 2px #0F172A' }}/>
      )}
    </button>
  );
};

const Sidebar = ({ current, onNavigate, collapsed, onToggle, role }) => {
  const visible = ROLE_VISIBILITY[role] || ROLE_VISIBILITY.AMM;
  const u = ROLE_USER[role];
  return (
    <aside style={{
      width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
      background: 'linear-gradient(180deg, #0F172A 0%, #0B1226 100%)',
      display: 'flex', flexDirection: 'column', flex: '0 0 auto',
      transition: 'width 200ms ease', position:'sticky', top: 0, height:'100vh',
      borderRight:'1px solid rgba(255,255,255,0.06)',
      zIndex: 20,
    }}>
      {/* Logo block */}
      <div style={{
        height: HEADER_H, padding: collapsed ? '0' : '0 16px',
        display:'flex', alignItems:'center', gap: 10,
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        justifyContent: collapsed ? 'center' : 'flex-start', flex:'0 0 auto',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #4259EE 0%, #8C9AF4 100%)',
          display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto',
          color: '#fff', fontFamily:'Manrope', fontWeight: 800, fontSize: 12,
          boxShadow: '0 2px 8px rgba(66,89,238,.45)',
        }}>SH</div>
        {!collapsed && (
          <div style={{ display:'flex', flexDirection:'column', minWidth: 0, lineHeight: 1.1 }}>
            <span style={{ fontFamily:'Manrope', fontWeight: 800, fontSize: 14, color:'#fff', letterSpacing:'-0.01em' }}>StoreHub</span>
            <span style={{ fontFamily:'Manrope', fontWeight: 600, fontSize: 9, color:'#8C9AF4', letterSpacing:'0.08em', textTransform:'uppercase', marginTop: 2 }}>Floor &amp; Decor</span>
          </div>
        )}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding: '10px 0', display:'flex', flexDirection:'column', gap: 2 }}>
        {NAV_GROUPS.map((group, gi) => {
          const items = group.items.filter(it => visible[it.id]);
          if (!items.length) return null;
          return (
            <div key={gi} style={{ marginBottom: 6 }}>
              {!collapsed && group.label && (
                <div style={{
                  fontSize: 9.5, fontWeight: 700, color: '#5B6680',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '10px 16px 4px', fontFamily:'Manrope',
                }}>{group.label}</div>
              )}
              {collapsed && gi > 0 && (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 12px' }}/>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap: 2 }}>
                {items.map(it => (
                  <SidebarItem key={it.id} item={it} active={current===it.id}
                               onClick={()=>onNavigate(it.id)} collapsed={collapsed}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: user + collapse */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding: collapsed ? 8 : 10, flex:'0 0 auto' }}>
        {!collapsed ? (
          <div style={{
            display:'flex', alignItems:'center', gap: 10, padding: '6px 8px',
            borderRadius: 8, background:'rgba(255,255,255,0.04)', marginBottom: 8,
          }}>
            <Avatar initials={u.initials} size={28} color={u.color}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 11.5, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.name}</div>
              <div style={{ fontFamily:'Manrope', fontWeight: 500, fontSize: 9.5, color:'#8C9AF4', letterSpacing:'.04em' }}>{role}</div>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', justifyContent:'center', marginBottom: 6 }}>
            <Avatar initials={u.initials} size={28} color={u.color}/>
          </div>
        )}
        <button onClick={onToggle} style={{
          background:'transparent', border:0, color:'#9098AE', cursor:'pointer',
          width:'100%', display:'flex', alignItems:'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '6px 10px', fontFamily:'Manrope', fontSize: 11, fontWeight: 600, gap: 6,
          borderRadius: 6, transition:'background 140ms, color 140ms',
        }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#E5E7F4';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9098AE';}}
        >
          {!collapsed && <span>Collapse</span>}
          <IconChevronRight size={14} style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition:'transform 200ms' }}/>
        </button>
      </div>
    </aside>
  );
};

const ROLE_USER = {
  AMS: { name: 'A. Patel', initials:'AP', store: 'S0142 · Atlanta — Buckhead', role:'Assortment Merchant Specialist', color:'#3BB273' },
  AMM: { name: 'M. Chen', initials:'MC', store: 'Southeast Region · 18 stores', role:'Assortment Merchant Manager', color:'#4259EE' },
  CM:  { name: 'D. Rivera', initials:'DR', store: 'Network · 70 stores', role:'Category Manager — Tile & Stone', color:'#E1BC29' },
};

const RoleSwitcher = ({ role, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const u = ROLE_USER[role];
  React.useEffect(() => {
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:'inline-flex', alignItems:'center', gap: 8, padding: '4px 10px 4px 4px',
        background: open ? '#ECEEFD' : '#F5F6FA', border:'1px solid #ECEDF3', borderRadius: 999,
        cursor:'pointer', fontFamily:'Manrope', transition:'background 140ms',
      }}>
        <Avatar initials={u.initials} size={26} color={u.color}/>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 700, fontSize: 12, color:'#0D152C' }}>{u.name}</span>
          <span style={{ fontWeight: 500, fontSize: 10, color:'#60697D' }}>{role}</span>
        </div>
        <IconChevronDown size={14} style={{color:'#60697D', transform: open ? 'rotate(180deg)' : 'none', transition:'transform 200ms'}}/>
      </button>
      {open && (
        <div style={{
          position:'absolute', right: 0, top: 'calc(100% + 6px)',
          background:'#fff', border:'1px solid #D9DDE7', borderRadius: 10,
          boxShadow:'0 12px 32px rgba(13,21,44,.15)', minWidth: 280, zIndex: 100, overflow:'hidden',
        }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid #ECEDF3', background:'#F8F9FB' }}>
            <div style={{ fontFamily:'Manrope', fontSize: 10, fontWeight:700, color:'#60697D', textTransform:'uppercase', letterSpacing:'.08em' }}>Switch role · prototype</div>
          </div>
          {Object.entries(ROLE_USER).map(([rk, ru]) => (
            <button key={rk} onClick={()=>{onChange(rk); setOpen(false);}} style={{
              display:'flex', alignItems:'center', gap: 12, width:'100%', textAlign:'left',
              padding:'12px 14px', background: rk===role ? '#ECEEFD' : 'transparent', border:0,
              cursor:'pointer', borderLeft: rk===role ? '3px solid #4259EE' : '3px solid transparent',
              transition:'background 120ms',
            }}
            onMouseEnter={e=>{ if(rk!==role) e.currentTarget.style.background='#F8F9FB'; }}
            onMouseLeave={e=>{ if(rk!==role) e.currentTarget.style.background='transparent'; }}>
              <Avatar initials={ru.initials} size={32} color={ru.color}/>
              <div style={{ display:'flex', flexDirection:'column', minWidth: 0, flex:1 }}>
                <div style={{ fontFamily:'Manrope', fontSize: 13, fontWeight:700, color:'#0D152C' }}>{ru.name} · <span style={{color:'#4259EE'}}>{rk}</span></div>
                <div style={{ fontFamily:'Manrope', fontSize: 11, fontWeight: 500, color:'#60697D' }}>{ru.role}</div>
                <div style={{ fontFamily:'Manrope', fontSize: 11, fontWeight: 500, color:'#8C9AF4', marginTop: 2 }}>{ru.store}</div>
              </div>
              {rk===role && <IconCheck size={16} style={{color:'#4259EE'}}/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = ({ role, onRoleChange, onSearchOpen }) => {
  const [search, setSearch] = React.useState('');
  return (
    <div style={{
      height: HEADER_H, background: 'rgba(255,255,255,.92)',
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      borderBottom: '1px solid #ECEDF3',
      position:'sticky', top: 0, zIndex: 15,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flex:'0 0 auto',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 8, color:'#60697D', fontFamily:'Manrope', fontSize: 12, fontWeight: 600 }}>
        <Pill variant="info" size="sm" dot={false} style={{textTransform:'none'}}>Floor &amp; Decor</Pill>
        <span style={{ color:'#D9DDE7' }}>/</span>
        <span style={{ color:'#1F2B4D' }}>Assortment Intelligence</span>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ position:'relative' }}>
        <Input icon={<IconSearch size={14}/>}
          placeholder="Search SKUs, categories, stores…"
          value={search}
          onFocus={onSearchOpen}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 340, height: 34, fontSize: 12.5 }}/>
        <span style={{ position:'absolute', right: 8, top: '50%', transform:'translateY(-50%)', display:'flex', gap:3 }}>
          <Kbd>⌘</Kbd><Kbd>K</Kbd>
        </span>
      </div>

      <Tooltip content="Refresh data · synced 12 min ago">
        <IconButton title="Refresh"><IconRefresh size={18}/></IconButton>
      </Tooltip>
      <Tooltip content="Help">
        <IconButton title="Help"><IconHelp size={18}/></IconButton>
      </Tooltip>
      <div style={{ position:'relative' }}>
        <IconButton title="Notifications"><IconBell size={18}/></IconButton>
        <div style={{ position:'absolute', top: 6, right: 6, minWidth: 16, height: 16, padding: '0 4px',
                      background:'#E74C67', borderRadius: 9999, display:'inline-flex', alignItems:'center',
                      justifyContent:'center', color:'#fff', fontSize: 9, fontWeight: 800, fontFamily:'Manrope',
                      boxShadow:'0 0 0 2px #fff' }}>5</div>
      </div>
      <Divider vertical style={{ height: 24, margin:'0 4px' }}/>
      <RoleSwitcher role={role} onChange={onRoleChange}/>
    </div>
  );
};

// Toast/snackbar context
const ToastCtx = React.createContext(null);
const useToast = () => React.useContext(ToastCtx);

const ToastHost = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), t.duration || 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position:'fixed', bottom: 20, left: '50%', transform:'translateX(-50%)',
                    zIndex: 200, display:'flex', flexDirection:'column', gap: 8, pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background:'#0F172A', color:'#fff', borderRadius: 8, padding:'10px 16px',
            boxShadow:'0 8px 24px rgba(13,21,44,.25)',
            display:'inline-flex', alignItems:'center', gap: 10,
            fontFamily:'Manrope', fontSize: 13, fontWeight: 600,
            border:'1px solid rgba(66,89,238,0.35)',
            animation:'toastIn 200ms ease-out', pointerEvents:'auto',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 9999,
              background: t.kind === 'success' ? '#3BB273' : t.kind === 'error' ? '#E74C67' : '#4259EE',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}>
              {t.kind === 'success' ? <IconCheck size={12}/> : t.kind === 'error' ? <IconX size={12}/> : <IconInfo size={12}/>}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

const AppShell = ({ role, route, onNavigate, onRoleChange, onSearchOpen, children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F5F6FA' }}>
      <Sidebar
        current={route}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={()=>setCollapsed(c=>!c)}
        role={role}
      />
      <div style={{ flex: 1, minWidth: 0, display:'flex', flexDirection:'column' }}>
        <Header role={role} onRoleChange={onRoleChange} onSearchOpen={onSearchOpen}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Sidebar, Header, AppShell, ToastHost, useToast, NAV_GROUPS, ROLE_USER, ROLE_VISIBILITY });
