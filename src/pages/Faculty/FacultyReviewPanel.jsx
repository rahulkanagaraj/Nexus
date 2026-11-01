import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MilestoneTimeline from "../../components/MilestoneTimeline";
import AiInsightsCard from "../../components/AiInsightsCard";
import PatentClaimsModal from "../../components/PatentClaimsModal";
import { Search, Filter, Download, CheckCircle, AlertTriangle, ShieldCheck, XCircle, Sparkles, Award } from "lucide-react";
import axios from "axios";
import { formatDate } from "../../utils/formatDate";

const getShortDept = (dept) => {
  if (!dept) return "";
  const map = {
    "Computer Science & Engineering": "CSE",
    "Computer Science and Engineering": "CSE",
    "Artificial Intelligence & Data Science": "AI&DS",
    "AI & Data Science": "AI&DS",
    "Artificial Intelligence & Machine Learning": "AI&ML",
    "AI & Machine Learning": "AI&ML",
    "Electronics & Communication Engineering": "ECE",
    "Electronics and Communication Engineering": "ECE",
    "Electrical & Electronics Engineering": "EEE",
    "Electrical & Electronics": "EEE",
    "Information Technology": "IT",
    "Mechanical Engineering": "ME",
  };
  return map[dept] || dept;
};

const getStatusBadge = (status) => {
  const s = (status || "").toUpperCase();
  const map = {
    SUBMITTED:          { bg: "rgba(6, 182, 212, 0.15)",  text: "#06B6D4", border: "rgba(6, 182, 212, 0.3)",  label: "Submitted" },
    UNDER_REVIEW:       { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.3)", label: "In Evaluation" },
    REVISION_REQUESTED: { bg: "rgba(239, 68, 68, 0.15)",  text: "#EF4444", border: "rgba(239, 68, 68, 0.3)",  label: "Revision Requested" },
    APPROVED:           { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)", label: "Approved" },
    READY_FOR_IP:       { bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6", border: "rgba(139, 92, 246, 0.3)", label: "Patent Eligible" },
    IP_FILED:           { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6", border: "rgba(59, 130, 246, 0.3)", label: "Filed" },
    REJECTED:           { bg: "rgba(239, 68, 68, 0.15)",  text: "#EF4444", border: "rgba(239, 68, 68, 0.3)",  label: "Rejected" },
  };
  const b = map[s] || map.SUBMITTED;
  return (
    <span
      style={{
        backgroundColor: b.bg,
        color: b.text,
        border: `1px solid ${b.border}`,
        padding: "3px 10px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 700,
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {b.label}
    </span>
  );
};

export default function FacultyReviewPanel() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsLog, setReviewsLog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [patentStudioProject, setPatentStudioProject] = useState(null);

  const fetchFacultyProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/projects?role=FACULTY&userId=${user.id}`);
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data[0]);
      }
    } catch (e) {
      console.error("Error loading faculty evaluation list:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectReviews = async (projectId) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/reviews`);
      setReviewsLog(res.data);
    } catch (e) {
      console.error("Error fetching reviews log:", e);
    }
  };

  useEffect(() => {
    if (user) fetchFacultyProjects();
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectReviews(selectedProject.id);
    }
  }, [selectedProject]);

  const handleReviewAction = async (statusChange) => {
    if (!feedbackText && statusChange === "REVISION_REQUESTED") {
      alert("Please provide feedback notes detailing required revisions.");
      return;
    }

    try {
      setSubmittingReview(true);
      await axios.post("/api/reviews", {
        projectId: selectedProject.id,
        facultyId: user.id,
        statusChange,
        feedbackText: feedbackText || `Project status updated to ${statusChange}`,
      });

      setFeedbackText("");
      await fetchFacultyProjects();
      if (selectedProject) {
        setSelectedProject({ ...selectedProject, status: statusChange });
        fetchProjectReviews(selectedProject.id);
      }
    } catch (e) {
      alert("Failed to record review decision.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.studentName && p.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Clear / exclude IP_FILED projects from pending review queue when ALL is selected
    const isNotFiled = statusFilter === "ALL" ? p.status !== "IP_FILED" : true;
    const matchesStatus = statusFilter === "ALL" ? isNotFiled : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", display: "flex", flexDirection: "column", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "28px 36px", minWidth: 0 }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#FAFAFA", letterSpacing: "-0.5px" }}>
              Faculty Proposal Review Panel
            </h1>
          </div>

          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, position: "relative", minWidth: "280px" }}>
              <Search size={16} color="#71717A" style={{ position: "absolute", left: "12px", top: "12px" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by proposal title or student name..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "8px",
                  border: "1px solid #27272A",
                  backgroundColor: "#18181B",
                  color: "#FAFAFA",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={16} color="#71717A" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #27272A",
                  backgroundColor: "#18181B",
                  color: "#FAFAFA",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="ALL">All Active Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">In Evaluation</option>
                <option value="REVISION_REQUESTED">Revision Needed</option>
                <option value="APPROVED">Proposal Approved</option>
                <option value="READY_FOR_IP">Patent Eligible</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px" }}>
            {/* Left Column: Proposals List */}
            <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: 700, color: "#FAFAFA" }}>
                Pending Proposals ({filteredProjects.length})
              </h3>
              {loading ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#71717A", fontSize: "13px" }}>Loading proposals...</div>
              ) : filteredProjects.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#71717A", fontSize: "13px" }}>
                  No research proposals matching criteria.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: selectedProject?.id === p.id ? "1px solid #3B82F6" : "1px solid #27272A",
                        backgroundColor: selectedProject?.id === p.id ? "rgba(59, 130, 246, 0.08)" : "#09090B",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#FAFAFA" }}>
                          {p.studentName || p.student_name || "Student Researcher"}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", backgroundColor: "#27272A", padding: "2px 8px", borderRadius: "4px" }}>
                          {getShortDept(p.department)}
                        </span>
                      </div>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 700, color: "#FAFAFA" }}>
                        {p.title}
                      </h4>
                      <div>{getStatusBadge(p.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Selected Proposal Detail & Review Form */}
            <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "24px" }}>
              {selectedProject ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase" }}>
                        {selectedProject.domain}
                      </span>
                      <h3 style={{ margin: "4px 0 4px 0", fontSize: "18px", fontWeight: 800, color: "#FAFAFA" }}>
                        {selectedProject.title}
                      </h3>
                      <span style={{ fontSize: "12px", color: "#71717A" }}>
                        Lead: <strong style={{ color: "#FAFAFA" }}>{selectedProject.studentName || selectedProject.student_name || "Unknown"}</strong> • <span style={{ fontWeight: 700, color: "#8B5CF6", backgroundColor: "rgba(139, 92, 246, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>{getShortDept(selectedProject.department)}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#09090B", border: "1px solid #27272A", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
                    <MilestoneTimeline status={selectedProject.status} />
                  </div>

                  <div style={{ backgroundColor: "#09090B", padding: "16px", borderRadius: "10px", border: "1px solid #27272A", marginBottom: "20px" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: 700, color: "#FAFAFA" }}>
                      Abstract &amp; Novelty Claims
                    </h4>
                    <p style={{ fontSize: "13px", color: "#A1A1AA", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                      {selectedProject.abstractText || selectedProject.abstract_text || "No abstract provided."}
                    </p>

                    {/* AI Insights Card */}
                    <AiInsightsCard
                      project={selectedProject}
                      onProjectUpdated={(updated) => {
                        setSelectedProject(updated);
                        setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                      }}
                      onOpenPatentStudio={(p) => setPatentStudioProject(p)}
                    />

                    <div style={{ marginTop: "12px" }}>
                      <a
                        href={(() => {
                          const url = selectedProject.fileUrl || "/uploads/default_abstract.pdf";
                          return url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL || ""}${url}`;
                        })()}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#3B82F6", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}
                      >
                        <Download size={14} /> View Full PDF Proposal
                      </a>
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#A1A1AA", marginBottom: "8px", textTransform: "uppercase" }}>
                      Input Constructive Evaluation Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Specify revision requirements or recommendations for patent/copyright filing..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #27272A",
                        backgroundColor: "#09090B",
                        color: "#FAFAFA",
                        fontSize: "13px",
                        boxSizing: "border-box",
                        resize: "vertical",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
                    <button
                      onClick={() => handleReviewAction("APPROVED")}
                      disabled={submittingReview}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        backgroundColor: "#10B981",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "12px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <CheckCircle size={15} /> Approve Proposal
                    </button>

                    <button
                      onClick={() => handleReviewAction("READY_FOR_IP")}
                      disabled={submittingReview}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        backgroundColor: "#8B5CF6",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "12px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <ShieldCheck size={15} /> Mark Ready for IP Filing
                    </button>

                    <button
                      onClick={() => handleReviewAction("REVISION_REQUESTED")}
                      disabled={submittingReview}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        backgroundColor: "#F59E0B",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "12px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <AlertTriangle size={15} /> Request Revisions
                    </button>

                    <button
                      onClick={() => handleReviewAction("REJECTED")}
                      disabled={submittingReview}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        backgroundColor: "#EF4444",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "12px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <XCircle size={15} /> Reject Proposal
                    </button>
                  </div>

                  {reviewsLog.length > 0 && (
                    <div style={{ borderTop: "1px solid #27272A", paddingTop: "16px" }}>
                      <h4 style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 700, color: "#A1A1AA", textTransform: "uppercase" }}>
                        Evaluation History &amp; Feedback Logs
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {reviewsLog.map((rev) => (
                          <div key={rev.id} style={{ backgroundColor: "#09090B", border: "1px solid #27272A", padding: "10px 12px", borderRadius: "8px", fontSize: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#71717A", marginBottom: "4px" }}>
                              <strong style={{ color: "#FAFAFA" }}>{rev.facultyName || rev.faculty_name || "Faculty Mentor"}</strong>
                              <span>{formatDate(rev.reviewedAt || rev.reviewed_at)}</span>
                            </div>
                            <div style={{ color: "#A1A1AA" }}>{rev.feedbackText || rev.feedback_text || "No feedback"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: "#71717A", fontSize: "13px" }}>
                  Select a proposal from the left list to review document and enter feedback decision.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {patentStudioProject && (
        <PatentClaimsModal
          project={patentStudioProject}
          onClose={() => setPatentStudioProject(null)}
        />
      )}
    </div>
  );
}
