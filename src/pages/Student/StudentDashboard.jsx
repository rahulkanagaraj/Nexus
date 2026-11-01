import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MilestoneTimeline from "../../components/MilestoneTimeline";
import NewProjectModal from "./NewProjectModal";
import AiInsightsCard from "../../components/AiInsightsCard";
import PatentClaimsModal from "../../components/PatentClaimsModal";
import {
  Plus, FileText, Download, Clock, CheckCircle2,
  AlertCircle, ShieldCheck, MessageSquare, Sparkles, Award, ChevronDown, ChevronUp,
} from "lucide-react";
import axios from "axios";

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_MAP = {
  SUBMITTED:          { label: "Submitted",         color: "#3B82F6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
  UNDER_REVIEW:       { label: "In Evaluation",     color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  REVISION_REQUESTED: { label: "Revision Requested",color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"  },
  APPROVED:           { label: "Approved",           color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
  READY_FOR_IP:       { label: "Patent Eligible",   color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)" },
  IP_FILED:           { label: "Patent Filed",      color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)" },
  REJECTED:           { label: "Rejected",           color: "#EF4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)"  },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[(status || "").toUpperCase()] || STATUS_MAP.SUBMITTED;
  return (
    <span
      style={{
        color: s.color,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        padding: "3px 10px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {s.label}
    </span>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, valueColor, icon: Icon, iconColor }) {
  return (
    <div
      style={{
        backgroundColor: "#18181B",
        border: "1px solid #27272A",
        borderRadius: "12px",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              backgroundColor: `${iconColor}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={14} color={iconColor} />
          </div>
        )}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: valueColor || "#FAFAFA", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ── Contributor accordion (text-only, no avatar images) ──────────────────────
function ContributorAccordion({ name, role }) {
  const [open, setOpen] = useState(false);
  const initials = name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div
      style={{
        border: "1px solid #27272A",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "6px",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Text-only initial chip */}
          <span
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#27272A",
              color: "#A1A1AA",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#FAFAFA" }}>{name}</div>
            <div style={{ fontSize: "11px", color: "#71717A" }}>{role}</div>
          </div>
        </div>
        {open ? <ChevronUp size={14} color="#52525B" /> : <ChevronDown size={14} color="#52525B" />}
      </button>

      {open && (
        <div
          style={{
            padding: "8px 12px 10px 50px",
            borderTop: "1px solid #27272A",
            backgroundColor: "#09090B",
          }}
        >
          <div style={{ fontSize: "12px", color: "#71717A", marginBottom: "4px" }}>
            📧 <span style={{ color: "#A1A1AA" }}>{name.toLowerCase().replace(/\s+/g, ".")}@campus.edu</span>
          </div>
          <div style={{ fontSize: "12px", color: "#71717A" }}>
            📞 <span style={{ color: "#A1A1AA" }}>+91 00000 00000</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [selectedProject, setSelectedProject]   = useState(null);
  const [reviews, setReviews]                   = useState([]);
  const [patentStudioProject, setPatentStudioProject] = useState(null);

  // ── API calls (untouched) ─────────────────────────────────────────────────
  const fetchStudentProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/projects?role=STUDENT&userId=${user.id}`);
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data[0]);
      }
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectReviews = async (projectId) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/reviews`);
      setReviews(res.data);
    } catch (e) {
      console.error("Error fetching reviews:", e);
    }
  };

  useEffect(() => { if (user) fetchStudentProjects(); }, [user]);
  useEffect(() => { if (selectedProject?.id) fetchProjectReviews(selectedProject.id); }, [selectedProject]);

  // ── Derived counts ────────────────────────────────────────────────────────
  const underReviewCount = projects.filter((p) =>
    ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"].includes(p.status)
  ).length;
  const approvedCount = projects.filter((p) =>
    ["APPROVED", "READY_FOR_IP", "IP_FILED"].includes(p.status)
  ).length;
  const ipEligibleCount = projects.filter((p) =>
    ["READY_FOR_IP", "IP_FILED"].includes(p.status)
  ).length;

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#09090B",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Poppins', sans-serif",
        color: "#FAFAFA",
      }}
    >
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "28px 32px", minWidth: 0, overflowY: "auto" }}>

          {/* ── Page header ──────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#FAFAFA", letterSpacing: "-0.5px" }}>
                Research Workspace
              </h1>
            </div>

            {/* Submit Proposal — opens NewProjectModal */}
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              Submit Research Proposal
            </button>
          </div>

          {/* ── Metric cards ─────────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <MetricCard label="Total Proposals"    value={projects.length}  valueColor="#FAFAFA"  icon={FileText}      iconColor="#3B82F6" />
            <MetricCard label="Under Review"        value={underReviewCount} valueColor="#F59E0B"  icon={Clock}         iconColor="#F59E0B" />
            <MetricCard label="Approved"            value={approvedCount}    valueColor="#10B981"  icon={CheckCircle2}  iconColor="#10B981" />
            <MetricCard label="IP Eligible / Filed" value={ipEligibleCount}  valueColor="#8B5CF6"  icon={ShieldCheck}   iconColor="#8B5CF6" />
          </div>

          {/* ── Projects table + Detail panel ────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "20px" }}>

            {/* Left: project list */}
            <div
              style={{
                backgroundColor: "#18181B",
                borderRadius: "12px",
                border: "1px solid #27272A",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#FAFAFA" }}>
                  Recent Research Projects &amp; Tasks
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#71717A",
                    backgroundColor: "#27272A",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  {projects.length} total
                </span>
              </div>

              {/* Column headers */}
              {projects.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: "8px",
                    padding: "6px 10px",
                    marginBottom: "6px",
                    borderBottom: "1px solid #27272A",
                  }}
                >
                  {["Project Name", "Domain", "Status", ""].map((h) => (
                    <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#52525B", textTransform: "uppercase" }}>
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {loading ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#52525B", fontSize: "13px" }}>
                  Loading research proposals...
                </div>
              ) : projects.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#52525B", fontSize: "13px" }}>
                  No research projects submitted yet.{" "}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: "none", border: "none", color: "#3B82F6", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
                  >
                    Submit your first proposal →
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {projects.map((proj) => {
                    const isSelected = selectedProject?.id === proj.id;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        style={{
                          padding: "12px 10px",
                          borderRadius: "8px",
                          border: isSelected ? "1px solid #3B82F6" : "1px solid transparent",
                          backgroundColor: isSelected ? "rgba(59,130,246,0.06)" : "transparent",
                          cursor: "pointer",
                          display: "grid",
                          gridTemplateColumns: "1fr auto auto",
                          gap: "10px",
                          alignItems: "center",
                          transition: "all 0.12s ease",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#27272A"; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#FAFAFA", marginBottom: "2px" }}>
                            {proj.title}
                          </div>
                          <div style={{ fontSize: "11px", color: "#71717A" }}>
                            {proj.domain || "—"} · Mentor: {proj.facultyName || "TBA"}
                          </div>
                        </div>
                        <StatusBadge status={proj.status} />
                        {/* Progress indicator stub */}
                        <div style={{ width: "60px" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "#52525B", marginBottom: "4px" }}>
                            {proj.status === "IP_FILED" ? "100%" : proj.status === "READY_FOR_IP" ? "80%" : proj.status === "APPROVED" ? "60%" : proj.status === "UNDER_REVIEW" ? "40%" : "20%"}
                          </div>
                          <div style={{ height: "3px", backgroundColor: "#3F3F46", borderRadius: "9999px" }}>
                            <div
                              style={{
                                height: "3px",
                                borderRadius: "9999px",
                                backgroundColor: "#3B82F6",
                                width: proj.status === "IP_FILED" ? "100%" : proj.status === "READY_FOR_IP" ? "80%" : proj.status === "APPROVED" ? "60%" : proj.status === "UNDER_REVIEW" ? "40%" : "20%",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: selected project detail panel */}
            <div
              style={{
                backgroundColor: "#18181B",
                borderRadius: "12px",
                border: "1px solid #27272A",
                padding: "24px",
                overflowY: "auto",
                maxHeight: "calc(100vh - 220px)",
              }}
            >
              {selectedProject ? (
                <div>
                  {/* Domain + title */}
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#8B5CF6",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {selectedProject.domain || "Research Domain"}
                  </span>
                  <h3
                    style={{
                      margin: "4px 0 6px",
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#FAFAFA",
                    }}
                  >
                    {selectedProject.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <StatusBadge status={selectedProject.status} />
                    <span style={{ fontSize: "12px", color: "#71717A" }}>
                      Milestone:{" "}
                      <span style={{ color: "#A1A1AA", fontWeight: 600 }}>
                        {selectedProject.currentMilestone || "Proposal Evaluation"}
                      </span>
                    </span>
                  </div>

                  {/* Milestone timeline */}
                  <div
                    style={{
                      backgroundColor: "#09090B",
                      border: "1px solid #27272A",
                      borderRadius: "10px",
                      padding: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#52525B", textTransform: "uppercase", marginBottom: "12px" }}>
                      PROJECT MILESTONES
                    </div>
                    <MilestoneTimeline status={selectedProject.status} />
                  </div>

                  {/* Abstract */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#FAFAFA" }}>
                      Abstract &amp; Novelty Claims
                    </h4>
                    <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.6, margin: 0 }}>
                      {selectedProject.abstractText || selectedProject.abstract_text || "No abstract available."}
                    </p>
                  </div>

                  {/* AI Insights — triggers POST /api/projects/{id}/ai-insights */}
                  <AiInsightsCard
                    project={selectedProject}
                    onProjectUpdated={(updated) => {
                      setSelectedProject(updated);
                      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                    }}
                    onOpenPatentStudio={(p) => setPatentStudioProject(p)}
                  />

                  {/* Document download */}
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#71717A",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Proposal Documents &amp; Attachments
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#09090B",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #27272A",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} color="#3B82F6" />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#FAFAFA" }}>
                        {selectedProject.fileName || selectedProject.file_name || "Proposal_Abstract.pdf"}
                      </span>
                    </div>
                    <a
                      href={(() => {
                        const url = selectedProject.fileUrl || "/uploads/default_abstract.pdf";
                        return url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL || ""}${url}`;
                      })()}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#3B82F6",
                        fontSize: "12px",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <Download size={13} />
                      Download
                    </a>
                  </div>

                  {/* Mentor feedback / review history — fetched via GET /api/projects/{id}/reviews */}
                  <div style={{ borderTop: "1px solid #27272A", paddingTop: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <MessageSquare size={14} color="#71717A" />
                      <h4 style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Mentor Feedback &amp; Review History
                      </h4>
                    </div>

                    {reviews.length === 0 ? (
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: "#09090B",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#52525B",
                          textAlign: "center",
                          border: "1px solid #27272A",
                        }}
                      >
                        No mentor evaluations yet. Your faculty reviewer will provide feedback shortly.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {reviews.map((rev) => {
                          const isPositive = rev.statusChange === "APPROVED" || rev.statusChange === "READY_FOR_IP";
                          return (
                            <div
                              key={rev.id}
                              style={{
                                padding: "12px",
                                backgroundColor: "#09090B",
                                borderRadius: "8px",
                                border: "1px solid #27272A",
                                borderLeft: `3px solid ${isPositive ? "#10B981" : "#F59E0B"}`,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: "6px",
                                }}
                              >
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#FAFAFA" }}>
                                  {rev.facultyName || rev.faculty_name || "Faculty Mentor"}
                                </span>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: isPositive ? "#10B981" : "#F59E0B",
                                  }}
                                >
                                  {rev.statusChange}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: "12px", color: "#71717A", lineHeight: 1.5 }}>
                                "{rev.feedbackText || rev.feedback_text || "No feedback provided."}"
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Contributor accordion (text-only, no avatar images) */}
                  {selectedProject.studentName && (
                    <div style={{ marginTop: "20px", borderTop: "1px solid #27272A", paddingTop: "16px" }}>
                      <h4
                        style={{
                          margin: "0 0 10px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#71717A",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Contributors
                      </h4>
                      <ContributorAccordion name={selectedProject.studentName} role="Student Researcher" />
                      {selectedProject.facultyName && (
                        <ContributorAccordion name={selectedProject.facultyName} role="Faculty Mentor" />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "#52525B" }}>
                  <FileText size={32} color="#3F3F46" style={{ marginBottom: "12px" }} />
                  <div style={{ fontSize: "14px" }}>
                    Select a research initiative from the list to view its milestone timeline, documents, and mentor feedback.
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals (unchanged wiring) ──────────────────────────────────────── */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchStudentProjects}
        studentId={user.id}
        studentDepartment={user.department}
      />

      {patentStudioProject && (
        <PatentClaimsModal
          project={patentStudioProject}
          onClose={() => setPatentStudioProject(null)}
        />
      )}
    </div>
  );
}
