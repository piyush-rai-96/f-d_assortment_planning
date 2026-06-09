# StoreHub — Floor & Decor Assortment Intelligence
## Detailed Product & Functional Requirements

**Client:** Floor & Decor  
**Vendor:** Impact Analytics  
**Application name:** StoreHub  
**Document type:** Functional & Product Requirements  
**Version:** v2.0 — April 2026  
**Intended use:** Design system input / Claude design feedback

---

## Overview

This document specifies the end-to-end functional, data, UX, and integration requirements for the three-stage Assortment Intelligence rollout at Floor & Decor, delivered through the **StoreHub** platform. It is organized by stage and sub-module, and is intended to guide UI/UX design, backend engineering, and change management workstreams in parallel.

The three stages are:
- **Stage 1 — Hindsight + Clustering** (Weeks 1–12)
- **Stage 2 — Peer Intelligence: Network Visibility** (Weeks 13–28)
- **Stage 3 — Centralized Category Management** (Weeks 29–44)

---

## Actors & Roles

| Role | Abbreviation | Description |
|------|-------------|-------------|
| Assortment Merchant Manager | AMM | Senior merchant overseeing category decisions at regional/central level |
| Assortment Merchant Specialist | AMS | Store-level merchant responsible for local assortment execution |
| Category Manager | CM | Central team member owning carry/drop/add recommendations |
| Data/Analytics Team | DA | IA-side team managing data pipelines and model outputs |
| Executive Sponsor | EXEC | F&D leadership owning the transformation mandate |
| System Admin | ADMIN | Platform configuration, user management, access control |

---

## Data Sources (All Stages)

| Source | Contents | Access Method |
|--------|----------|---------------|
| PLR App | Sales history, top sellers, basic forecasting | API / DB extract |
| Oracle Retail | System of record — transactions, inventory, orders | API / DB extract |
| Stibo PIM | Product catalog, SKU master, attributes | API / file export |
| Store Master | Store metadata — format, size, location, Pro/DIY ratio | Internal DB |

---

## Navigation Structure

**Application:** StoreHub  
*Adapted from Impact Analytics design system. Module order and naming below is authoritative for all design work.*

```
StoreHub
│
├── Home                                My Store / My District dashboard
│
├── District Intelligence               Network + cluster-level view (AMM and above)
│
├── Store Deep Dive                     Single-store drill-down
│
├── Assortment Intelligence             Core module — all 3 stages live here
│   ├── Hindsight Analytics             Stage 1: SKU performance, classifications, reports
│   ├── Peer Intelligence               Stage 2: peer comparison, SKU explorer, alerts
│   └── Category Recommendations        Stage 3: carry/drop/add workflow
│
├── Planogram Intelligence              POG module (single sub-item only)
│   └── Master POG Management
│
├── Command Center
│   ├── AI Copilot
│   ├── Action Queue
│   └── Communications
│
└── Application Configuration
    └── User Access Management
```

### Role → Navigation Access Matrix

| Nav Item | AMS | AMM | CM | DA | EXEC | ADMIN |
|----------|-----|-----|----|----|------|-------|
| Home | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| District Intelligence | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Store Deep Dive | own store | region | ✓ | ✓ | ✓ | ✓ |
| Hindsight Analytics | own store | region | ✓ | ✓ | ✓ | view |
| Peer Intelligence | own cluster | region | ✓ | ✓ | ✓ | view |
| Category Recommendations | view + annotate | review + modify | create + publish | configure | view | — |
| Master POG Management | view | ✓ | — | — | — | ✓ |
| AI Copilot | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Action Queue | ✓ | ✓ | ✓ | — | view | — |
| Communications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| User Access Management | — | — | — | — | — | ✓ |

---

## Home Dashboard — Components by Role

### AMS Home
- Greeting header: name + store ID + cluster badge + Pro/DIY split indicator
- Last refreshed timestamp + manual refresh trigger
- AI Daily Brief (collapsible) — overnight changes in the store's assortment signals
- KPI strip: SKUs Managed · Tasks Today · Compliance Score · NPS Score
- Issues Needing Attention panel (Assortment Risk — equivalent to Inventory Risk in the StoreHub pattern)
- Positive signals panel (Strong Performance, Compliance On Track, Customer Satisfaction)
- Action Queue (right panel) — top 5 prioritised tasks with CTA buttons
- HQ Broadcasts (right panel) — critical alerts, updates, guidelines

### AMM Home
- District/region summary across all managed stores
- Cluster performance overview — assortment health by cluster
- Stores needing attention — ranked by assortment health score
- Pending recommendation reviews — Stage 3 items awaiting AMM action
- Action Queue and HQ Broadcasts (right panel, same pattern as AMS)

### CM / DA Home
- Network-level assortment health summary
- Recommendation pipeline status tracker: draft → published → under review → executed
- Model performance metrics: acceptance rate, modification rate, outcome delta vs baseline
- Alert volume summary across all stores

---
---

# STAGE 1 — Hindsight + Clustering
**Duration:** 12 weeks  
**Goal:** Build a shared fact base. Classify SKU performance across all stores and categories. Produce the first store cluster map.  
**Primary deliverables:** SKU performance classification + reports · Store cluster map v1

---

## Module 1A — SKU Performance Classification & Reports

### 1A.1 Data Ingestion & Preparation

**Requirements:**
- Ingest 3 years of historical data from PLR, Oracle Retail, and Stibo PIM
- Normalize SKU identifiers across all three sources into a unified product key
- Handle SKU discontinuations, renames, and attribute changes over the 3-year window
- Deduplicate records at the store × SKU × week granularity
- Flag and quarantine records with data quality issues (nulls, outliers, mismatched identifiers); surface a data quality report to DA team
- Support incremental weekly refresh once initial load is complete

**Core fact table — Store × SKU × Week:**

| Field | Type | Description |
|-------|------|-------------|
| store_id | string | Unique store identifier |
| sku_id | string | Unified product key |
| week_start_date | date | ISO week start |
| units_sold | integer | Gross units sold |
| revenue | decimal | Net revenue |
| inventory_on_hand | integer | Units in store |
| sell_through_rate | decimal | Units sold / units received |
| weeks_of_supply | decimal | On-hand / avg weekly sales |
| is_in_assortment | boolean | Whether SKU is actively carried |
| plr_rank | integer | PLR rank at time of snapshot |
| category_id | string | Category code |
| subcategory_id | string | Subcategory code |
| customer_type_split | decimal | % Pro vs DIY sales (where available) |

---

### 1A.2 SKU Performance Classification

Every SKU in every store is classified weekly into one of four states:

| Classification | Criteria |
|---------------|----------|
| **Winner** | Top-quartile sell-through + growing trend + low weeks-of-supply |
| **Neutral** | Mid-range performance; no strong signal in either direction |
| **Loser** | Bottom-quartile sell-through + declining trend + high weeks-of-supply |
| **Stale** | Minimal velocity, long duration, not formally discontinued — "zombie" SKU |

**Cross-store signal flags (computed on top of classification):**

| Flag | Trigger condition |
|------|------------------|
| Network Win — Local Miss | Winner in ≥30% of stores; absent in ≥40% of stores |
| Network Loser — Slow Exit | Loser in ≥30% of stores; still carried in ≥50% of stores |
| Emerging Winner | Statistically significant upward trend over trailing 4-week window; above cluster median |
| At Risk | Declining trajectory over trailing 8 weeks; not yet at Loser threshold |

**Computed metrics per store × category:**
- Sell-through rate: by store, category, subcategory, style cluster (from PIM), and Pro/DIY split
- Trapped capital estimate: average inventory value of all Loser + Stale SKUs per store
- Time-to-exit: number of PLR cycles a SKU spends at Loser status before discontinuation

**Category scope for classification:**
- Tile: ceramic, porcelain, glass, natural stone
- Wood: engineered, solid, LVP
- Stone: natural slab and tile
- Installation materials: mortar, grout, trim, adhesives, underlayment
- Decorative accessories and wall tile

Additional category-level analysis:
- Identify categories with highest cross-store variance → flag as high local-judgment dependency
- Identify categories with low variance and consistent central patterns → prioritise for Stage 3 pilot
- Flag categories where Pro/DIY split is a strong predictor of SKU performance

---

### 1A.3 SKU Performance Reports

All reports are viewable in-platform within the **Hindsight Analytics** module. Download to Excel/CSV is available from every table view.

**UX requirements across all reports:**
- Each SKU row is drillable: click → trend chart + store-level performance + PLR cycle history
- Filters on every report: store, category, subcategory, time range, Pro/DIY segment, classification (Winner / Loser / Stale / Neutral)
- Reports refresh weekly, aligned to PLR cycle

**Report catalogue:**

| Report | Primary audience | Description |
|--------|-----------------|-------------|
| Store Scorecard | AMS | My store's SKU performance summary — winners, losers, stale, trapped capital |
| Category Deep Dive | AMM | Full category performance across all stores in the region; cross-store variance heatmap |
| Network Win Opportunities | AMM + CM | SKUs winning in peer stores that my store does not carry; ranked by estimated revenue opportunity |
| Zombie SKU Report | AMS + AMM | Stale SKUs by store with duration and capital trapped; recommended for exit review |
| PLR Cycle Audit | AMM | Time-to-exit analysis — how long are losers persisting across PLR cycles? |
| Data Quality Report | DA | Quarantined records, unmatched SKU identifiers, missing fields — internal DA use |

---

## Module 1B — Store Cluster Map

### 1B.1 Store Clustering

**Objective:** Group all stores into behaviorally-meaningful peer clusters. Cluster assignment is the foundational input to Stage 2 peer comparison and Stage 3 recommendation targeting.

**Clustering variables and weights:**

| Variable | Source | Weight |
|----------|--------|--------|
| Pro/DIY customer split | Oracle Retail + Store Master | HIGH — primary variable; must separate Pro-dominant and DIY-dominant stores |
| Store format / size (sq ft) | Store Master | HIGH |
| Category revenue mix (%) | PLR + Oracle Retail | HIGH |
| Regional style demand | PIM attributes + sell-through patterns | MEDIUM |
| Assortment breadth vs depth ratio | Oracle Retail | MEDIUM |
| Competitive context (if available) | External / manual input | MEDIUM |
| Geographic region | Store Master | LOW — geography alone must not drive cluster assignment |

**Cluster architecture:**
- Macro-clusters: 5–8 groups — used for broad peer comparison and network-level reporting
- Micro-clusters: 10–20 groups — used for precise carry/drop/add targeting in Stage 3
- A 70%-Pro store and a 70%-DIY store in the same city must not be in the same macro-cluster

**Cluster profile card — required fields per cluster:**

| Field | Description |
|-------|-------------|
| Cluster ID + name | Editable label |
| Store count | Number of stores in cluster |
| Avg Pro/DIY split | Mean split across stores |
| Dominant categories | Top 3 categories by revenue share |
| Avg store size (sq ft) | Mean format size |
| Top 10 shared Winner SKUs | Most common winners across cluster |
| Top 10 shared Loser SKUs | Most common losers across cluster |
| Representative stores | 3–5 named examples shown to AMM/CM level |

**Governance:**
- Cluster assignments are reviewable and editable by DA team — all edits are audit-logged
- AMMs can view their stores' cluster assignments and the plain-language rationale
- AMS can see their own store's cluster assignment and macro-cluster peers (anonymised at individual store level)

**Stage 1 Deliverables Checklist:**
- [ ] Unified data model loaded and validated across PLR, Oracle Retail, Stibo PIM
- [ ] Data quality report reviewed and signed off by DA
- [ ] SKU performance classification complete: all stores × all categories × 3-year window
- [ ] Cross-store flags computed: Network Win/Miss, Network Loser/Slow Exit, Emerging Winner, At Risk
- [ ] All 5 Hindsight reports published and accessible in StoreHub
- [ ] Store cluster map v1 published: macro and micro levels
- [ ] Cluster assignments reviewed and approved by DA + AMM leads
- [ ] Stage 1 findings presented to EXEC before Stage 2 begins

---
---

# STAGE 2 — Peer Intelligence: Network Visibility
**Duration:** 16 weeks  
**Goal:** Give every store and merchant a live view of what comparable peer stores carry, win with, and are missing. Build transparency and trust before decision rights shift.  
**Platform module:** Peer Intelligence (under Assortment Intelligence in nav)

---

## Module 2A — Peer Intelligence Platform

### 2A.1 Platform Architecture

**Requirements:**
- Web-based application — responsive, optimised for desktop and tablet
- Role-based access: AMS sees own store + cluster peers (anonymised); AMM sees region + full cluster including named stores; CM sees full network
- SSO integration with F&D identity provider
- Audit log on all user actions: views, filters, exports, annotations
- Data refresh cadence: weekly, aligned to PLR cycle

---

### 2A.2 My Store View

The primary home screen for AMS users within the Peer Intelligence module.

| Section | Contents |
|---------|----------|
| Store header | Store name, cluster assignment badge, Pro/DIY split, store format |
| Performance snapshot | Current-week sell-through summary; top 5 winners; top 5 losers |
| Assortment health score | Composite score: sell-through trend + winner coverage + loser exit pace |
| Alerts panel | Network Win opportunities, Zombie SKU flags, peer anomalies — max 10 per week (standard format); max 15 per week (large format >80,000 sq ft) |
| Quick actions | Drill into category · View peer cluster · Flag SKU for review |

**UX requirements:**
- Dashboard loads in < 3 seconds
- Alerts are ranked by estimated revenue impact — not a flat chronological list
- Assortment health score is explainable: clicking it opens a component breakdown with definitions
- Alert limits are configurable by ADMIN per store tier

---

### 2A.3 Peer Store Comparison View

The core differentiating feature of Peer Intelligence. Entry point is category-first.

**Navigation flow:**
> Select category → view side-by-side store vs cluster metrics → drill to SKU level

**Category-level comparison table (My Store vs Cluster):**

| Metric | My Store | Cluster Avg | Cluster Top Quartile |
|--------|----------|-------------|----------------------|
| # SKUs carried | ✓ | ✓ | ✓ |
| Avg sell-through rate | ✓ | ✓ | ✓ |
| # Winners carried | ✓ | ✓ | ✓ |
| # Network Winners not carried | ✓ | — | — |
| # Losers still carried | ✓ | ✓ | — |
| Trapped capital estimate | ✓ | ✓ | — |

**Drill-down — Network Winners Not Carried:**
- List of specific SKUs: name, SKU ID, category, sell-through in peer stores, % of peers carrying
- Pro/DIY performance split shown where available
- Action: "Add to Review List" — adds to AMS personal working queue

**Drill-down — Losers Still Carried:**
- List of specific SKUs with: time-in-Loser-status (weeks), estimated capital trapped, PLR cycle count
- Action: "Flag for Exit Review" — surfaces in Action Queue

**Peer visibility privacy rules:**
- AMS level: peer data shown as cluster aggregate only — no individual store names revealed
- AMM level: individual store names visible within their managed region
- CM level: full network visibility

**Filters:** category · subcategory · Pro/DIY segment · time range · cluster type (macro / micro)

---

### 2A.4 SKU Opportunity Explorer

A searchable, filterable catalogue of all SKUs with full network performance context.

**Per-SKU data displayed:**

| Data point | Scope |
|------------|-------|
| Carrying status | My store: yes/no, current sell-through, trend direction |
| Cluster performance | % of cluster peers carrying; avg sell-through among carriers |
| Network performance | % of all stores carrying; avg network sell-through; classification |
| Pro/DIY split | Performance breakdown by customer type where data available |
| Active flags | See flag types below |

**SKU flag types:**

| Flag | Icon | Trigger |
|------|------|---------|
| Network Win — Not Carried | 🟢 | Winner in ≥30% of cluster peers; absent in my store |
| Network Loser — Still Carried | 🔴 | Loser in ≥30% of cluster peers; still active in my store |
| Emerging Winner | 🟡 | Strong upward trend in peers over last 4 weeks |
| Stale | ⚪ | Minimal velocity; long duration; candidate for exit |

**Confidence score:** displayed per SKU — 0 to 100 scale; clicking the score shows a plain-language breakdown of contributing factors (data completeness, peer agreement strength, annotation overrides).

**Review List:**
- AMS and AMM can add any SKU to a personal Review List — a working queue for upcoming PLR cycle
- Review List is shareable with AMM via one-click share
- CM can view all active Review Lists across the network

---

### 2A.5 Feedback & Annotation Layer

**Requirements:**
- On any SKU flag or recommendation, AMS/AMM can add a free-text comment explaining local context
- Comments are visible to DA team and CM
- "Disagree" action available on every system signal — requires a reason from a predefined list plus optional free text:

| Disagree reason | Description |
|----------------|-------------|
| Local customer preference | Store's customer mix makes this signal inapplicable |
| Pending supplier change | Supplier transition underway — signal is temporary |
| Already actioned | Decision already made; system has not yet updated |
| Other | Free text required |

- All disagreements are logged with timestamp, role, store, SKU, and reason
- Disagreements surface to DA team in a weekly digest — DA reviews and decides what, if anything, triggers a model update (human in the loop; no automatic propagation)
- Annotation activity (volume, patterns, repeat disagreers) is a leading indicator of low trust — surfaced to CM and DA in a weekly report

---

## Module 2B — Network Learning Engine

### 2B.1 Winner/Loser Signal Propagation

**Requirements:**
- When a SKU achieves Winner status in ≥N stores within a cluster (default N = 3; ADMIN-configurable), generate a Cluster Alert for all stores in that cluster not carrying it
- When a SKU reaches Loser status across ≥M stores network-wide (default M = 5; ADMIN-configurable), generate a Network Loser Alert for all stores still carrying it
- Alerts appear in My Store View and in Action Queue
- Notification preferences: in-platform (default on) + email digest (default weekly; user-configurable to daily or off)
- Alert fatigue management:
  - Standard format stores (50,000–80,000 sq ft): max 10 alerts per week
  - Large format stores (>80,000 sq ft): max 15 alerts per week
  - Alerts ranked by estimated revenue impact; lower-ranked alerts held for next week's batch
  - Both thresholds configurable by ADMIN per store

### 2B.2 Sell-Through Trend Detection

**Requirements:**
- Detect SKUs with statistically significant upward trend over trailing 4-week and 8-week windows
- Flag as Emerging Winner: trend is positive AND current sell-through is above cluster median
- Detect SKUs declining over trailing 8 weeks but not yet at Loser threshold → flag as At Risk
- Every trend flag includes a sparkline chart showing the weekly sell-through trajectory — the data must be visible alongside the flag, not behind a second click

**Stage 2 Deliverables Checklist:**
- [ ] Peer Intelligence module deployed to UAT environment
- [ ] All stores loaded with cluster assignments and peer relationships
- [ ] My Store View live for all AMS users
- [ ] Peer Comparison View (category-first) live for all AMM users
- [ ] SKU Opportunity Explorer live with all 4 flag types active
- [ ] Confidence scores displayed on all SKU flags
- [ ] Feedback / Annotation layer live
- [ ] Disagree workflow operational with DA digest running
- [ ] Network Learning Engine running weekly refresh
- [ ] Alert volume management operational (10/15 limits active)
- [ ] UAT completed with ≥10 AMMs/AMSs; feedback incorporated
- [ ] Go-live training completed across all stores
- [ ] Pilot Go-Live: Peer Intelligence live network-wide

---
---

# STAGE 3 — Centralized Category Management
**Duration:** 16 weeks  
**Goal:** Generate centralized carry/drop/add recommendations. Prove the model on pilots. Scale the shift from local to central decision-making.  
**Platform module:** Category Recommendations (under Assortment Intelligence in nav)

---

## Module 3A — Category Management Engine

### 3A.1 Recommendation Generation

For each store × category combination, the engine generates one of three recommendation types:

| Recommendation | Definition |
|---------------|------------|
| **CARRY** | SKU should be retained — strong performance or strategic hold |
| **DROP** | SKU should be exited — Loser or Stale with no strategic reason to retain |
| **ADD** | SKU not currently carried that is a Network Winner in the store's peer cluster |

**Recommendation inputs:**

| Input | Source | Role |
|-------|--------|------|
| SKU classification | Stage 1 model | Primary signal: Winner / Neutral / Loser / Stale |
| Cluster peer performance | Peer Intelligence engine | Peer carry rate + sell-through comparison |
| Pro/DIY split | Store Master + Oracle Retail | Adjusts thresholds — Pro SKUs held to higher bar |
| Space constraints | Store Master | Max SKUs per category per format tier |
| Supplier constraints | Manual input / PIM | Min order quantities, exclusivities |
| AMS/AMM annotations | Feedback layer (Stage 2) | Override signals from disagreement log |
| PLR cycle timing | PLR App | Recommendations aligned to next available PLR window |

**Confidence score per recommendation:** 0–100; displayed to all users; clicking shows plain-language breakdown.

**Pro SKU DROP protection:**
- A Pro SKU requires persistent Loser status across ≥3 consecutive PLR cycles before a DROP recommendation is generated
- A single Loser classification is insufficient — the system must confirm the trend is sustained
- Rationale: a dropped Pro SKU breaks installer trust that compounds over years

**ADD recommendation space constraint:**
- ADD recommendations are rank-ordered by expected sell-through
- The system never recommends more ADDs than available assortment slots in the store's format
- Space constraints are sourced from Store Master and reviewed with AMM before Stage 3 begins

---

### 3A.2 80/20 Decision Framework (Phase A)

**Requirements:**
- 80% of SKUs in pilot categories receive a central recommendation (CARRY / DROP / ADD)
- 20% of SKUs are flagged as AMM/AMS Discretion — complex or ambiguous cases held for local judgment

**Criteria for AMM/AMS Discretion flag:**

| Criterion | Reason |
|-----------|--------|
| Conflicting signals | SKU is a Winner in some cluster peers, Loser in others — no clear central signal |
| Recent AMM annotation | An AMM has added local context that overrides the model signal |
| High-variance subcategory | Decorative tile accents, seasonal items — style variance too high for central call |
| Insufficient data | New SKU with < 8 weeks of sell-through history |

AMM/AMS Discretion SKUs surface in the Category Recommendations module with a **"Your call"** badge — full data context provided alongside, no recommendation withheld.

---

### 3A.3 Recommendation Review Workflow

A structured 4-step workflow governs all Stage 3 decisions:

**Step 1 — CM Generates Recommendations**
- CM selects pilot category + target cluster(s)
- System generates CARRY / DROP / ADD list for all in-scope stores
- CM reviews the list, can override individual recommendations with a mandatory annotation
- CM publishes the recommendation set → AMM review window opens

**Step 2 — AMM Review Window** (default 5 business days; ADMIN-configurable)
- AMM sees all recommendations for stores in their region
- Per-recommendation actions:

| Action | Description | Notes |
|--------|-------------|-------|
| Accept | Agrees with recommendation | Default — inaction = acceptance after window closes |
| Modify | Changes CARRY→DROP, DROP→CARRY, etc. | Mandatory reason required |
| Escalate | Flags for CM discussion | Escalated items paused; CM and AMM resolve together |

**Step 3 — AMS Acknowledgment**
- AMS sees final approved recommendations for their store
- Can add execution notes (e.g., "Supplier lead time 6 weeks — timing adjustment needed")
- Cannot reverse recommendations — escalation path only if disagreement

**Step 4 — Execution Tracking**
- Track each recommendation as: Pending → Accepted → Executed OR Accepted — Not Executed
- Stores with high "accepted but not executed" rates are automatically flagged to CM for follow-up
- Execution status feeds the outcome measurement model in Phase B

---

### 3A.4 Outcome Measurement — Prove the Model (Phase B)

**Requirements:**
- Tag every pilot store's assortment decision as: centrally recommended vs. locally driven
- Compare outcomes across three groups:

| Group | Description |
|-------|-------------|
| Central — Accepted & Executed | Recommendations followed in pilot stores |
| Control | Equivalent stores in same cluster, not in pilot |
| Local Override | Centrally recommended but modified/rejected by AMM |

**Metrics tracked per group:**
- Sell-through rate (4-week, 8-week, PLR-cycle rolling)
- Revenue per SKU
- Trapped capital change
- Time-to-exit on Losers

**Reporting cadence:** 4-week rolling · 8-week rolling · PLR-cycle aligned

**"Model vs. Local" report:**
- Shareable with AMMs/AMSs and EXEC
- Shows where central guidance outperformed local override, and vice versa
- Modification rate tracked (how often AMMs changed a recommendation) + outcome of those modifications → used to refine when local override adds value

---

### 3A.5 Pilot Category Selection

**Selection criteria:**

| Criterion | Rationale |
|-----------|-----------|
| Moderate cross-store variance | Not trivially uniform; not so chaotic that results are uninterpretable |
| ≥50 active SKUs per store | Sufficient signal volume for carry/drop/add recommendations |
| Clear Pro/DIY segmentation | Validates Pro/DIY clustering variable in a live environment |
| Manageable supplier relationships | Avoids supplier complexity distorting pilot results |

Recommended pilot candidates to be confirmed after Stage 1 delivery — likely tile subcategories or installation materials based on variance analysis.

---

## Module 3B — Change Management

### 3B.1 Change Management Charter

Must be defined and signed off before Stage 3 begins:
- Executive sponsor named and communicated to all AMMs/AMSs
- Change narrative agreed: "This is about better information, not headquarters taking over"
- AMM champions identified (1–2 per region) — early adopters who will advocate to peers
- Escalation and dispute resolution process defined and published
- Communication calendar: what is communicated, when, and by whom

### 3B.2 Training Plan

| Training | Audience | Format | Timing |
|----------|----------|--------|--------|
| StoreHub platform orientation | All AMS | Self-paced + live Q&A | Before Stage 2 go-live |
| Reading a SKU classification and report | All AMS + AMM | Live workshop | Stage 1 delivery |
| Using Peer Intelligence — category and SKU views | All AMS + AMM | Live workshop | Before Stage 2 go-live |
| Reading a recommendation and using the review workflow | All AMM | Live workshop | Before Stage 3 Phase A |
| Outcome review — reading the Model vs. Local report | AMM + CM | Live session | After first 8-week outcome report |
| Advanced: cluster logic and recommendation engine | CM + DA | Live deep-dive | Stage 3 Phase B |

### 3B.3 Feedback Cadence

- Monthly AMM feedback sessions during Stage 3 — structured agenda, recorded
- Bi-weekly DA + CM sync on model performance and annotation patterns
- Quarterly EXEC review: model accuracy, adoption rates, outcome metrics vs baseline

---

## Module 3C — Scaling (Phase C)

### 3C.1 Activation Criteria

Phase C is triggered when all three success criteria are met (confirmed with EXEC before Stage 3 begins):

| Criterion | Threshold |
|-----------|-----------|
| Central recommendations outperform decentralised baseline on sell-through | Specific % TBD with EXEC post-Stage 1 baseline |
| AMM modification rate stabilises | AMMs are no longer systematically overriding — rate trending down and plateauing |
| AMS satisfaction score | ≥4 / 5 from StoreHub in-platform feedback surveys |

### 3C.2 Phase C Changes

- Expand Category Recommendations to all categories (not just pilot categories)
- Shift discretion budget: 50% central / 50% AMM flex → moving toward 70/30 over time based on evidence
- AMM role reframed: from assortment decision-maker → local execution expert + customer engagement lead
- CM team operates as the primary assortment intelligence centre of gravity with full-network data

---

## Non-Functional Requirements

| Requirement | Specification |
|-------------|--------------|
| Performance | Dashboard load < 3 seconds; report generation < 10 seconds |
| Uptime | 99.5% during business hours (Mon–Sat, 6am–10pm local store time) |
| Data freshness | Weekly refresh aligned to PLR cycle; real-time for alert generation |
| Security | Role-based access; SOC 2 Type II compliance; AMS cannot see individual peer store data |
| Accessibility | WCAG 2.1 AA minimum |
| Browser support | Chrome, Edge, Safari — latest 2 major versions; Internet Explorer not supported |
| Device | Tablet-optimised for AMS floor use; desktop-primary for AMM and CM |
| Audit trail | All user actions logged: timestamp, role, store ID, action type |
| Data retention | 5 years of transactional history; recommendation history retained indefinitely |
| Export | All tables and reports exportable to CSV and Excel |
| Alert volume | 10 alerts/week for standard format (50,000–80,000 sq ft); 15 for large format (>80,000 sq ft); ADMIN-configurable |

---

## Resolved Design Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Peer comparison entry point | **Category-first.** Matches AMM/AMS mental model — merchants think in categories. SKU explorer is a drill-down, not the entry point. |
| 2 | Show confidence score to AMS? | **Yes — display with explanation.** Transparency builds trust. Score shown with plain-language breakdown of contributing factors. |
| 3 | Pro SKU discontinuation guard | **3 PLR cycles confirmed.** Conservative threshold appropriate for Pro loyalty risk. |
| 4 | Alert volume per store per week | **10 standard / 15 large-format.** Based on F&D's ~4,400 SKUs/store at 78,000 avg sq ft — a 2–3% weekly status-change rate yields 88–132 SKUs with new signals; ~10–15% cross a meaningful threshold. Both limits ADMIN-configurable. |
| 5 | Annotation / disagreement data ownership | **DA team reviews (human in the loop).** Disagreements do not auto-propagate into the model. DA reviews patterns bi-weekly and decides what triggers a model update. |
| 6 | Phase C success criteria — outperformance % | **TBD with EXEC post-Stage 1.** Baseline must be established from Stage 1 data before a meaningful target can be set. |

---

## Implementation Roadmap Summary

| Stage | Weeks | Key Milestones |
|-------|-------|----------------|
| Stage 1 — Hindsight + Clustering | W1–W12 | Data ingestion · SKU classifications · Hindsight reports · Cluster map v1 |
| Stage 2 — Peer Intelligence | W13–W28 | StoreHub UAT · Peer Intelligence go-live · Network Learning Engine live |
| Stage 3 — Category Management | W29–W44 | Pilot category recommendations · Model vs Local outcome reporting · Phase C evaluation |

*Timeline is directional — final schedule to be shaped during initial discovery.*

---

*StoreHub — Prepared by Impact Analytics for Floor & Decor · April 2026 · Confidential · Not for external distribution.*
