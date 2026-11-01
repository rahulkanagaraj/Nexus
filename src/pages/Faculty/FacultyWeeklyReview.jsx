import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { ExternalLink, Sparkles } from "lucide-react";
import axios from "axios";

const getStatusBadgeStyle = (status) => {
  const normalized = (status || "").toString().toUpperCase().replace(/_/g, " ");

  switch (normalized) {
    case "APPROVED":
      return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)", label: "Approved" };
    case "UNDER REVIEW":
    case "IN EVALUATION":
    case "PENDING":
      return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.3)", label: "In Evaluation" };
    case "PATENT ELIGIBLE":
    case "READY FOR IP":
      return { bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6", border: "rgba(139, 92, 246, 0.3)", label: "Patent Eligible" };
    case "IP FILED":
    case "FILED":
      return { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6", border: "rgba(59, 130, 246, 0.3)", label: "Filed" };
    case "GRANTED":
      return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)", label: "Granted" };
    case "UNDER EXAMINATION":
      return { bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6", border: "rgba(139, 92, 246, 0.3)", label: "Under Examination" };
    case "REVISION REQUESTED":
      return { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)", label: "Revision Requested" };
    case "PROTOTYPE SUBMITTED":
    case "SUBMITTED":
      return { bg: "rgba(6, 182, 212, 0.15)", text: "#06B6D4", border: "rgba(6, 182, 212, 0.3)", label: "Submitted" };
    case "CONFIRMED":
      return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)", label: "Confirmed" };
    case "PENDING MENTOR":
      return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.3)", label: "Pending Mentor" };
    default:
      return { bg: "rgba(113, 113, 122, 0.15)", text: "#A1A1AA", border: "rgba(113, 113, 122, 0.3)", label: normalized || "Active" };
  }
};

const StatusPill = ({ status }) => {
  const { bg, text, border, label } = getStatusBadgeStyle(status);
  return (
    <span
      style={{
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "9999px",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

export default function FacultyWeeklyReview() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [selectedLog, setSelectedLog] = useState(null);
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState("APPROVED");
  const [feedback, setFeedback] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchFacultyProjects();
  }, [user]);

  const fetchFacultyProjects = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/mini-projects?facultyId=${user.id}`);
      const projectList = res.data || [];
      setProjects(projectList);
      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0].id);
        fetchProjectLogs(projectList[0].id);
      }
    } catch (err) {
      console.error("Failed to load faculty projects", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectLogs = async (projId) => {
    try {
      const resLogs = await axios.get(`/api/mini-projects/${projId}/weekly-logs`);
      setLogs(resLogs.data || []);
    } catch (err) {
      console.error("Failed to load weekly logs", err);
    }
  };

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    setSelectedLog(null);
    fetchProjectLogs(id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLog) return;

    setReviewing(true);
    try {
      await axios.post(`/api/mini-projects/weekly-logs/${selectedLog.id}/review`, {
        status,
        rating,
        feedback,
      });

      setSelectedLog(null);
      setFeedback("");
      fetchFacultyProjects();
      if (selectedProjectId) fetchProjectLogs(selectedProjectId);
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setReviewing(false);
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab="faculty-logs" />

        <main style={{ flex: 1, padding: "28px 36px", width: "100%", boxSizing: "border-box" }}>
          {/* Header Title */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#FAFAFA", margin: 0 }}>
              Faculty Weekly Review
            </h1>
          </div>

          {loading ? (
            <p style={{ color: "#71717A" }}>Loading assigned student projects...</p>
          ) : projects.length === 0 ? (
            <div style={{ backgroundColor: "#18181B", padding: "36px", borderRadius: "14px", border: "1px solid #27272A" }}>
              <p style={{ color: "#71717A", margin: 0 }}>No student projects assigned under your mentorship yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
              {/* Left Column: Assigned Student Cards */}
              <div style={{ backgroundColor: "#18181B", padding: "20px", borderRadius: "14px", border: "1px solid #27272A" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Assigned Students</span>
                  <span style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6", border: "1px solid rgba(139, 92, 246, 0.3)", padding: "2px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>
                    {projects.length}
                  </span>
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {projects.map((p) => {
                    const isSelected = selectedProjectId === p.id;
                    const studentName = p.student?.fullName || "Student";
                    const dept = p.department || p.student?.department || "CSE";
                    const progress = p.overallProgress || 0;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProject(p.id)}
                        style={{
                          padding: "14px",
                          borderRadius: "10px",
                          border: isSelected ? "1px solid #3B82F6" : "1px solid #27272A",
                          backgroundColor: isSelected ? "rgba(59, 130, 246, 0.08)" : "#09090B",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Student Name & Department */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>
                            {studentName}
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", backgroundColor: "#27272A", padding: "2px 8px", borderRadius: "6px" }}>
                            {dept}
                          </span>
                        </div>

                        {/* Project Title */}
                        <div style={{ fontSize: "12px", color: "#A1A1AA", marginBottom: "10px", lineHeight: 1.4, fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {p.title}
                        </div>

                        {/* Horizontal Progress Bar */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#3B82F6", marginBottom: "4px" }}>
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div style={{ width: "100%", height: "4px", backgroundColor: "#27272A", borderRadius: "9999px", overflow: "hidden" }}>
                            <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#3B82F6", borderRadius: "9999px", transition: "width 0.3s ease" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Student Details & Weekly Logs */}
              <div>
                {activeProject && (
                  <div style={{ backgroundColor: "#18181B", padding: "20px 24px", borderRadius: "14px", border: "1px solid #27272A", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                          {activeProject.title}
                        </h2>
                        <div style={{ fontSize: "13px", color: "#71717A", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <span>Lead: <strong style={{ color: "#FAFAFA" }}>{activeProject.student?.fullName}</strong> ({activeProject.department || "CSE"})</span>
                          <span>|</span>
                          <span>Tech Stack: <span style={{ color: "#10B981", fontWeight: 600 }}>{activeProject.techStack}</span></span>
                        </div>
                      </div>
                      <StatusPill status={activeProject.status} />
                    </div>

                    {/* Overall Progress Horizontal Bar in Header */}
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #27272A" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#A1A1AA", marginBottom: "6px" }}>
                        <span>Overall Project Progress</span>
                        <span style={{ color: "#3B82F6" }}>{activeProject.overallProgress || 0}% Completed</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", backgroundColor: "#27272A", borderRadius: "9999px", overflow: "hidden" }}>
                        <div style={{ width: `${activeProject.overallProgress || 0}%`, height: "100%", backgroundColor: "#3B82F6", borderRadius: "9999px" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly Logs List */}
                <div style={{ backgroundColor: "#18181B", padding: "24px", borderRadius: "14px", border: "1px solid #27272A" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px" }}>
                    Weekly Log Submissions
                  </h3>

                  {logs.length === 0 ? (
                    <p style={{ color: "#71717A", fontSize: "13px" }}>No logs submitted by student yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          style={{
                            border: "1px solid #27272A",
                            borderRadius: "10px",
                            padding: "16px",
                            backgroundColor: "#09090B",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>
                              Week #{log.weekNumber} Log ({log.hoursSpent} hrs)
                            </span>
                            <StatusPill status={log.status} />
                          </div>

                          <p style={{ fontSize: "13px", color: "#A1A1AA", margin: "0 0 10px 0", lineHeight: 1.5 }}>{log.workSummary}</p>

                          {log.prototypeLink && (
                            <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                              <strong style={{ color: "#FAFAFA" }}>Submitted Prototype Link:</strong>{" "}
                              <a href={log.prototypeLink} target="_blank" rel="noopener noreferrer" style={{ color: "#3B82F6", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                {log.prototypeLink} <ExternalLink size={14} />
                              </a>
                            </div>
                          )}

                          {log.aiSummary && (
                            <div style={{ fontSize: "12px", backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.25)", padding: "8px 12px", borderRadius: "6px", color: "#8B5CF6", marginBottom: "10px" }}>
                              <Sparkles size={14} style={{ display: "inline", marginRight: "6px" }} />
                              {log.aiSummary}
                            </div>
                          )}

                          {log.status !== "APPROVED" && (
                            <button
                              onClick={() => setSelectedLog(log)}
                              style={{
                                backgroundColor: "#10B981",
                                color: "#FFFFFF",
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Evaluate &amp; Grade Week #{log.weekNumber}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Modal */}
                {selectedLog && (
                  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", width: "100%", maxWidth: "480px", padding: "24px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", marginBottom: "6px" }}>
                        Grade Week #{selectedLog.weekNumber} Submission
                      </h3>
                      <p style={{ fontSize: "12px", color: "#71717A", marginBottom: "16px" }}>
                        Assign rating, provide guidance, and approve progress.
                      </p>

                      <form onSubmit={handleReviewSubmit}>
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                            Rating (1 to 5 Stars)
                          </label>
                          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px" }}>
                            <option value={5}>5 Stars - Outstanding Progress</option>
                            <option value={4}>4 Stars - Good Progress</option>
                            <option value={3}>3 Stars - Satisfactory</option>
                            <option value={2}>2 Stars - Needs Improvement</option>
                            <option value={1}>1 Star - Insufficient Work</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                            Status Decision
                          </label>
                          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px" }}>
                            <option value="APPROVED">APPROVED (Advance Progress)</option>
                            <option value="REVISION_REQUESTED">REVISION REQUESTED</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                            Faculty Feedback &amp; Comments
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Great job on the API integration. For next week, focus on writing unit tests..."
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px", boxSizing: "border-box" }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                          <button type="button" onClick={() => setSelectedLog(null)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #3F3F46", backgroundColor: "transparent", color: "#FAFAFA", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                            Cancel
                          </button>
                          <button type="submit" disabled={reviewing} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#10B981", color: "#FFFFFF", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                            {reviewing ? "Saving..." : "Submit Faculty Grade"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
