import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { PlusCircle, Github, Globe, ExternalLink, CheckCircle2, Clock, AlertCircle, Sparkles, Layers, Star, Video } from "lucide-react";
import axios from "axios";

export default function MiniProjectTracker() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Weekly Log Modal Form State
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [workSummary, setWorkSummary] = useState("");
  const [challenges, setChallenges] = useState("");
  const [hoursSpent, setHoursSpent] = useState(10);
  const [prototypeLink, setPrototypeLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Deliverables Edit State
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [savingLinks, setSavingLinks] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [user]);

  const fetchProjectData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const resProj = await axios.get(`/api/mini-projects?studentId=${user.id}`);
      const projectList = resProj.data || [];
      if (projectList.length > 0) {
        const activeProj = projectList[0];
        setProject(activeProj);
        setGithubUrl(activeProj.githubUrl || "");
        setDemoUrl(activeProj.demoUrl || "");

        const resLogs = await axios.get(`/api/mini-projects/${activeProj.id}/weekly-logs`);
        setLogs(resLogs.data || []);
      }
    } catch (err) {
      console.error("Failed to load student mini project tracker", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyLogSubmit = async (e) => {
    e.preventDefault();
    if (!project || !workSummary) return;

    setSubmitting(true);
    try {
      await axios.post(`/api/mini-projects/${project.id}/weekly-logs`, {
        weekNumber: selectedWeek,
        workSummary,
        challenges,
        hoursSpent,
        prototypeLink,
      });

      setShowLogModal(false);
      setWorkSummary("");
      setChallenges("");
      setPrototypeLink("");
      fetchProjectData();
    } catch (err) {
      console.error("Failed to submit weekly log", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDeliverables = async () => {
    if (!project) return;
    setSavingLinks(true);
    try {
      await axios.put(`/api/mini-projects/${project.id}/deliverables`, {
        githubUrl,
        demoUrl,
      });
      fetchProjectData();
    } catch (err) {
      console.error("Failed to save deliverable URLs", err);
    } finally {
      setSavingLinks(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab="mini-project" />

        <main style={{ flex: 1, padding: "28px 36px", width: "100%", boxSizing: "border-box" }}>
          {loading ? (
            <p style={{ color: "#71717A" }}>Loading semester mini-project details...</p>
          ) : !project ? (
            <div style={{ backgroundColor: "#18181B", padding: "40px", borderRadius: "14px", textAlign: "center", border: "1px solid #27272A" }}>
              <Layers size={48} color="#71717A" style={{ marginBottom: "16px" }} />
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#FAFAFA" }}>No Mini-Project Allocated Yet</h2>
              <p style={{ color: "#71717A", fontSize: "14px", maxWidth: "480px", margin: "8px auto 0 auto" }}>
                The Academic Office will allocate your semester capstone title and assign a Faculty Mentor shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Project Header Card */}
              <div style={{ backgroundColor: "#18181B", padding: "28px", borderRadius: "14px", border: "1px solid #27272A", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6", border: "1px solid rgba(139, 92, 246, 0.3)", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "9999px", textTransform: "uppercase" }}>
                      {project.domain}
                    </span>
                    <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#FAFAFA", margin: "10px 0 6px 0" }}>
                      {project.title}
                    </h1>
                    <p style={{ fontSize: "13px", color: "#71717A", margin: 0 }}>
                      Faculty Mentor: <strong style={{ color: "#FAFAFA" }}>{project.faculty?.fullName}</strong> | Tech Stack: <span style={{ color: "#10B981", fontWeight: 600 }}>{project.techStack}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setShowLogModal(true)}
                    style={{
                      backgroundColor: "#3B82F6",
                      color: "#FFFFFF",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <PlusCircle size={16} /> Submit Weekly Log
                  </button>
                </div>

                {/* Overall Progress Bar */}
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                    <span style={{ color: "#A1A1AA" }}>Semester Completion Progress</span>
                    <span style={{ color: "#3B82F6" }}>{project.overallProgress}%</span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "#27272A", borderRadius: "9999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${project.overallProgress}%`,
                        backgroundColor: "#3B82F6",
                        borderRadius: "9999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Deliverable Repository Links Card */}
              <div style={{ backgroundColor: "#18181B", padding: "24px", borderRadius: "14px", border: "1px solid #27272A", marginBottom: "28px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Github size={18} color="#3B82F6" /> Project Deliverable URLs (Unlocked Week 3+)
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      GitHub Repository URL
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="url"
                        placeholder="https://github.com/username/project"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px", outline: "none" }}
                      />
                      {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "9px 12px", backgroundColor: "#27272A", borderRadius: "8px", color: "#FAFAFA", display: "flex", alignItems: "center" }}>
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Live Prototype / Demo URL
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="url"
                        placeholder="https://my-prototype.demo.app"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px", outline: "none" }}
                      />
                      {demoUrl && (
                        <a href={demoUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "9px 12px", backgroundColor: "#27272A", borderRadius: "8px", color: "#FAFAFA", display: "flex", alignItems: "center" }}>
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveDeliverables}
                  disabled={savingLinks}
                  style={{
                    marginTop: "16px",
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {savingLinks ? "Saving..." : "Save Links"}
                </button>
              </div>

              {/* Weekly Logs Timeline */}
              <div style={{ backgroundColor: "#18181B", padding: "24px", borderRadius: "14px", border: "1px solid #27272A" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "20px" }}>
                  Weekly Progress Log History (Weeks 1 to 16)
                </h2>

                {logs.length === 0 ? (
                  <p style={{ color: "#71717A", fontSize: "13px" }}>No weekly logs submitted yet. Click 'Submit Weekly Log' to add your first progress report.</p>
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>
                              Week #{log.weekNumber} Report
                            </span>
                            <span
                              style={{
                                backgroundColor: log.status === "APPROVED" ? "rgba(16, 185, 129, 0.15)" : log.status === "REVISION_REQUESTED" ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
                                color: log.status === "APPROVED" ? "#10B981" : log.status === "REVISION_REQUESTED" ? "#EF4444" : "#3B82F6",
                                border: `1px solid ${log.status === "APPROVED" ? "rgba(16, 185, 129, 0.3)" : log.status === "REVISION_REQUESTED" ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "9999px",
                              }}
                            >
                              {log.status}
                            </span>
                          </div>

                          {log.facultyRating && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#F59E0B" }}>
                              {[...Array(log.facultyRating)].map((_, i) => (
                                <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                              ))}
                            </div>
                          )}
                        </div>

                        <p style={{ fontSize: "13px", color: "#A1A1AA", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                          {log.workSummary}
                        </p>

                        {log.challenges && (
                          <div style={{ fontSize: "12px", color: "#EF4444", marginBottom: "8px" }}>
                            <strong>Challenges Faced:</strong> {log.challenges}
                          </div>
                        )}

                        {log.prototypeLink && (
                          <div style={{ fontSize: "12px", color: "#3B82F6", marginBottom: "8px" }}>
                            <strong>Prototype Deliverable:</strong>{" "}
                            <a href={log.prototypeLink} target="_blank" rel="noopener noreferrer" style={{ color: "#3B82F6", textDecoration: "underline" }}>
                              {log.prototypeLink}
                            </a>
                          </div>
                        )}

                        {/* AI Insight Badge */}
                        {log.aiSummary && (
                          <div
                            style={{
                              marginTop: "12px",
                              backgroundColor: "rgba(139, 92, 246, 0.1)",
                              border: "1px solid rgba(139, 92, 246, 0.25)",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              color: "#8B5CF6",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Sparkles size={16} color="#8B5CF6" />
                            <span>{log.aiSummary}</span>
                          </div>
                        )}

                        {/* Faculty Feedback */}
                        {log.facultyFeedback && (
                          <div style={{ marginTop: "10px", fontSize: "12px", backgroundColor: "#18181B", border: "1px solid #27272A", padding: "10px 14px", borderRadius: "8px", color: "#A1A1AA" }}>
                            <strong style={{ color: "#FAFAFA" }}>Mentor Feedback ({project.faculty?.fullName}):</strong> {log.facultyFeedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Log Modal */}
              {showLogModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#18181B",
                      borderRadius: "14px",
                      border: "1px solid #27272A",
                      width: "100%",
                      maxWidth: "540px",
                      padding: "28px",
                    }}
                  >
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", marginBottom: "6px" }}>
                      Submit Weekly Progress Log
                    </h2>
                    <p style={{ fontSize: "12px", color: "#71717A", marginBottom: "18px" }}>
                      Document your work done, hours spent, and link prototype artifacts.
                    </p>

                    <form onSubmit={handleWeeklyLogSubmit}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                            Select Week Number
                          </label>
                          <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(Number(e.target.value))}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px" }}
                          >
                            {[...Array(16)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Week #{i + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                            Hours Spent
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={hoursSpent}
                            onChange={(e) => setHoursSpent(Number(e.target.value))}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px", boxSizing: "border-box" }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                          Work Completed Summary *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={workSummary}
                          onChange={(e) => setWorkSummary(e.target.value)}
                          placeholder="Describe technical progress, modules built, APIs created, test cases written..."
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px", boxSizing: "border-box" }}
                        />
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                          Challenges / Blockers Faced
                        </label>
                        <input
                          type="text"
                          value={challenges}
                          onChange={(e) => setChallenges(e.target.value)}
                          placeholder="e.g. CORS error on API endpoint, high memory usage"
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px", boxSizing: "border-box" }}
                        />
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                          Prototype / Deliverable Link {selectedWeek >= 3 ? "(Recommended for Week 3+)" : "(Optional)"}
                        </label>
                        <input
                          type="url"
                          value={prototypeLink}
                          onChange={(e) => setPrototypeLink(e.target.value)}
                          placeholder="https://github.com/org/repo or Live Demo URL"
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "13px", boxSizing: "border-box" }}
                        />
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => setShowLogModal(false)}
                          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #3F3F46", backgroundColor: "transparent", color: "#FAFAFA", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#3B82F6", color: "#FFFFFF", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                        >
                          {submitting ? "Submitting..." : "Submit Log & Run AI Check"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
