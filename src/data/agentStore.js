/*
 * Lightweight mutable singleton so Workspace can write the agent plan result
 * and Catalogue can read it on next mount — without prop-drilling or a global
 * state library.  React doesn't track this, so Catalogue picks it up on the
 * next navigation (re-mount), which is the correct UX:
 *   1. User runs agent in Workspace → animation plays → plan committed here.
 *   2. User navigates to Catalogue → fresh mount reads latest plan → tiers update.
 */

let _plan = { natDecisions: {}, clusterDecisions: {}, agentRunAt: null };

export const getAgentPlan = () => _plan;
export const setAgentPlan = (patch) => { _plan = { ..._plan, ...patch }; };
export const resetAgentPlan = () => {
  _plan = { natDecisions: {}, clusterDecisions: {}, agentRunAt: null };
};
