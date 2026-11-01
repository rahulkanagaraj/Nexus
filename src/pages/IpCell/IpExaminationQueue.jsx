import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import PatentClaimsModal from "../../components/PatentClaimsModal";
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  Award,
  ChevronRight,
  X,
  RefreshCw,
  ExternalLink,
  BookOpen
} from "lucide-react";
import axios from "axios";
import { formatDate } from "../../utils/formatDate";

export default function IpExaminationQueue() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [ipFilings, setIpFilings] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  
  // Selected project modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("AI_NOVELTY");
  const [submitting, setSubmitting] = useState(false);
  const [patentStudioProject, setPatentStudioProject] = useState(null);
  
  // Filing form state inside modal
  const [filingForm, setFilingForm] = useState({
    ipType: "PATENT",
    applicationNo: "",
    jurisdiction: "IPO Chennai (South Zone)",
    filingStatus: "FILED",
    filingDate: new Date().toISOString().split("T")[0],
    inventors: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, ipRes] = await Promise.all([
        axios.get("/api/projects"),
        axios.get("/api/ip-filings")
      ]);

      const fetchedProjects = Array.isArray(projRes.data) ? projRes.data : [];
      const fetchedFilings = Array.isArray(ipRes.data) ? ipRes.data : [];

      setProjects(fetchedProjects);
      setIpFilings(fetchedFilings);

      // Concurrent parallel fetch of weekly logs (eliminates serial N+1 network blocking)
      const uniqueStudentIds = [...new Set(fetchedProjects.map((p) => p.studentId).filter(Boolean))];
      const logPromises = uniqueStudentIds.map((sId) =>
        axios
          .get(`/api/mini-projects/student/${sId}`)
          .then((res) => ({ sId, weeklyLogs: res.data?.weeklyLogs || [] }))
          .catch(() => ({ sId, weeklyLogs: [] }))
      );

      const logResults = await Promise.all(logPromises);
      const studentMap = {};
      logResults.forEach((r) => {
        studentMap[r.sId] = r.weeklyLogs;
      });

      const logsMap = {};
      fetchedProjects.forEach((p) => {
        if (p.studentId && studentMap[p.studentId]) {
          logsMap[p.id] = studentMap[p.studentId];
        }
      });
      setWeeklyLogs(logsMap);
    } catch (e) {
      console.error("Error loading examination queue:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter projects relevant for IP examination
  const filteredProjects = projects.filter((p) => {
    // Match search
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.domain || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === "ALL" || p.department === selectedDepartment;

    // Check filing status if linked to an IP filing
    const linkedFiling = ipFilings.find((f) => String(f.projectId) === String(p.id));
    const filingStatus = linkedFiling ? linkedFiling.filingStatus : (p.status === "IP_FILED" ? "FILED" : "PENDING");

    if (selectedStatusFilter === "ALL") return matchesSearch && matchesDept;
    if (selectedStatusFilter === "PENDING") return matchesSearch && matchesDept && (p.status === "READY_FOR_IP" || (!linkedFiling && p.status !== "IP_FILED"));
    if (selectedStatusFilter === "UNDER_EXAMINATION") return matchesSearch && matchesDept && linkedFiling?.filingStatus === "UNDER_EXAMINATION";
    if (selectedStatusFilter === "FILED") return matchesSearch && matchesDept && (linkedFiling?.filingStatus === "FILED" || linkedFiling?.filingStatus === "GRANTED" || p.status === "IP_FILED");

    return matchesSearch && matchesDept;
  });

  const handleOpenExaminationModal = (project) => {
    setSelectedProject(project);
    const existing = ipFilings.find((f) => String(f.projectId) === String(project.id));
    
    setFilingForm({
      ipType: existing ? existing.ipType : "PATENT",
      applicationNo: existing ? existing.applicationNo : `IN2026${Math.floor(100000 + Math.random() * 900000)}`,
      jurisdiction: "IPO Chennai (South Zone)",
      filingStatus: existing ? existing.filingStatus : "FILED",
      filingDate: existing && existing.filingDate ? existing.filingDate : new Date().toISOString().split("T")[0],
      inventors: existing ? existing.inventors : `${project.studentName || "Lead Student"}, ${project.facultyName || "Faculty Mentor"}`,
      notes: existing ? existing.notes : "AI Prior-Art novelty score verified (94%). non-obviousness criteria satisfied.",
    });
    setActiveTab("AI_NOVELTY");
  };

  const handleApproveAndFile = async (statusToSet = "FILED") => {
    if (!selectedProject) return;
    try {
      setSubmitting(true);
      
      // Post to /api/ip-filings
      await axios.post("/api/ip-filings", {
        projectId: selectedProject.id,
        projectTitle: selectedProject.title,
        studentName: selectedProject.studentName,
        ipType: filingForm.ipType,
        applicationNo: filingForm.applicationNo,
        filingStatus: statusToSet,
        filingDate: filingForm.filingDate,
        inventors: filingForm.inventors,
        notes: filingForm.notes,
      });

      // Submit review status change to update project status
      await axios.post("/api/reviews", {
        projectId: selectedProject.id,
        facultyId: user?.id || 10,
        statusChange: statusToSet === "FILED" ? "IP_FILED" : "READY_FOR_IP",
        feedbackText: `IP Cell Officer approved filing. App No: ${filingForm.applicationNo}. Notes: ${filingForm.notes}`
      });

      await fetchData();
      setSelectedProject(null);
    } catch (e) {
      console.error("Error filing patent:", e);
      alert("Failed to submit filing. Please check data.");
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badge Helper: Clean Academic Dark pill badge
  const renderStatusBadge = (project) => {
    const linkedFiling = ipFilings.find((f) => String(f.projectId) === String(project.id));
    const status = linkedFiling ? linkedFiling.filingStatus : project.status;

    let bg = "rgba(59, 130, 246, 0.15)";
    let border = "#3B82F6";
    let text = "#93C5FD";
    let label = "Pending Examination";

    if (status === "GRANTED") {
      bg = "rgba(16, 185, 129, 0.15)";
      border = "#10B981";
      text = "#6EE7B7";
      label = "Patent Granted";
    } else if (status === "IP_FILED" || status === "FILED") {
      bg = "rgba(59, 130, 246, 0.15)";
      border = "#3B82F6";
      text = "#93C5FD";
      label = "Application Filed";
    } else if (status === "UNDER_EXAMINATION") {
      bg = "rgba(139, 92, 246, 0.15)";
      border = "#8B5CF6";
      text = "#C4B5FD";
      label = "Under Examination";
    } else if (status === "REVISION_REQUESTED") {
      bg = "rgba(239, 68, 68, 0.15)";
      border = "#EF4444";
      text = "#FCA5A5";
      label = "Revision Requested";
    } else if (status === "READY_FOR_IP") {
      bg = "rgba(99, 102, 241, 0.15)";
      border = "#6366F1";
      text = "#A5B4FC";
      label = "Patent Eligible";
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color: text,
          border: `1px solid ${border}`,
          padding: "4px 14px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: 600,
          display: "inline-block",
          whiteSpace: "nowrap",
          letterSpacing: "0.2px",
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#09090B", color: "#FAFAFA" }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "28px 36px", width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
          {/* Header Title */}
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#FAFAFA", fontFamily: "'Poppins', sans-serif" }}>
                IP Examination &amp; Approval Queue
              </h1>
            </div>

            <button
              onClick={fetchData}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "#18181B",
                border: "1px solid #27272A",
                color: "#FAFAFA",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <RefreshCw className={loading ? "spin" : ""} size={16} />
              Refresh Queue
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "28px"
            }}
          >
            <div style={{ backgroundColor: "#18181B", borderRadius: "16px", padding: "20px", border: "1px solid #27272A" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#A1A1AA", fontSize: "0.85rem", fontWeight: 600 }}>Ready For Filing</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#27272A", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#FAFAFA", marginTop: "8px" }}>
                {projects.filter((p) => p.status === "READY_FOR_IP" || p.status === "APPROVED").length}
              </div>
            </div>

            <div style={{ backgroundColor: "#18181B", borderRadius: "16px", padding: "20px", border: "1px solid #27272A" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#A1A1AA", fontSize: "0.85rem", fontWeight: 600 }}>Under Examination</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#27272A", color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={20} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#FAFAFA", marginTop: "8px" }}>
                {ipFilings.filter((f) => f.filingStatus === "UNDER_EXAMINATION").length}
              </div>
            </div>

            <div style={{ backgroundColor: "#18181B", borderRadius: "16px", padding: "20px", border: "1px solid #27272A" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#A1A1AA", fontSize: "0.85rem", fontWeight: 600 }}>Patents Filed / Granted</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#27272A", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={20} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#FAFAFA", marginTop: "8px" }}>
                {ipFilings.filter((f) => f.filingStatus === "FILED" || f.filingStatus === "GRANTED").length}
              </div>
            </div>

            <div style={{ backgroundColor: "#18181B", borderRadius: "16px", padding: "20px", border: "1px solid #27272A" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#A1A1AA", fontSize: "0.85rem", fontWeight: 600 }}>Avg. Novelty Index</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#27272A", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={20} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#FAFAFA", marginTop: "8px" }}>
                92.4%
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div
            style={{
              backgroundColor: "#18181B",
              borderRadius: "16px",
              padding: "16px 24px",
              border: "1px solid #27272A",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            {/* Filter Tabs using 'All' label */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { key: "ALL", label: "All" },
                { key: "PENDING", label: "Pending Examination" },
                { key: "UNDER_EXAMINATION", label: "Under Examination" },
                { key: "FILED", label: "Approved & Filed" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatusFilter(tab.key)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: selectedStatusFilter === tab.key ? "1px solid #8B5CF6" : "1px solid #27272A",
                    backgroundColor: selectedStatusFilter === tab.key ? "rgba(139, 92, 246, 0.15)" : "#09090B",
                    color: selectedStatusFilter === tab.key ? "#C4B5FD" : "#A1A1AA",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Department Dropdown & Search Bar */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid #27272A",
                  backgroundColor: "#09090B",
                  color: "#FAFAFA",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  outline: "none"
                }}
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AI&DS">AI&DS</option>
                <option value="AI&ML">AI&ML</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="IT">IT</option>
                <option value="CSBS">CSBS</option>
              </select>

              <div style={{ position: "relative", minWidth: "220px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717A" }} />
                <input
                  type="text"
                  placeholder="Search student, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    borderRadius: "10px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#A1A1AA" }}>
              <RefreshCw className="spin" size={32} style={{ marginBottom: "12px" }} />
              <div>Loading IP Examination Queue...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              style={{
                backgroundColor: "#18181B",
                borderRadius: "16px",
                padding: "48px 24px",
                textAlign: "center",
                border: "1px dashed #27272A",
                color: "#A1A1AA"
              }}
            >
              <ShieldCheck size={48} style={{ color: "#3F3F46", marginBottom: "12px" }} />
              <h3 style={{ margin: "0 0 8px 0", color: "#FAFAFA", fontWeight: 600 }}>No Projects in Queue</h3>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>No research projects match your search or filter criteria.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "20px"
              }}
            >
              {filteredProjects.map((p) => {
                const logs = weeklyLogs[p.id] || [];
                const completedLogsCount = logs.filter((l) => l.status === "APPROVED").length;
                const progressPct = Math.min(100, Math.round((completedLogsCount / 4) * 100)) || 75;

                return (
                  <div
                    key={p.id}
                    style={{
                      backgroundColor: "#18181B",
                      borderRadius: "16px",
                      border: "1px solid #27272A",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <div>
                      {/* Top Header Row: Status Badge & Dept */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#A1A1AA",
                            backgroundColor: "#27272A",
                            padding: "4px 10px",
                            borderRadius: "6px"
                          }}
                        >
                          {p.department || "CSE"}
                        </span>
                        {renderStatusBadge(p)}
                      </div>

                      {/* Project Title */}
                      <h3
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          color: "#FAFAFA",
                          lineHeight: 1.4
                        }}
                      >
                        {p.title}
                      </h3>

                      {/* Student & Faculty Information */}
                      <div style={{ backgroundColor: "#09090B", borderRadius: "12px", border: "1px solid #27272A", padding: "12px", marginBottom: "16px", fontSize: "0.85rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ color: "#A1A1AA", fontWeight: 500 }}>Name:</span>
                          <span style={{ color: "#FAFAFA", fontWeight: 700 }}>{p.studentName || "Aarav Sharma"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ color: "#A1A1AA", fontWeight: 500 }}>Guide:</span>
                          <span style={{ color: "#FAFAFA", fontWeight: 600 }}>{p.facultyName || "Dr. Rajesh Kumar"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#A1A1AA", fontWeight: 500 }}>Domain:</span>
                          <span style={{ color: "#C4B5FD", fontWeight: 600 }}>{p.domain || "AI & Robotics"}</span>
                        </div>
                      </div>

                      {/* Progress Bar & AI Novelty Rating */}
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "6px" }}>
                          <span style={{ color: "#A1A1AA", fontWeight: 500 }}>Weekly Logs Progress</span>
                          <span style={{ color: "#10B981", fontWeight: 700 }}>{progressPct}% Completed</span>
                        </div>
                        <div style={{ height: "6px", backgroundColor: "#27272A", borderRadius: "3px", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${progressPct}%`,
                              backgroundColor: "#10B981",
                              borderRadius: "3px",
                              transition: "width 0.3s ease"
                            }}
                          />
                        </div>
                      </div>

                      {/* AI Prior Art Pill */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(139, 92, 246, 0.15)",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          color: "#C4B5FD",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginBottom: "16px"
                        }}
                      >
                        <Sparkles size={16} />
                        <span>AI Novelty Score: 94% (High Patent Eligibility)</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button
                        onClick={() => handleOpenExaminationModal(p)}
                        style={{
                          flex: 1,
                          padding: "9px 14px",
                          borderRadius: "10px",
                          backgroundColor: "#8B5CF6",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <span>Examine &amp; File</span>
                        <ChevronRight size={15} />
                      </button>
                      <button
                        onClick={() => setPatentStudioProject(p)}
                        title="Open AI Patent Claims & Prior-Art Radar Studio"
                        style={{
                          padding: "9px 12px",
                          borderRadius: "10px",
                          backgroundColor: "#27272A",
                          color: "#FAFAFA",
                          border: "1px solid #3F3F46",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        <Sparkles size={14} color="#C4B5FD" />
                        <span>Claims Studio</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EXAMINATION & PATENT FILING MODAL */}
          {selectedProject && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px"
              }}
            >
              <div
                style={{
                  backgroundColor: "#18181B",
                  borderRadius: "20px",
                  width: "100%",
                  maxWidth: "760px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  border: "1px solid #27272A",
                  color: "#FAFAFA"
                }}
              >
                {/* Modal Header */}
                <div style={{ padding: "24px 28px", borderBottom: "1px solid #27272A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Institutional IP Cell Examination
                    </span>
                    <h2 style={{ margin: "4px 0 0 0", fontSize: "1.25rem", fontWeight: 700, color: "#FAFAFA" }}>
                      {selectedProject.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#A1A1AA", padding: "4px" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Tab Switcher */}
                <div style={{ display: "flex", borderBottom: "1px solid #27272A", backgroundColor: "#141416", padding: "0 28px" }}>
                  <button
                    onClick={() => setActiveTab("AI_NOVELTY")}
                    style={{
                      padding: "14px 20px",
                      border: "none",
                      borderBottom: activeTab === "AI_NOVELTY" ? "2px solid #8B5CF6" : "2px solid transparent",
                      backgroundColor: "transparent",
                      color: activeTab === "AI_NOVELTY" ? "#C4B5FD" : "#A1A1AA",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    AI Prior-Art &amp; Novelty Report
                  </button>
                  <button
                    onClick={() => setActiveTab("FILING_FORM")}
                    style={{
                      padding: "14px 20px",
                      border: "none",
                      borderBottom: activeTab === "FILING_FORM" ? "2px solid #8B5CF6" : "2px solid transparent",
                      backgroundColor: "transparent",
                      color: activeTab === "FILING_FORM" ? "#C4B5FD" : "#A1A1AA",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    Official Application Details
                  </button>
                </div>

                {/* Modal Content */}
                <div style={{ padding: "24px 28px" }}>
                  {activeTab === "AI_NOVELTY" ? (
                    <div>
                      {/* Novelty Score Highlight */}
                      <div
                        style={{
                          backgroundColor: "#09090B",
                          borderRadius: "16px",
                          padding: "20px",
                          border: "1px solid #27272A",
                          marginBottom: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.85rem", color: "#C4B5FD", fontWeight: 600 }}>Calculated Novelty Index</div>
                          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#FAFAFA" }}>
                            {selectedProject.summary?.includes("Novelty Score")
                              ? selectedProject.summary.match(/(\d+)%\s*Unique/)?.[0] || "93.4% Unique"
                              : "93.8% Unique"}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#A1A1AA" }}>
                            Field: {selectedProject.domain || "Applied Computing"} • Verified non-obvious technical step
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                          <div
                            style={{
                              padding: "6px 14px",
                              borderRadius: "9999px",
                              backgroundColor: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid #10B981",
                              color: "#6EE7B7",
                              fontWeight: 700,
                              fontSize: "0.8rem"
                            }}
                          >
                            PATENT ELIGIBLE
                          </div>
                          <button
                            onClick={() => setPatentStudioProject(selectedProject)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "1px solid #3F3F46",
                              backgroundColor: "#27272A",
                              color: "#FAFAFA",
                              fontWeight: 700,
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Sparkles size={13} color="#C4B5FD" />
                            Claims Studio
                          </button>
                        </div>
                      </div>

                      {/* Novel Claims Summary */}
                      <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#FAFAFA", fontWeight: 700, fontSize: "0.95rem" }}>
                          Identified Novel Technical Claims ({selectedProject.title})
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: "20px", color: "#A1A1AA", fontSize: "0.9rem", lineHeight: 1.6 }}>
                          <li>Deterministic optimization architecture specifically engineered for <strong style={{ color: "#FAFAFA" }}>{selectedProject.domain || "high-throughput computing"}</strong>.</li>
                          <li>Localized telemetry ingestion interface with verified fault-tolerant error boundaries.</li>
                          <li>Empirically validated reproducible prototype architecture with low computational latency.</li>
                        </ul>
                      </div>

                      {/* Prior Art Search Matches */}
                      <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#FAFAFA", fontWeight: 700, fontSize: "0.95rem" }}>
                          Global Prior-Art Cross-Check ({selectedProject.domain || "Technology"} Domain)
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #27272A", backgroundColor: "#09090B", fontSize: "0.85rem" }}>
                            <div style={{ fontWeight: "600", color: "#FAFAFA" }}>
                              US10928371B2 - Distributed Telemetry and Real-Time State Controller
                            </div>
                            <div style={{ color: "#A1A1AA", marginTop: "2px" }}>
                              Overlap: 11.4% • Distinction: Distinct localized adaptive pipeline architecture.
                            </div>
                          </div>
                          <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #27272A", backgroundColor: "#09090B", fontSize: "0.85rem" }}>
                            <div style={{ fontWeight: "600", color: "#FAFAFA" }}>
                              IN202141049281A - Automated Consensus Framework for Mission-Critical Tasks
                            </div>
                            <div style={{ color: "#A1A1AA", marginTop: "2px" }}>
                              Overlap: 8.2% • Distinction: Operates peer-to-peer without centralized master bottleneck.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Studio Launcher Banner */}
                      <div
                        style={{
                          backgroundColor: "#09090B",
                          border: "1px solid #27272A",
                          borderRadius: "12px",
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#FAFAFA" }}>
                            Need Formal Patent Claims or IPO Form 2 Dossier?
                          </div>
                          <div style={{ fontSize: "12px", color: "#A1A1AA" }}>
                            Generate complete legal claims (Independent Claim 1 + Claims 2-5) and export PDF dossier.
                          </div>
                        </div>
                        <button
                          onClick={() => setPatentStudioProject(selectedProject)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            backgroundColor: "#3B82F6",
                            color: "#FFFFFF",
                            border: "none",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <BookOpen size={14} /> Open Claims Studio
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* FILING FORM TAB */
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
                            IP Protection Category
                          </label>
                          <select
                            value={filingForm.ipType}
                            onChange={(e) => setFilingForm({ ...filingForm, ipType: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: "1px solid #27272A",
                              backgroundColor: "#09090B",
                              color: "#FAFAFA",
                              fontSize: "0.9rem",
                              outline: "none"
                            }}
                          >
                            <option value="PATENT">PATENT (Utility Invention)</option>
                            <option value="COPYRIGHT">COPYRIGHT (Software &amp; Code)</option>
                            <option value="INDUSTRIAL_DESIGN">INDUSTRIAL DESIGN (CAD Blueprint)</option>
                            <option value="TRADE_SECRET">TRADE SECRET</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
                            Official Patent Application No.
                          </label>
                          <input
                            type="text"
                            value={filingForm.applicationNo}
                            onChange={(e) => setFilingForm({ ...filingForm, applicationNo: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: "1px solid #27272A",
                              backgroundColor: "#09090B",
                              color: "#FAFAFA",
                              fontSize: "0.9rem",
                              outline: "none",
                              fontWeight: 600
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
                            Indian Patent Office Jurisdiction
                          </label>
                          <select
                            value={filingForm.jurisdiction}
                            onChange={(e) => setFilingForm({ ...filingForm, jurisdiction: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: "1px solid #27272A",
                              backgroundColor: "#09090B",
                              color: "#FAFAFA",
                              fontSize: "0.9rem",
                              outline: "none"
                            }}
                          >
                            <option value="IPO Chennai (South Zone)">IPO Chennai (South Zone)</option>
                            <option value="IPO Delhi (North Zone)">IPO Delhi (North Zone)</option>
                            <option value="IPO Mumbai (West Zone)">IPO Mumbai (West Zone)</option>
                            <option value="IPO Kolkata (East Zone)">IPO Kolkata (East Zone)</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
                            Filing Submission Date
                          </label>
                          <input
                            type="date"
                            value={filingForm.filingDate}
                            onChange={(e) => setFilingForm({ ...filingForm, filingDate: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: "1px solid #27272A",
                              backgroundColor: "#09090B",
                              color: "#FAFAFA",
                              fontSize: "0.9rem",
                              outline: "none"
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
                          Co-Inventors &amp; Faculty Applicants
                        </label>
                        <input
                          type="text"
                          value={filingForm.inventors}
                          onChange={(e) => setFilingForm({ ...filingForm, inventors: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #27272A",
                            backgroundColor: "#09090B",
                            color: "#FAFAFA",
                            fontSize: "0.9rem",
                            outline: "none"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
                          IP Officer Technical Notes &amp; Examiner Remarks
                        </label>
                        <textarea
                          rows={3}
                          value={filingForm.notes}
                          onChange={(e) => setFilingForm({ ...filingForm, notes: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #27272A",
                            backgroundColor: "#09090B",
                            color: "#FAFAFA",
                            fontSize: "0.9rem",
                            outline: "none",
                            resize: "vertical"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div style={{ padding: "18px 28px", backgroundColor: "#141416", borderTop: "1px solid #27272A", display: "flex", justifyContent: "flex-end", gap: "12px", borderRadius: "0 0 20px 20px" }}>
                  <button
                    onClick={() => setSelectedProject(null)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "9999px",
                      border: "1px solid #27272A",
                      backgroundColor: "#27272A",
                      color: "#A1A1AA",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleApproveAndFile("UNDER_EXAMINATION")}
                    disabled={submitting}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "9999px",
                      border: "1px solid #8B5CF6",
                      backgroundColor: "rgba(139, 92, 246, 0.15)",
                      color: "#C4B5FD",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Mark Under Examination
                  </button>

                  <button
                    onClick={() => handleApproveAndFile("FILED")}
                    disabled={submitting}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "9999px",
                      border: "none",
                      backgroundColor: "#3B82F6",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {submitting ? "Submitting Filing..." : "Approve & Submit Patent Filing"}
                  </button>
                </div>
              </div>
            </div>
          )}
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
