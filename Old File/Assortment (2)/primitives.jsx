// primitives.jsx — Button, IconButton, Input, Pill, Kbd, Card, Avatar, etc.
const sh_btnBase = {
  display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8,
  border: '1px solid transparent', fontFamily: 'Manrope, sans-serif',
  fontWeight: 600, cursor: 'pointer', transition: 'background 150ms ease-out, color 150ms, border-color 150ms',
  whiteSpace: 'nowrap', textDecoration: 'none',
};
const sh_btnSize = {
  xs: { padding: '3px 8px', fontSize: 11, height: 24 },
  sm: { padding: '5px 10px', fontSize: 12, height: 28 },
  md: { padding: '8px 14px', fontSize: 13, height: 34 },
  lg: { padding: '10px 18px', fontSize: 14, height: 40 },
};
const sh_btnVariant = {
  primary:     { background: '#4259EE', color: '#fff' },
  secondary:   { background: '#fff', color: '#1F2B4D', borderColor: '#D9DDE7' },
  ghost:       { background: 'transparent', color: '#1F2B4D' },
  destructive: { background: '#E74C67', color: '#fff' },
  success:     { background: '#3BB273', color: '#fff' },
  outline:     { background: '#fff', color: '#4259EE', borderColor: '#C5CFF9' },
};
const sh_btnHover = {
  primary: '#3A4CCB', secondary: '#F5F6FA', ghost: '#F5F6FA',
  destructive: '#C73A52', success: '#2F9A60', outline: '#ECEEFD',
};
const Button = ({ variant='primary', size='md', leftIcon, rightIcon, style, children, ...rest }) => {
  const [h, setH] = React.useState(false);
  const v = sh_btnVariant[variant];
  const bg = h ? sh_btnHover[variant] : v.background;
  return <button {...rest} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{...sh_btnBase, ...sh_btnSize[size], ...v, background: bg, ...style}}>
    {leftIcon}{children}{rightIcon}
  </button>;
};

const IconButton = ({ size=32, iconSize, children, title, active, style, ...rest }) => {
  const [h, setH] = React.useState(false);
  return <button title={title} {...rest} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ width: size, height: size, borderRadius: 8, border: 0,
             background: active ? '#ECEEFD' : (h ? '#F5F6FA' : 'transparent'),
             color: active ? '#4259EE' : '#60697D',
             display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
             cursor: 'pointer', transition: 'background 150ms', flex:'0 0 auto', ...style }}>
    {children}
  </button>;
};

const Input = ({ icon, size, style, ...rest }) => (
  <div style={{ position: 'relative', display: 'inline-flex', flex: '1 1 auto', minWidth: 0 }}>
    {icon && <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#60697D', pointerEvents:'none' }}>{icon}</div>}
    <input {...rest} style={{
      height: 32, padding: icon ? '0 10px 0 32px' : '0 10px',
      borderRadius: 6, border: '1px solid #D9DDE7', background: '#fff',
      fontSize: 13, fontFamily: 'Manrope', color: '#1F2B4D', outline: 'none',
      width: '100%', boxSizing:'border-box', ...style }}/>
  </div>
);

const PILL_VARIANTS = {
  approved:  { bg: '#E7F6EC', fg: '#217A4C', dot: '#3BB273', border: '#B6E0C4' },
  pending:   { bg: '#FFFAD6', fg: '#8A6E00', dot: '#E1BC29', border: '#FFDD6B' },
  rejected:  { bg: '#FDECF2', fg: '#B42543', dot: '#E74C67', border: '#F1BFC0' },
  review:    { bg: '#ECEEFD', fg: '#2E3FB5', dot: '#4259EE', border: '#C5CFF9' },
  draft:     { bg: '#F5F6FA', fg: '#60697D', dot: '#B4BAC7', border: '#D9DDE7' },
  navy:      { bg: '#14213C', fg: '#fff', dot: '#fff', border: '#14213C' },
  neutral:   { bg: '#fff', fg: '#1F2B4D', dot: null, border: '#D9DDE7' },
  winner:    { bg: '#E7F6EC', fg: '#217A4C', dot: '#3BB273', border: '#B6E0C4' },
  loser:     { bg: '#FDECF2', fg: '#B42543', dot: '#E74C67', border: '#F1BFC0' },
  emerging:  { bg: '#FFFAD6', fg: '#8A6E00', dot: '#E1BC29', border: '#FFDD6B' },
  stale:     { bg: '#F5F6FA', fg: '#60697D', dot: '#B4BAC7', border: '#D9DDE7' },
  info:      { bg: '#E0F3FF', fg: '#0F5C8E', dot: '#3B82C4', border: '#C5CFF9' },
};
const Pill = ({ variant='neutral', dot=true, children, style, size='md' }) => {
  const v = PILL_VARIANTS[variant] || PILL_VARIANTS.neutral;
  const sz = size === 'sm' ? { padding: '2px 7px', fontSize: 10 } : { padding: '3px 10px', fontSize: 11 };
  return <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6, ...sz,
    borderRadius: 9999, fontWeight: 600,
    background: v.bg, color: v.fg, border: `1px solid ${v.border}`, whiteSpace:'nowrap', ...style }}>
    {dot && v.dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: v.dot, flex:'0 0 auto' }}/>}
    {children}
  </span>;
};

const Kbd = ({ children, dark }) => (
  <span style={{
    background: dark ? 'rgba(255,255,255,.14)' : '#F5F6FA',
    border: dark ? '0' : '1px solid #D9DDE7',
    color: dark ? '#fff' : '#1F2B4D',
    borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 500,
    fontFamily: 'Manrope', boxShadow: dark ? 'none' : 'inset 0 -1px 0 #D9DDE7',
    display:'inline-flex', alignItems:'center'
  }}>{children}</span>
);

const Card = ({ style, children, padding=16, hoverable, onClick, ...rest }) => {
  const [h, setH] = React.useState(false);
  return <div {...rest} onClick={onClick}
    onMouseEnter={()=>hoverable && setH(true)}
    onMouseLeave={()=>hoverable && setH(false)}
    style={{
      background: '#fff', border: '1px solid #D9DDE7', borderRadius: 8,
      padding, boxShadow: h ? '0 4px 10px 0 rgba(13,21,44,.08)' : '0 1px 2px 0 rgba(13,21,44,.06)',
      cursor: onClick ? 'pointer' : undefined,
      transition:'box-shadow 150ms', ...style }}>
    {children}
  </div>;
};

const Avatar = ({ initials, size=28, color='#4259EE' }) => (
  <div style={{ width: size, height: size, borderRadius: 9999, background: color,
                color: '#fff', fontSize: size*0.4, fontWeight: 700, fontFamily: 'Manrope',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flex: '0 0 auto', letterSpacing: '-0.01em' }}>{initials}</div>
);

const Divider = ({ vertical, style }) => (
  <div style={{
    background: '#ECEDF3',
    width: vertical ? 1 : '100%',
    height: vertical ? '100%' : 1,
    flex: '0 0 auto',
    ...style }}/>
);

// SectionHeader for cards / panels
const SectionHeader = ({ title, subtitle, right, style, icon }) => (
  <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 12, ...style }}>
    {icon && <div style={{ width:32, height:32, borderRadius:8, background:'#ECEEFD', color:'#4259EE',
              display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto'}}>{icon}</div>}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily:'Manrope', fontWeight: 700, fontSize: 14, color:'#0D152C', letterSpacing:'-0.005em' }}>{title}</div>
      {subtitle && <div style={{ fontFamily:'Manrope', fontWeight:500, fontSize: 12, color:'#60697D', marginTop: 2 }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

// Sparkline — for trend charts
const Sparkline = ({ data, width=72, height=22, color='#4259EE', fill, strokeWidth=1.5 }) => {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(' ');
  const fillPath = `M0,${height} L${points.replaceAll(' ',' L')} L${width},${height} Z`;
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      {fill && <polygon points={`0,${height} ${points} ${width},${height}`} fill={fill} opacity="0.18"/>}
      <polyline points={points} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ConfidenceBar — visualises 0–100 score with breakdown popover
const ConfidenceBar = ({ score, width=70, showValue=true, popover }) => {
  const [open, setOpen] = React.useState(false);
  const color = score >= 75 ? '#3BB273' : score >= 50 ? '#E1BC29' : '#E74C67';
  return (
    <div style={{ position:'relative', display:'inline-flex', alignItems:'center', gap: 8 }}
         onMouseEnter={()=>popover && setOpen(true)}
         onMouseLeave={()=>setOpen(false)}>
      <div style={{ width, height: 6, background:'#ECEDF3', borderRadius: 9999, overflow:'hidden' }}>
        <div style={{ width: `${score}%`, height:'100%', background: color, borderRadius:9999, transition:'width 200ms'}}/>
      </div>
      {showValue && <span style={{ fontFamily:'Manrope', fontWeight:600, fontSize:11, color:'#1F2B4D', fontFeatureSettings:'"tnum"' }}>{score}</span>}
      {open && popover}
    </div>
  );
};

// Tabs
const Tabs = ({ tabs, value, onChange, style }) => (
  <div style={{ display:'flex', gap: 0, borderBottom:'1px solid #ECEDF3', ...style }}>
    {tabs.map(t => {
      const active = t.id === value;
      return (
        <button key={t.id} onClick={()=>onChange(t.id)}
          style={{
            background:'transparent', border:0, borderBottom: active ? '2px solid #4259EE' : '2px solid transparent',
            padding:'10px 14px', fontFamily:'Manrope', fontWeight: active ? 600 : 500, fontSize: 13,
            color: active ? '#4259EE' : '#60697D', cursor:'pointer', transition:'color 150ms',
            display:'inline-flex', alignItems:'center', gap: 6,
          }}>
          {t.label}
          {t.count !== undefined && (
            <span style={{
              background: active ? '#ECEEFD' : '#F5F6FA',
              color: active ? '#4259EE' : '#60697D',
              fontSize: 10, padding: '1px 6px', borderRadius: 9999, fontWeight: 700,
            }}>{t.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

// Toggle / Switch
const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display:'inline-flex', alignItems:'center', gap: 8, cursor:'pointer', userSelect:'none' }}>
    <span style={{
      width: 30, height: 18, borderRadius: 9999, background: checked ? '#4259EE' : '#D9DDE7',
      position:'relative', transition:'background 150ms', flex:'0 0 auto',
    }}>
      <span style={{
        position:'absolute', top: 2, left: checked ? 14 : 2,
        width: 14, height: 14, borderRadius:9999, background:'#fff', transition:'left 150ms',
        boxShadow:'0 1px 2px rgba(0,0,0,.2)'
      }}/>
    </span>
    {label && <span style={{ fontFamily:'Manrope', fontSize: 12, fontWeight: 500, color:'#1F2B4D' }}>{label}</span>}
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display:'none' }}/>
  </label>
);

// Tooltip — simple hover
const Tooltip = ({ children, content, style }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <span style={{ position:'relative', display:'inline-flex', ...style }}
          onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
      {children}
      {open && (
        <span style={{
          position:'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform:'translateX(-50%)',
          background:'#0D152C', color:'#fff', padding:'5px 9px', borderRadius: 6,
          fontSize: 11, fontWeight: 500, fontFamily:'Manrope', whiteSpace:'nowrap',
          pointerEvents:'none', zIndex: 50, boxShadow:'0 4px 10px rgba(0,0,0,.2)'
        }}>{content}</span>
      )}
    </span>
  );
};

// Variance heatmap cell color
const heatColor = (v, max=1) => {
  // v in 0..max — bluer is better (high), warmer/red is worse (low)
  const t = Math.max(0, Math.min(1, v / max));
  // map: 0 → red-ish (#FDECF2), .5 → neutral (#F5F6FA), 1 → blue (#ECEEFD)
  if (t > 0.66) return '#DBE0FB';
  if (t > 0.5) return '#ECEEFD';
  if (t > 0.33) return '#F5F6FA';
  if (t > 0.17) return '#FFFAD6';
  return '#FDECF2';
};

Object.assign(window, {
  Button, IconButton, Input, Pill, Kbd, Card, Avatar, Divider,
  SectionHeader, Sparkline, ConfidenceBar, Tabs, Toggle, Tooltip, heatColor,
});
