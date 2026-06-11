import React from "react";
import { Card, Badge, Text } from "impact-ui";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./ModulePlaceholder.css";

/*
 * Temporary content shown for any module until its real view is built.
 * Reflects the active module selected in the Sidebar so the shell feels live.
 */
export default function ModulePlaceholder({ moduleLabel, groupLabel, activeModule }) {
  const { user } = useAuth();
  const isToday = activeModule === "today";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <Stack direction="column" gap={5} className="fd-placeholder">
      <Badge
        variant="subtle"
        label={`${groupLabel ? `${groupLabel} · ` : ""}${moduleLabel}`}
        className="fd-pill"
      />

      <Text variant="title" as="h1" className="fd-placeholder-title">
        {isToday ? `Welcome back, ${firstName} 👋` : moduleLabel}
      </Text>
      <Text variant="body" tone="muted" className="fd-placeholder-sub">
        {isToday
          ? "The Floor & Decor agentic assortment workspace is ready. Pick a module from the sidebar — each screen is being rebuilt on Impact UI."
          : `The "${moduleLabel}" view is scaffolded and will be implemented in an upcoming milestone.`}
      </Text>

      <Grid columns={4} gap={4} className="fd-card-grid">
        <Card className="fd-card">
          <Text variant="kpi" className="fd-card-k">21</Text>
          <Text variant="caption" tone="muted" className="fd-card-l">Stores in network</Text>
        </Card>
        <Card className="fd-card">
          <Text variant="kpi" className="fd-card-k">35</Text>
          <Text variant="caption" tone="muted" className="fd-card-l">Catalogue SKUs</Text>
        </Card>
        <Card className="fd-card">
          <Text variant="kpi" className="fd-card-k">842</Text>
          <Text variant="caption" tone="muted" className="fd-card-l">National Core</Text>
        </Card>
        <Card className="fd-card">
          <Text variant="kpi" tone="accent" className="fd-card-k accent">84%</Text>
          <Text variant="caption" tone="muted" className="fd-card-l">Agent confidence</Text>
        </Card>
      </Grid>
    </Stack>
  );
}
