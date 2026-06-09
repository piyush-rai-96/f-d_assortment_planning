// app.jsx — root: routing, command palette, toasts, tweak panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "role": "AMM",
  "density": "comfy",
  "showConfidence": true,
  "primaryColor": "#4259EE",
  "category": "tile"
}/*EDITMODE-END*/;

const ROUTES = {
  home: { label: 'Home' },
  hindsight: { label: 'Hindsight Analytics' },
  clustering: { label: 'Clustering' },
  peer: { label: 'Peer Intelligence' },
  recs: { label: 'Category Recommendations' },
  district: { label: 'District Intelligence' },
  store: { label: 'Store Deep Dive' },
  copilot: { label: 'AI Copilot' },
  admin: { label: 'Admin' },
};

function AppInner() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('peer');
  const [skuDrawer, setSkuDrawer] = React.useState(null);
  const [category, setCategory] = React.useState(t.category || 'tile');
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => { if (t.category && t.category !== category) setCategory(t.category); }, [t.category]);
  React.useEffect(() => { document.documentElement.style.setProperty('--ia-primary', t.primaryColor); }, [t.primaryColor]);

  // ⌘K / Ctrl+K -> palette
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setPaletteOpen(o => !o);
      } else if (e.key === '?' && (e.shiftKey)) {
        toast({ kind:'info', message: 'Keyboard shortcuts: ⌘K palette · / search · ⌘B sidebar' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toast]);

  const [activeStoreId, setActiveStoreId] = React.useState('S0142');
  const navigate = (to) => {
    setRoute(to);
    setSkuDrawer(null);
  };
  const openSku = (sku) => setSkuDrawer(sku);
  const openStore = (storeId) => { setActiveStoreId(storeId); setRoute('store'); };

  let screen = null;
  switch (route) {
    case 'home': screen = <HomeScreen role={t.role} onNavigate={navigate}/>; break;
    case 'peer': screen = <PeerComparisonView category={category} onCategoryChange={c=>{setCategory(c); setTweak('category', c);}} onOpenSku={openSku} density={t.density} showConfidence={t.showConfidence}/>; break;
    case 'recs': screen = <RecommendationsScreen onOpenSku={openSku}/>; break;
    case 'hindsight': screen = <HindsightScreen onOpenSku={openSku}/>; break;
    case 'clustering': screen = <ClusteringScreen/>; break;
    case 'district': screen = <DistrictScreen onOpenStore={openStore}/>; break;
    case 'store': screen = <StoreDeepDiveScreen storeId={activeStoreId} onBack={()=>navigate('district')} onOpenSku={openSku}/>; break;
    case 'copilot': screen = <CopilotScreen onOpenSku={openSku}/>; break;
    case 'admin': screen = <AdminScreen/>; break;
    default: screen = <HomeScreen role={t.role} onNavigate={navigate}/>;
  }

  return (
    <>
      <AppShell role={t.role} route={route} onNavigate={navigate}
                onRoleChange={(r) => { setTweak('role', r); toast({kind:'success', message:`Switched to ${r} role`}); }}
                onSearchOpen={() => setPaletteOpen(true)}>
        {screen}
      </AppShell>

      {skuDrawer && <SkuDetailDrawer sku={skuDrawer} onClose={()=>setSkuDrawer(null)}/>}

      <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)}
        onNavigate={(id) => { navigate(id); toast({kind:'info', message:`Opened ${ROUTES[id]?.label || id}`}); }}
        onOpenSku={(sku) => { openSku(sku); }}
      />

      <TweaksPanel>
        <TweakSection label="Persona"/>
        <TweakRadio label="Role" value={t.role} options={['AMS','AMM','CM']}
          onChange={v => { setTweak('role', v); toast({kind:'success', message:`Switched to ${v} role`}); }}/>
        <div style={{ fontSize: 10, color:'rgba(41,38,27,.6)', marginTop:-4, fontFamily:'Manrope', fontWeight: 500 }}>
          AMS = store · AMM = region · CM = network
        </div>

        <TweakSection label="Display"/>
        <TweakRadio label="Density" value={t.density} options={['compact','comfy','spacious']}
          onChange={v => setTweak('density', v)}/>
        <TweakToggle label="Show confidence bars" value={t.showConfidence}
          onChange={v => setTweak('showConfidence', v)}/>
        <TweakColor label="Brand accent" value={t.primaryColor}
          onChange={v => setTweak('primaryColor', v)}/>

        <TweakSection label="Quick navigation"/>
        <TweakSelect label="Open screen" value={route}
          options={Object.keys(ROUTES).map(k => ({value:k, label: ROUTES[k].label}))}
          onChange={v => navigate(v)}/>
        <TweakSelect label="Tile category" value={category}
          options={CATEGORIES.map(c => ({value:c.id, label:c.name}))}
          onChange={v => {setCategory(v); setTweak('category', v);}}/>

        <TweakSection label="Try it"/>
        <TweakButton label="Open command palette (⌘K)" onClick={() => setPaletteOpen(true)}/>
        <TweakButton label="Show success toast" secondary onClick={() => toast({kind:'success', message:'Sample SKU added to Review List'})}/>
      </TweaksPanel>
    </>
  );
}

function App() {
  return (
    <ToastHost>
      <AppInner/>
    </ToastHost>
  );
}

const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(<App/>);
