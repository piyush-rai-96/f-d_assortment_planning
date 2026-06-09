// data.jsx — mock data for StoreHub Floor & Decor
const STORES = [
  { id: 'S0142', name: 'Atlanta — Buckhead', cluster: 'C-Pro-South', proSplit: 72, sqft: 78000, format: 'Standard', region: 'Southeast' },
  { id: 'S0211', name: 'Dallas — North Plano', cluster: 'C-Pro-South', proSplit: 68, sqft: 82000, format: 'Large', region: 'South Central' },
  { id: 'S0089', name: 'Houston — Westheimer', cluster: 'C-Pro-South', proSplit: 74, sqft: 76000, format: 'Standard', region: 'South Central' },
  { id: 'S0317', name: 'Phoenix — Scottsdale', cluster: 'C-DIY-West', proSplit: 38, sqft: 72000, format: 'Standard', region: 'West' },
  { id: 'S0028', name: 'Tampa — Brandon', cluster: 'C-DIY-South', proSplit: 41, sqft: 68000, format: 'Standard', region: 'Southeast' },
  { id: 'S0455', name: 'Charlotte — South End', cluster: 'C-Mixed-East', proSplit: 55, sqft: 84000, format: 'Large', region: 'Southeast' },
];

const CLUSTERS = [
  { id: 'C-Pro-South', name: 'Pro-Heavy South', stores: 18, proAvg: 70, dominantCats: ['Tile', 'Installation Materials', 'Stone'], avgSqft: 79000, color: '#4259EE' },
  { id: 'C-DIY-West', name: 'DIY-Heavy West', stores: 12, proAvg: 36, dominantCats: ['Wood', 'Decorative', 'Tile'], avgSqft: 71000, color: '#3BB273' },
  { id: 'C-DIY-South', name: 'DIY-Heavy South', stores: 14, proAvg: 40, dominantCats: ['Wood', 'Tile', 'Decorative'], avgSqft: 70000, color: '#E1BC29' },
  { id: 'C-Mixed-East', name: 'Mixed Urban East', stores: 15, proAvg: 54, dominantCats: ['Tile', 'Stone', 'Wood'], avgSqft: 81000, color: '#E74C67' },
  { id: 'C-Pro-Midwest', name: 'Pro-Heavy Midwest', stores: 11, proAvg: 65, dominantCats: ['Installation Materials', 'Tile', 'Stone'], avgSqft: 77000, color: '#8C9AF4' },
];

const CATEGORIES = [
  { id: 'tile', name: 'Tile', icon: '◧', subcats: ['Ceramic', 'Porcelain', 'Glass', 'Natural Stone'], skuCount: 1247 },
  { id: 'wood', name: 'Wood', icon: '▤', subcats: ['Engineered', 'Solid Hardwood', 'LVP'], skuCount: 892 },
  { id: 'stone', name: 'Stone', icon: '◆', subcats: ['Slab', 'Tile', 'Mosaic'], skuCount: 416 },
  { id: 'install', name: 'Installation Materials', icon: '◔', subcats: ['Mortar', 'Grout', 'Trim', 'Adhesives', 'Underlayment'], skuCount: 738 },
  { id: 'decor', name: 'Decorative & Wall Tile', icon: '◇', subcats: ['Accent', 'Wall', 'Backsplash'], skuCount: 521 },
];

// SKU sparkline generator (deterministic)
const seed = (n) => {
  let s = n;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};
const trendUp = (n=12, base=40) => { const r = seed(n); return Array.from({length:12}, (_,i) => Math.round(base + i*2.5 + r()*8)); };
const trendDown = (n=12, base=80) => { const r = seed(n); return Array.from({length:12}, (_,i) => Math.round(base - i*2.0 + r()*8)); };
const trendFlat = (n=12, base=55) => { const r = seed(n); return Array.from({length:12}, (_,i) => Math.round(base + Math.sin(i)*4 + r()*6)); };

const SKUS = [
  // Network winners not carried in S0142
  { id: 'TIL-44218', name: 'Marbella Carrara 12x24 Porcelain', cat: 'Tile', sub: 'Porcelain', flag: 'network-win', carried: false, peerCarry: 78, peerST: 84, classification: 'Winner', confidence: 88, trend: trendUp(1, 38), proSplit: 'Pro-leaning', revOpp: 142000, supplier: 'Cersaie' },
  { id: 'WOO-30817', name: 'Heritage Oak 7" LVP — Smoked', cat: 'Wood', sub: 'LVP', flag: 'network-win', carried: false, peerCarry: 67, peerST: 79, classification: 'Winner', confidence: 82, trend: trendUp(2, 42), proSplit: 'DIY-leaning', revOpp: 98500, supplier: 'COREtec' },
  { id: 'INS-12409', name: 'ProSet Premium Mortar 50lb (Gray)', cat: 'Installation Materials', sub: 'Mortar', flag: 'network-win', carried: false, peerCarry: 91, peerST: 88, classification: 'Winner', confidence: 94, trend: trendUp(3, 50), proSplit: 'Pro-dominant', revOpp: 64200, supplier: 'Mapei' },
  { id: 'TIL-58302', name: 'Sahara Beige Travertine 18x18', cat: 'Tile', sub: 'Natural Stone', flag: 'network-win', carried: false, peerCarry: 54, peerST: 71, classification: 'Winner', confidence: 71, trend: trendUp(4, 35), proSplit: 'Mixed', revOpp: 47800, supplier: 'StoneCraft' },
  // Losers still carried in S0142
  { id: 'TIL-22014', name: 'Mediterranean Mosaic 2x2 Glass — Teal', cat: 'Tile', sub: 'Glass', flag: 'network-loser', carried: true, peerCarry: 48, peerST: 22, classification: 'Loser', confidence: 79, trend: trendDown(5, 70), proSplit: 'DIY-leaning', revOpp: -28000, weeksAtLoser: 14, plrCycles: 3, trapped: 41200 },
  { id: 'DEC-66128', name: 'Vintage Tin Backsplash Panel — Bronze', cat: 'Decorative & Wall Tile', sub: 'Accent', flag: 'stale', carried: true, peerCarry: 31, peerST: 14, classification: 'Stale', confidence: 86, trend: trendFlat(6, 18), proSplit: 'DIY-leaning', revOpp: -19500, weeksAtLoser: 38, plrCycles: 8, trapped: 22800 },
  { id: 'WOO-91044', name: 'Ranch Pine Solid 3.25" — Knotty', cat: 'Wood', sub: 'Solid Hardwood', flag: 'network-loser', carried: true, peerCarry: 39, peerST: 26, classification: 'Loser', confidence: 73, trend: trendDown(7, 62), proSplit: 'DIY-leaning', revOpp: -33000, weeksAtLoser: 11, plrCycles: 2, trapped: 38400 },
  // Emerging winners
  { id: 'TIL-77251', name: 'Onyx Charcoal 24x48 Slab Look', cat: 'Tile', sub: 'Porcelain', flag: 'emerging', carried: true, peerCarry: 28, peerST: 76, classification: 'Winner', confidence: 64, trend: trendUp(8, 28), proSplit: 'Pro-leaning', revOpp: 51000 },
  { id: 'WOO-44820', name: 'Coastal White Oak Engineered 9.5"', cat: 'Wood', sub: 'Engineered', flag: 'emerging', carried: true, peerCarry: 22, peerST: 81, classification: 'Winner', confidence: 58, trend: trendUp(9, 30), proSplit: 'Mixed', revOpp: 42500 },
];

const ALERTS = [
  { id: 'A-9012', type: 'network-win', sku: 'TIL-44218', title: 'Network Winner not carried', detail: 'Marbella Carrara 12x24 — winner in 14 of 18 cluster peers', impact: 142000, store: 'S0142', age: '2h' },
  { id: 'A-9008', type: 'network-loser', sku: 'TIL-22014', title: 'Network Loser still carried', detail: 'Mediterranean Mosaic 2x2 — loser in 9 of 18 peers, $41.2k trapped', impact: -41200, store: 'S0142', age: '5h' },
  { id: 'A-9001', type: 'emerging', sku: 'TIL-77251', title: 'Emerging Winner trend', detail: 'Onyx Charcoal 24x48 — +28% sell-through over 4w in your cluster', impact: 51000, store: 'S0142', age: '1d' },
  { id: 'A-8997', type: 'network-win', sku: 'INS-12409', title: 'Network Winner not carried', detail: 'ProSet Premium Mortar — 91% peer carry, 88% sell-through', impact: 64200, store: 'S0142', age: '1d' },
  { id: 'A-8990', type: 'stale', sku: 'DEC-66128', title: 'Zombie SKU candidate', detail: 'Vintage Tin Backsplash — 38 weeks at Stale, $22.8k trapped', impact: -22800, store: 'S0142', age: '2d' },
];

const RECOMMENDATIONS = [
  { id: 'R-2041', sku: 'TIL-44218', name: 'Marbella Carrara 12x24 Porcelain', cat: 'Tile', action: 'ADD', confidence: 88, status: 'pending', amm: null, reason: 'Network winner in 78% of cluster; absent in your store', cycle: 'PLR-2026-W18' },
  { id: 'R-2040', sku: 'TIL-22014', name: 'Mediterranean Mosaic 2x2 Glass', cat: 'Tile', action: 'DROP', confidence: 79, status: 'pending', amm: null, reason: '14 weeks at Loser status; $41.2k trapped capital', cycle: 'PLR-2026-W18' },
  { id: 'R-2039', sku: 'INS-12409', name: 'ProSet Premium Mortar 50lb', cat: 'Installation Materials', action: 'ADD', confidence: 94, status: 'accepted', amm: 'M. Chen', reason: 'Pro-dominant cluster; 91% peer carry', cycle: 'PLR-2026-W18' },
  { id: 'R-2038', sku: 'WOO-30817', name: 'Heritage Oak 7" LVP — Smoked', cat: 'Wood', action: 'ADD', confidence: 82, status: 'pending', amm: null, reason: 'DIY-leaning win; 67% peer carry rate', cycle: 'PLR-2026-W18' },
  { id: 'R-2037', sku: 'WOO-91044', name: 'Ranch Pine Solid 3.25" — Knotty', cat: 'Wood', action: 'DROP', confidence: 73, status: 'modified', amm: 'M. Chen', reason: 'Loser in 39% of peers; $38.4k trapped', cycle: 'PLR-2026-W18', modNote: 'Hold one cycle — supplier transition pending' },
  { id: 'R-2036', sku: 'DEC-66128', name: 'Vintage Tin Backsplash — Bronze', cat: 'Decorative', action: 'DROP', confidence: 86, status: 'escalated', amm: 'M. Chen', reason: '38 weeks Stale; minimal velocity', cycle: 'PLR-2026-W18', modNote: 'Pro contractor still requests for restoration jobs' },
  { id: 'R-2035', sku: 'TIL-58302', name: 'Sahara Beige Travertine 18x18', cat: 'Tile', action: 'ADD', confidence: 71, status: 'discretion', amm: null, reason: 'Mixed signal: winner in 54%, neutral in 31%', cycle: 'PLR-2026-W18' },
  { id: 'R-2034', sku: 'TIL-77251', name: 'Onyx Charcoal 24x48 Slab Look', cat: 'Tile', action: 'CARRY', confidence: 64, status: 'accepted', amm: 'M. Chen', reason: 'Emerging winner; protect inventory position', cycle: 'PLR-2026-W18' },
];

// Sample tasks for Action Queue
const TASKS = [
  { id: 'T-441', priority: 'high', title: 'Review 4 ADD recommendations', detail: 'PLR-2026-W18 cycle window closes Fri', cta: 'Open queue', icon: 'recs' },
  { id: 'T-440', priority: 'high', title: 'Confirm exit on 2 Stale SKUs', detail: 'Decorative & Wall Tile category', cta: 'Review', icon: 'flag' },
  { id: 'T-439', priority: 'med', title: 'Acknowledge cluster reassignment', detail: '2 stores in your region moved C-Pro-South → C-Mixed', cta: 'Acknowledge', icon: 'cluster' },
  { id: 'T-438', priority: 'med', title: '5 SKUs added to Review List', detail: 'Shared by AMS A. Patel — Atlanta Buckhead', cta: 'Open list', icon: 'list' },
  { id: 'T-437', priority: 'low', title: 'Quarterly outcome report ready', detail: 'Model vs. Local — 8-week window', cta: 'Read report', icon: 'chart' },
];

const BROADCASTS = [
  { id: 'B-12', title: 'Spring tile assortment refresh — calendar', when: 'Today', type: 'announcement' },
  { id: 'B-11', title: 'Pro Loyalty program rules updated for Q2', when: 'Yesterday', type: 'policy' },
  { id: 'B-10', title: 'New Pro-DIY clustering methodology FAQ', when: '2d ago', type: 'training' },
];

// =============================================================
// CLUSTERING — extended data
// =============================================================

// Full network of stores grouped by region, with attribute fingerprints used by the clustering engine.
const NETWORK_STORES = [
  // Pro-Heavy South cluster
  { id:'S0142', name:'Atlanta — Buckhead', region:'Southeast', state:'GA', cluster:'C-Pro-South', sqft:78000, proSplit:72, format:'Standard', medianHHI:118, climate:'Humid Subtropical', tier:'A' },
  { id:'S0211', name:'Dallas — North Plano', region:'South Central', state:'TX', cluster:'C-Pro-South', sqft:82000, proSplit:68, format:'Large', medianHHI:124, climate:'Humid Subtropical', tier:'A' },
  { id:'S0089', name:'Houston — Westheimer', region:'South Central', state:'TX', cluster:'C-Pro-South', sqft:76000, proSplit:74, format:'Standard', medianHHI:108, climate:'Humid Subtropical', tier:'A' },
  { id:'S0301', name:'Miami — Kendall', region:'Southeast', state:'FL', cluster:'C-Pro-South', sqft:74000, proSplit:71, format:'Standard', medianHHI:96, climate:'Tropical', tier:'B' },
  { id:'S0188', name:'Orlando — Lake Nona', region:'Southeast', state:'FL', cluster:'C-Pro-South', sqft:80000, proSplit:69, format:'Large', medianHHI:102, climate:'Humid Subtropical', tier:'A' },
  { id:'S0244', name:'Nashville — Cool Springs', region:'Southeast', state:'TN', cluster:'C-Pro-South', sqft:77000, proSplit:73, format:'Standard', medianHHI:114, climate:'Humid Subtropical', tier:'B' },

  // DIY-Heavy West
  { id:'S0317', name:'Phoenix — Scottsdale', region:'West', state:'AZ', cluster:'C-DIY-West', sqft:72000, proSplit:38, format:'Standard', medianHHI:106, climate:'Hot Desert', tier:'A' },
  { id:'S0402', name:'Las Vegas — Henderson', region:'West', state:'NV', cluster:'C-DIY-West', sqft:71000, proSplit:34, format:'Standard', medianHHI:88, climate:'Hot Desert', tier:'B' },
  { id:'S0356', name:'Denver — Park Meadows', region:'West', state:'CO', cluster:'C-DIY-West', sqft:74000, proSplit:36, format:'Standard', medianHHI:110, climate:'Semi-Arid', tier:'A' },
  { id:'S0419', name:'Salt Lake — Sandy', region:'West', state:'UT', cluster:'C-DIY-West', sqft:69000, proSplit:39, format:'Standard', medianHHI:92, climate:'Semi-Arid', tier:'C' },

  // DIY-Heavy South
  { id:'S0028', name:'Tampa — Brandon', region:'Southeast', state:'FL', cluster:'C-DIY-South', sqft:68000, proSplit:41, format:'Standard', medianHHI:84, climate:'Humid Subtropical', tier:'B' },
  { id:'S0066', name:'Jacksonville — Town Center', region:'Southeast', state:'FL', cluster:'C-DIY-South', sqft:70000, proSplit:39, format:'Standard', medianHHI:78, climate:'Humid Subtropical', tier:'C' },
  { id:'S0102', name:'Birmingham — Riverchase', region:'Southeast', state:'AL', cluster:'C-DIY-South', sqft:67000, proSplit:42, format:'Standard', medianHHI:74, climate:'Humid Subtropical', tier:'C' },

  // Mixed Urban East
  { id:'S0455', name:'Charlotte — South End', region:'Southeast', state:'NC', cluster:'C-Mixed-East', sqft:84000, proSplit:55, format:'Large', medianHHI:104, climate:'Humid Subtropical', tier:'A' },
  { id:'S0512', name:'Raleigh — Cary', region:'Southeast', state:'NC', cluster:'C-Mixed-East', sqft:81000, proSplit:53, format:'Large', medianHHI:118, climate:'Humid Subtropical', tier:'A' },
  { id:'S0567', name:'Richmond — Short Pump', region:'Mid-Atlantic', state:'VA', cluster:'C-Mixed-East', sqft:79000, proSplit:56, format:'Standard', medianHHI:112, climate:'Humid Subtropical', tier:'B' },

  // Pro-Heavy Midwest
  { id:'S0612', name:'Chicago — Schaumburg', region:'Midwest', state:'IL', cluster:'C-Pro-Midwest', sqft:79000, proSplit:65, format:'Standard', medianHHI:108, climate:'Humid Continental', tier:'A' },
  { id:'S0644', name:'Indianapolis — Carmel', region:'Midwest', state:'IN', cluster:'C-Pro-Midwest', sqft:75000, proSplit:64, format:'Standard', medianHHI:106, climate:'Humid Continental', tier:'B' },
  { id:'S0698', name:'Cincinnati — Kenwood', region:'Midwest', state:'OH', cluster:'C-Pro-Midwest', sqft:77000, proSplit:67, format:'Standard', medianHHI:96, climate:'Humid Continental', tier:'B' },
];

// Available attributes for clustering (with realism)
const CLUSTER_ATTRIBUTES = [
  { id:'pro_split', name:'Pro / DIY mix', group:'Customer', desc:'Share of revenue from Pro contractor accounts', recommended:true },
  { id:'sqft', name:'Square footage', group:'Format', desc:'Selling floor area' },
  { id:'format', name:'Store format', group:'Format', desc:'Standard / Large / Compact' },
  { id:'climate', name:'Climate zone', group:'Geography', desc:'Köppen climate classification', recommended:true },
  { id:'median_hhi', name:'Median household income', group:'Demographics', desc:'Catchment-area median HHI ($k)' },
  { id:'sales_velocity', name:'Sales velocity', group:'Performance', desc:'52-week revenue per sqft', recommended:true },
  { id:'tier', name:'Volume tier', group:'Performance', desc:'A / B / C tier from rolling sales' },
  { id:'cat_mix', name:'Category mix index', group:'Assortment', desc:'Tile vs Wood vs Stone share', recommended:true },
  { id:'region', name:'Region', group:'Geography', desc:'Operational region' },
  { id:'population', name:'Catchment population', group:'Demographics', desc:'5-mile-radius population' },
  { id:'pro_loyalty', name:'Pro loyalty enrolment', group:'Customer', desc:'% of pro txns under loyalty program' },
  { id:'new_construction', name:'New-construction permits', group:'Geography', desc:'12-mo permits in catchment' },
];

// Existing ("active") cluster definitions with richer metadata
const ACTIVE_CLUSTERS = [
  { id:'C-Pro-South', name:'Pro-Heavy South', stores:18, proAvg:70, dominantCats:['Tile','Installation Materials','Stone'], avgSqft:79000, color:'#4259EE',
    method:'k-means · k=5', attrs:['pro_split','climate','sales_velocity','cat_mix'], lastRun:'2026-01-12', nextRun:'2026-04-12', cohesion:0.84, status:'active', skus:1124 },
  { id:'C-DIY-West',   name:'DIY-Heavy West',   stores:12, proAvg:36, dominantCats:['Wood','Decorative','Tile'], avgSqft:71000, color:'#3BB273',
    method:'k-means · k=5', attrs:['pro_split','climate','sales_velocity','cat_mix'], lastRun:'2026-01-12', nextRun:'2026-04-12', cohesion:0.79, status:'active', skus:982 },
  { id:'C-DIY-South',  name:'DIY-Heavy South',  stores:14, proAvg:40, dominantCats:['Wood','Tile','Decorative'], avgSqft:70000, color:'#E1BC29',
    method:'k-means · k=5', attrs:['pro_split','climate','sales_velocity','cat_mix'], lastRun:'2026-01-12', nextRun:'2026-04-12', cohesion:0.76, status:'active', skus:1012 },
  { id:'C-Mixed-East', name:'Mixed Urban East', stores:15, proAvg:54, dominantCats:['Tile','Stone','Wood'], avgSqft:81000, color:'#E74C67',
    method:'k-means · k=5', attrs:['pro_split','climate','sales_velocity','cat_mix'], lastRun:'2026-01-12', nextRun:'2026-04-12', cohesion:0.81, status:'active', skus:1187 },
  { id:'C-Pro-Midwest',name:'Pro-Heavy Midwest',stores:11, proAvg:65, dominantCats:['Installation Materials','Tile','Stone'], avgSqft:77000, color:'#8C9AF4',
    method:'k-means · k=5', attrs:['pro_split','climate','sales_velocity','cat_mix'], lastRun:'2026-01-12', nextRun:'2026-04-12', cohesion:0.78, status:'active', skus:1054 },
];

// Past cluster runs (for the dashboard history list)
const CLUSTER_RUNS = [
  { id:'CR-018', name:'Network 5-cluster (k-means)', method:'k-means · k=5', attrs:4, stores:70, status:'live', date:'2026-01-12', author:'D. Rivera', cohesion:0.80 },
  { id:'CR-017', name:'Tile category — fine-grain', method:'hierarchical', attrs:6, stores:70, status:'archived', date:'2025-10-04', author:'D. Rivera', cohesion:0.72 },
  { id:'CR-016', name:'Pro-mix only (test)', method:'k-means · k=4', attrs:1, stores:70, status:'archived', date:'2025-07-22', author:'M. Chen', cohesion:0.61 },
  { id:'CR-015', name:'Network 4-cluster baseline', method:'k-means · k=4', attrs:3, stores:68, status:'archived', date:'2025-04-09', author:'D. Rivera', cohesion:0.74 },
];

// =============================================================
// HINDSIGHT — extended data: 3-group KPIs, treemap, bubble graph
// =============================================================

// Three KPI groups requested by user
const HINDSIGHT_KPI_GROUPS = [
  {
    id:'health', label:'Assortment Health', accent:'#4259EE',
    kpis:[
      { label:'Active SKUs', value:'4,412', delta:'+3.1%', deltaDir:'up', spark: trendUp(101, 38) },
      { label:'Coverage vs Master', value:'87.4%', delta:'+1.2pp', deltaDir:'up', spark: trendUp(102, 80) },
      { label:'Cluster fit score', value:'0.82', delta:'+0.04', deltaDir:'up', spark: trendUp(103, 60) },
      { label:'Newness (90d)', value:'214', delta:'-12', deltaDir:'down', spark: trendDown(104, 50) },
    ],
  },
  {
    id:'commercial', label:'Commercial Performance', accent:'#3BB273',
    kpis:[
      { label:'Net sales (52w)', value:'$2.84B', delta:'+6.8%', deltaDir:'up', spark: trendUp(201, 60) },
      { label:'Sell-through', value:'71.2%', delta:'+2.4pp', deltaDir:'up', spark: trendUp(202, 65) },
      { label:'GMROI', value:'2.94×', delta:'+0.18', deltaDir:'up', spark: trendUp(203, 55) },
      { label:'Margin %', value:'38.7%', delta:'-0.3pp', deltaDir:'down', spark: trendFlat(204, 60) },
    ],
  },
  {
    id:'risk', label:'Risk & Trapped Capital', accent:'#E74C67',
    kpis:[
      { label:'Stale SKUs', value:'95', delta:'-7', deltaDir:'down', spark: trendDown(301, 55) },
      { label:'Trapped capital', value:'$3.42M', delta:'-$280k', deltaDir:'down', spark: trendDown(302, 70) },
      { label:'Loser persistence', value:'14.6w', delta:'-2.1w', deltaDir:'down', spark: trendDown(303, 60) },
      { label:'Network gap risk', value:'$1.08M', delta:'+$140k', deltaDir:'up', spark: trendUp(304, 50) },
    ],
  },
];

// TreeMap: Category → Subcategory contribution to net sales (with classification share for color blend)
const HINDSIGHT_TREEMAP = [
  { cat:'Tile', color:'#4259EE', children:[
    { name:'Porcelain', value:482, winners:62, losers:8, stale:4 },
    { name:'Ceramic',   value:286, winners:34, losers:14, stale:6 },
    { name:'Natural Stone', value:198, winners:22, losers:9, stale:3 },
    { name:'Glass',     value:74,  winners:6,  losers:18, stale:9 },
  ]},
  { cat:'Wood', color:'#3BB273', children:[
    { name:'LVP',           value:312, winners:48, losers:6, stale:2 },
    { name:'Engineered',    value:241, winners:31, losers:11, stale:4 },
    { name:'Solid Hardwood',value:152, winners:14, losers:21, stale:8 },
  ]},
  { cat:'Installation', color:'#E1BC29', children:[
    { name:'Mortar',        value:188, winners:24, losers:3, stale:1 },
    { name:'Grout',         value:124, winners:16, losers:5, stale:2 },
    { name:'Trim & Adhesive', value:96,  winners:11, losers:7, stale:4 },
  ]},
  { cat:'Stone', color:'#8C9AF4', children:[
    { name:'Slab',          value:142, winners:18, losers:4, stale:2 },
    { name:'Mosaic',        value:62,  winners:7,  losers:11, stale:6 },
  ]},
  { cat:'Decorative', color:'#E74C67', children:[
    { name:'Wall Tile',     value:88, winners:9,  losers:14, stale:7 },
    { name:'Backsplash',    value:54, winners:5,  losers:18, stale:11 },
  ]},
];

// Bubble graph: subcategory plotted by sell-through (x), margin (y), bubble = revenue
const HINDSIGHT_BUBBLES = [
  { name:'Porcelain Tile',    cat:'Tile',         sellThrough:81, margin:42, revenue:482, classification:'Winner' },
  { name:'Ceramic Tile',      cat:'Tile',         sellThrough:62, margin:38, revenue:286, classification:'Neutral' },
  { name:'Natural Stone Tile',cat:'Tile',         sellThrough:58, margin:46, revenue:198, classification:'Winner' },
  { name:'Glass Tile',        cat:'Tile',         sellThrough:34, margin:32, revenue:74,  classification:'Loser' },
  { name:'LVP',               cat:'Wood',         sellThrough:84, margin:39, revenue:312, classification:'Winner' },
  { name:'Engineered Wood',   cat:'Wood',         sellThrough:69, margin:36, revenue:241, classification:'Neutral' },
  { name:'Solid Hardwood',    cat:'Wood',         sellThrough:48, margin:34, revenue:152, classification:'Loser' },
  { name:'Mortar',            cat:'Installation', sellThrough:88, margin:28, revenue:188, classification:'Winner' },
  { name:'Grout',             cat:'Installation', sellThrough:74, margin:30, revenue:124, classification:'Neutral' },
  { name:'Trim & Adhesive',   cat:'Installation', sellThrough:64, margin:31, revenue:96,  classification:'Neutral' },
  { name:'Slab Stone',        cat:'Stone',        sellThrough:71, margin:48, revenue:142, classification:'Winner' },
  { name:'Mosaic Stone',      cat:'Stone',        sellThrough:36, margin:41, revenue:62,  classification:'Loser' },
  { name:'Wall Tile',         cat:'Decorative',   sellThrough:39, margin:44, revenue:88,  classification:'Loser' },
  { name:'Backsplash',        cat:'Decorative',   sellThrough:28, margin:43, revenue:54,  classification:'Stale' },
];

const CAT_COLOR = {
  'Tile':'#4259EE', 'Wood':'#3BB273', 'Installation':'#E1BC29', 'Stone':'#8C9AF4', 'Decorative':'#E74C67',
};

Object.assign(window, {
  STORES, CLUSTERS, CATEGORIES, SKUS, ALERTS, RECOMMENDATIONS, TASKS, BROADCASTS,
  trendUp, trendDown, trendFlat,
  NETWORK_STORES, CLUSTER_ATTRIBUTES, ACTIVE_CLUSTERS, CLUSTER_RUNS,
  HINDSIGHT_KPI_GROUPS, HINDSIGHT_TREEMAP, HINDSIGHT_BUBBLES, CAT_COLOR,
});
