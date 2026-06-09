// icons.jsx — line icons, 1.5px stroke, 24-viewBox.
const I = ({ size = 20, children, style, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{flex:'0 0 auto', ...style}} {...rest}>
    {children}
  </svg>
);

const IconHome = (p) => <I {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></I>;
const IconNetwork = (p) => <I {...p}><circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 6.5L10 10M17 6.5L14 10M7 17.5L10 14M17 17.5L14 14"/></I>;
const IconStore = (p) => <I {...p}><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"/><path d="M3 9h18"/><path d="M9 13h6v8H9z"/></I>;
const IconLayers = (p) => <I {...p}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></I>;
const IconChart = (p) => <I {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-7"/></I>;
const IconUsers = (p) => <I {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>;
const IconList = (p) => <I {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></I>;
const IconBlueprint = (p) => <I {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></I>;
const IconSparkles = (p) => <I {...p}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 15l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/></I>;
const IconBolt = (p) => <I {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></I>;
const IconMail = (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></I>;
const IconCog = (p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></I>;
const IconLogout = (p) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></I>;
const IconSearch = (p) => <I {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></I>;
const IconCommand = (p) => <I {...p}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></I>;
const IconHelp = (p) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></I>;
const IconBell = (p) => <I {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></I>;
const IconChevronRight = (p) => <I {...p}><path d="M9 18l6-6-6-6"/></I>;
const IconChevronDown = (p) => <I {...p}><path d="M6 9l6 6 6-6"/></I>;
const IconChevronLeft = (p) => <I {...p}><path d="M15 18l-6-6 6-6"/></I>;
const IconPlus = (p) => <I {...p}><path d="M12 5v14M5 12h14"/></I>;
const IconX = (p) => <I {...p}><path d="M18 6L6 18M6 6l12 12"/></I>;
const IconFilter = (p) => <I {...p}><path d="M3 6h18M7 12h10M10 18h4"/></I>;
const IconDownload = (p) => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></I>;
const IconArrowUp = (p) => <I {...p}><path d="M12 19V5M5 12l7-7 7 7"/></I>;
const IconArrowDown = (p) => <I {...p}><path d="M12 5v14M5 12l7 7 7-7"/></I>;
const IconArrowRight = (p) => <I {...p}><path d="M5 12h14M13 5l7 7-7 7"/></I>;
const IconCheck = (p) => <I {...p}><path d="M20 6L9 17l-5-5"/></I>;
const IconWarning = (p) => <I {...p}><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></I>;
const IconInfo = (p) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></I>;
const IconMore = (p) => <I {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></I>;
const IconRefresh = (p) => <I {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></I>;
const IconStar = (p) => <I {...p}><path d="M12 2l3 7 7 .8-5.2 4.8 1.5 7.4L12 18l-6.3 4 1.5-7.4L2 9.8 9 9z"/></I>;
const IconExternal = (p) => <I {...p}><path d="M14 3h7v7"/><path d="M21 3l-9 9"/><path d="M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7"/></I>;
const IconBookmark = (p) => <I {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></I>;
const IconFlag = (p) => <I {...p}><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></I>;
const IconTrend = (p) => <I {...p}><path d="M22 7l-9 9-4-4-7 7"/><path d="M16 7h6v6"/></I>;
const IconTrendDown = (p) => <I {...p}><path d="M22 17l-9-9-4 4-7-7"/><path d="M16 17h6v-6"/></I>;
const IconClock = (p) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></I>;
const IconShield = (p) => <I {...p}><path d="M12 2l9 4v6c0 5-3.8 9.4-9 10-5.2-.6-9-5-9-10V6z"/></I>;
const IconUserCircle = (p) => <I {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6 20a6 6 0 0 1 12 0"/></I>;
const IconMessage = (p) => <I {...p}><path d="M21 11.5a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.6 4.5 8.4 8.4 0 0 1-4-1L3 21l2-5.4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 4.5-7.5 8.4 8.4 0 0 1 4-1h.5a8.5 8.5 0 0 1 8 8z"/></I>;
const IconBuilding = (p) => <I {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></I>;
const IconRing = (p) => <I {...p}><circle cx="12" cy="12" r="9"/></I>;
const IconLink = (p) => <I {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7L12 5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"/></I>;
const IconBox = (p) => <I {...p}><path d="M21 8L12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/></I>;
const IconEye = (p) => <I {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></I>;
const IconCircleDot = (p) => <I {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/></I>;

Object.assign(window, {
  IconHome, IconNetwork, IconStore, IconLayers, IconChart, IconUsers, IconList,
  IconBlueprint, IconSparkles, IconBolt, IconMail, IconCog, IconLogout,
  IconSearch, IconCommand, IconHelp, IconBell,
  IconChevronRight, IconChevronDown, IconChevronLeft, IconPlus, IconX,
  IconFilter, IconDownload, IconArrowUp, IconArrowDown, IconArrowRight,
  IconCheck, IconWarning, IconInfo, IconMore, IconRefresh, IconStar,
  IconExternal, IconBookmark, IconFlag, IconTrend, IconTrendDown,
  IconClock, IconShield, IconUserCircle, IconMessage, IconBuilding, IconRing,
  IconLink, IconBox, IconEye, IconCircleDot,
});
