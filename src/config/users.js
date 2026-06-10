/*
 * Hardcoded user registry — extended in V3 with persona fields.
 *
 * New V3 fields per user:
 *   defaultModule  — the module to land on after login (replaces hard-coded "today")
 *   greeting       — personalised greeting shown in Today persona banner
 *   focusModules   — modules highlighted in the sidebar nav with a dot indicator
 *   storeId        — for store personas, pre-select this store on load
 *   phase / phaseDesc — role context shown on the login quick-fill cards
 */

export const ALL_MODULES = "ALL";

export const USERS = [
  {
    id: "corp",
    email: "karen.m@flooranddecor.com",
    password: "Fd!Corp2025",
    name: "Karen M.",
    role: "VP Merchandising · Corporate",
    avatar: "K",
    color: "#2D6A2D",
    landing: "today",
    defaultModule: "today",
    greeting: "Here's your SS 2026 assortment overview.",
    phase: "Phase 1 & 3",
    phaseDesc: "Setup · Clustering · Approval",
    focusModules: ["admin-planning", "clustering", "catalogue", "national", "approval", "workspace"],
    storeId: null,
    modules: ALL_MODULES,
  },
  {
    id: "regional",
    email: "jason.r@flooranddecor.com",
    password: "Fd!Region2025",
    name: "Jason R.",
    role: "Regional VP · Southeast",
    avatar: "J",
    color: "#0B7A6C",
    landing: "regional",
    defaultModule: "regional",
    greeting: "Here's your Southeast cluster status.",
    phase: "Phase 2",
    phaseDesc: "Regional Review · Store Hub · Hindsight",
    focusModules: ["regional", "store-hub", "hindsight", "intel"],
    storeId: null,
    modules: ALL_MODULES,
  },
  {
    id: "store",
    email: "lisa.t@flooranddecor.com",
    password: "Fd!Store2025",
    name: "Lisa T.",
    role: "Store Manager · 101 I-85 Atlanta",
    avatar: "L",
    color: "#D97706",
    landing: "store-curation",
    defaultModule: "store-curation",
    greeting: "Here's what needs your attention at 101 I-85 Atlanta.",
    phase: "Phase 2",
    phaseDesc: "Store Curation · Store Hub · Hindsight",
    focusModules: ["store-curation", "store-hub", "hindsight"],
    storeId: 101,
    modules: ALL_MODULES,
  },
];

/**
 * Validate email + password against the hardcoded registry.
 * Returns the matching user object (without the password field) on success,
 * or null on failure.
 */
export function authenticate(email, password) {
  const match = USERS.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  );
  if (!match) return null;
  const { password: _pw, ...safeUser } = match;
  return safeUser;
}

/**
 * Returns whether a given user has access to a specific module value.
 */
export function hasModuleAccess(user, moduleValue) {
  if (!user) return false;
  if (user.modules === ALL_MODULES) return true;
  return Array.isArray(user.modules) && user.modules.includes(moduleValue);
}
