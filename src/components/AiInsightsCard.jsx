import React, { useState } from "react";
import { Sparkles, RefreshCw, Award, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

export default function AiInsightsCard({ project, onProjectUpdated, onOpenPatentStudio }) {
  const [loading, setLoading]     = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [msg, setMsg]             = useState(null);

  if (!project) return null;

  // ── API CALL (unchanged) ──────────────────────────────────────────────────
  const handleRefreshInsights = async () => {
    try {
      setLoading(true);
      setMsg(null);
      const res = await axios.post(`/api/projects/${project.id}/ai-insights`);
      if (res.data && res.data.project) {
        if (onProjectUpdated) onProjectUpdated(res.data.project);
        setMsg("✓ High-depth AI evaluation updated!");
        setTimeout(() => setMsg(null), 3500);
      }
    } catch (err) {
      console.error("Failed to re-analyze project:", err);
      setMsg("Failed to re-analyze: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ── Markdown parser (unchanged) ───────────────────────────────────────────
  const rawSummary = project.summary || "";
  const parseMarkdownSections = (text) => {
    if (!text) return [];
    const parts = text.split(/###\s+/);
    const sections = [];
    parts.forEach((p) => {
      const trimmed = p.trim();
      if (!trimmed) return;
      const firstLineBreak = trimmed.indexOf("\n");
      if (firstLineBreak > -1) {
        sections.push({ title: trimmed.substring(0, firstLineBreak).trim(), body: trimmed.substring(firstLineBreak).trim() });
      } else {
        sections.push({ title: "Analysis", body: trimmed });
      }
    });
    return sections;
  };
  const sections = parseMarkdownSections(rawSummary);

  return (
    <div
      style={{
        border: "1px solid #27272A",
        backgroundColor: "#18181B",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between flex-wrap gap-3"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div
          className="flex items-center gap-2.5"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color="#3B82F6" />
          </div>
          <div>
            <div
              className="flex items-center gap-2 flex-wrap"
              style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
            >
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.2 }}>
                AI Research &amp; Patentability Insights
              </h4>
              <span
                className="inline-flex items-center"
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#3B82F6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  lineHeight: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Deep Analytical Engine
              </span>
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#71717A", lineHeight: 1.2 }}>
              Novelty, methodology &amp; IP viability evaluation
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 flex-wrap"
          style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
        >
          {/* Re-Analyze button — triggers POST /api/projects/{id}/ai-insights */}
          <button
            onClick={handleRefreshInsights}
            disabled={loading}
            className="flex items-center gap-1.5"
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #27272A",
              backgroundColor: "#09090B",
              color: loading ? "#52525B" : "#A1A1AA",
              fontSize: "12px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={12} className={loading ? "spin" : ""} />
            <span>{loading ? "Analyzing..." : "Re-Analyze"}</span>
          </button>

          {/* Patent Studio button */}
          {onOpenPatentStudio && (
            <button
              onClick={() => onOpenPatentStudio(project)}
              className="flex items-center gap-1.5"
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#8B5CF6",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Award size={12} />
              <span>Patent Studio</span>
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#71717A",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* ── Status message ─────────────────────────────────────────────────── */}
      {msg && (
        <div
          style={{
            fontSize: "12px",
            color: msg.startsWith("✓") ? "#4ADE80" : "#F87171",
            backgroundColor: msg.startsWith("✓") ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${msg.startsWith("✓") ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
            padding: "6px 12px",
            borderRadius: "6px",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          {msg}
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {!collapsed && (
        <div style={{ marginTop: "8px" }}>
          {!rawSummary ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#52525B", fontSize: "13px" }}>
              No AI evaluation generated yet. Click "Re-Analyze" to evaluate this research proposal.
            </div>
          ) : sections.length > 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sections.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#09090B",
                    border: "1px solid #27272A",
                    borderRadius: "8px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FAFAFA", marginBottom: "6px" }}>
                    {sec.title}
                  </div>
                  <div style={{ fontSize: "13px", lineHeight: 1.6, color: "#A1A1AA", whiteSpace: "pre-line" }}>
                    {sec.body}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#09090B",
                border: "1px solid #27272A",
                borderRadius: "8px",
                padding: "14px",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#A1A1AA",
              }}
            >
              {rawSummary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
