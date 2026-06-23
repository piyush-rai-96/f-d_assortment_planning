/**
 * UsersRoles.jsx — Dedicated Users & Roles screen in the Admin module.
 * Matches HTML v9-7-2 renderAdminPlanning(users branch) with full Impact UI polish.
 */
import React, { useState } from "react";
import { Card, Badge, Button } from "impact-ui";
import {
  Users, UserPlus, Mail, Shield, CheckCircle2,
  Clock, AlertCircle, ChevronDown, X, Send
} from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import { ADMIN_USERS, ROLE_DEFINITIONS } from "../data/admin.js";
import { panelSx } from "../styles/panelSx.js";
import "./UsersRoles.css";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Active:  { badge: "success", icon: <CheckCircle2 size={11} />, label: "Active"  },
  Pending: { badge: "warning", icon: <Clock size={11} />,        label: "Pending" },
  Inactive:{ badge: "neutral", icon: <AlertCircle size={11} />,  label: "Inactive"},
};

const ROLE_BADGE = {
  "VP Merchandising": "info",
  "Regional VP":      "success",
  "Merchant Analyst": "info",
  "Buyer":            "warning",
  "Store Manager":    "warning",
  "Planning Admin":   "error",
};

const LEVEL_COLOR = {
  Corporate: { color: "#1D4ED8", bg: "#DBEAFE" },
  Regional:  { color: "#0B7A6C", bg: "#E6F7F4" },
  Dept:      { color: "#B45309", bg: "#FEF3C7" },
  Store:     { color: "#7C3AED", bg: "#F5F3FF" },
  System:    { color: "#DC2626", bg: "#FEF2F2" },
};

const PERMISSION_COLOR = [
  "#1D4ED8","#0B7A6C","#7C3AED","#B45309","#DC2626","#059669","#9333EA",
];

function getPermColor(i) { return PERMISSION_COLOR[i % PERMISSION_COLOR.length]; }

function Avatar({ user }) {
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div className="ur-avatar" style={{ background: user.color }}>
      {initials}
    </div>
  );
}

export default function UsersRoles() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("");
  const [inviteSent, setInviteSent]   = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = ADMIN_USERS.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:   ADMIN_USERS.length,
    active:  ADMIN_USERS.filter((u) => u.status === "Active").length,
    pending: ADMIN_USERS.filter((u) => u.status === "Pending").length,
    roles:   ROLE_DEFINITIONS.length,
  };

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteRole) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("");
    }, 2200);
  };

  return (
    <div className="ur-page">
      {/* ── Navy header ── */}
      <div className="ur-nav-header">
        <div className="ur-nav-header-left">
          <div className="ur-nav-icon-wrap">
            <Users size={20} color="#fff" />
          </div>
          <div>
            <Text variant="title" style={{ color: "#fff", fontWeight: 800 }}>Users &amp; Roles</Text>
            <Text variant="micro" style={{ color: "rgba(255,255,255,.6)", marginTop: 2 }}>
              Manage team access, permissions, and role assignments across all modules
            </Text>
          </div>
        </div>
        <Button variant="primary" size="medium" onClick={() => setInviteOpen((o) => !o)}>
          <UserPlus size={14} style={{ marginRight: 6 }} />
          {inviteOpen ? "Cancel" : "Invite user"}
        </Button>
      </div>

      {/* ── Invite panel (slides in below header) ── */}
      {inviteOpen && (
        <div className="ur-invite-panel">
          <div className="ur-invite-inner">
            <div className="ur-invite-title">
              <Mail size={16} style={{ color: "#6366F1" }} />
              <Text variant="body-strong" tone="strong">Invite a new team member</Text>
            </div>
            <div className="ur-invite-fields">
              <div className="ur-invite-field">
                <label className="ur-field-label">Email address</label>
                <input
                  className="ur-text-input"
                  placeholder="name@fd.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="ur-invite-field" style={{ flex: "0 0 220px" }}>
                <label className="ur-field-label">Role</label>
                <div className="ur-select-wrap">
                  <select
                    className="ur-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="">Select role…</option>
                    {ROLE_DEFINITIONS.map((r) => (
                      <option key={r.role} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="ur-select-caret" />
                </div>
              </div>
              <button
                className={`ur-send-btn${inviteSent ? " sent" : ""}${!inviteEmail || !inviteRole ? " disabled" : ""}`}
                onClick={handleSendInvite}
              >
                {inviteSent
                  ? <><CheckCircle2 size={14} />Invite sent!</>
                  : <><Send size={13} />Send invite</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ur-page-body">
        {/* ── Stats strip ── */}
        <div className="ur-stats-strip">
          {[
            { label: "Total users",    value: stats.total,   accent: "#6366F1", sub: "in the system",        icon: <Users size={16} /> },
            { label: "Active",         value: stats.active,  accent: "#059669", sub: "have access today",    icon: <CheckCircle2 size={16} /> },
            { label: "Pending invite", value: stats.pending, accent: "#D97706", sub: "awaiting confirmation", icon: <Clock size={16} /> },
            { label: "Roles defined",  value: stats.roles,   accent: "#7C3AED", sub: "role templates",       icon: <Shield size={16} /> },
          ].map((s) => (
            <Card key={s.label} sx={{ ...panelSx, flex: 1, minWidth: 0 }}>
              <div className="ur-stat-inner">
                <div className="ur-stat-icon" style={{ color: s.accent, background: s.accent + "18" }}>
                  {s.icon}
                </div>
                <div>
                  <div className="ur-stat-value" style={{ color: s.accent }}>{s.value}</div>
                  <div className="ur-stat-label">{s.label}</div>
                  <div className="ur-stat-sub">{s.sub}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Users table ── */}
        <Card sx={{ ...panelSx, padding: 0, marginTop: 20 }}>
          {/* Card header with search */}
          <div className="ur-table-header">
            <div>
              <Text variant="body-strong" tone="strong">Team members</Text>
              <Text variant="micro" tone="muted" style={{ marginTop: 3 }}>
                {filteredUsers.length} of {ADMIN_USERS.length} users shown
              </Text>
            </div>
            <input
              className="ur-search"
              placeholder="Search name, email or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Col heads */}
          <div className="ur-col-head">
            <div>Team member</div>
            <div>Email</div>
            <div>Role</div>
            <div>Access scope</div>
            <div>Last active</div>
            <div>Status</div>
          </div>

          {filteredUsers.map((u, i) => {
            const sc = STATUS_CONFIG[u.status] || STATUS_CONFIG.Active;
            return (
              <div
                key={u.id}
                className={`ur-user-row${i % 2 === 1 ? " alt" : ""}${i === filteredUsers.length - 1 ? " last" : ""}`}
              >
                {/* Name + avatar */}
                <div className="ur-name-cell">
                  <Avatar user={u} />
                  <div>
                    <Text variant="caption" style={{ fontWeight: 600 }}>{u.name}</Text>
                    <Text variant="micro" tone="muted">{u.id}</Text>
                  </div>
                </div>
                {/* Email */}
                <div>
                  <Text variant="caption" tone="muted">{u.email}</Text>
                </div>
                {/* Role badge */}
                <div>
                  <Badge variant="subtle" size="small" color={ROLE_BADGE[u.role] || "neutral"} label={u.role} />
                </div>
                {/* Access */}
                <div>
                  <span className="ur-scope-chip">{u.access}</span>
                </div>
                {/* Last active */}
                <div>
                  <Text variant="micro" tone="muted">{u.lastActive}</Text>
                </div>
                {/* Status */}
                <div>
                  <span className={`ur-status-chip ur-status-${u.status.toLowerCase()}`}>
                    {sc.icon}{u.status}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="ur-empty-state">
              <Users size={28} style={{ color: "#CBD5E1" }} />
              <Text variant="body" tone="muted">No users match your search</Text>
            </div>
          )}
        </Card>

        {/* ── Role definitions grid ── */}
        <div style={{ marginTop: 24 }}>
          <Text variant="body-strong" tone="strong" style={{ marginBottom: 12, display: "block" }}>
            Role definitions
          </Text>
          <div className="ur-roles-grid">
            {ROLE_DEFINITIONS.map((rd) => {
              const lc = LEVEL_COLOR[rd.level] || LEVEL_COLOR.System;
              const userCount = ADMIN_USERS.filter((u) => u.role === rd.role).length;
              return (
                <Card key={rd.role} sx={{ ...panelSx }}>
                  <div className="ur-role-card-top">
                    <div className="ur-role-icon" style={{ color: lc.color, background: lc.bg }}>
                      <Shield size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="caption" style={{ fontWeight: 700 }}>{rd.role}</Text>
                      <div className="ur-role-badges">
                        <span className="ur-level-chip" style={{ color: lc.color, background: lc.bg }}>{rd.level}</span>
                        <span className="ur-count-chip">
                          <Users size={10} />{userCount} {userCount === 1 ? "user" : "users"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ur-perm-list">
                    {rd.permissions.map((p, pi) => (
                      <span
                        key={p}
                        className="ur-perm-chip"
                        style={{
                          color: getPermColor(pi),
                          background: getPermColor(pi) + "18",
                          borderColor: getPermColor(pi) + "33",
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
