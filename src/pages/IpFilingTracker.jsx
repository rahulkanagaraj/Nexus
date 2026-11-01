import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PatentClaimsModal from "../components/PatentClaimsModal";
import {
  ShieldCheck,
  Edit3,
  Search,
  Download,
  Filter,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import axios from "axios";
import { formatDate } from "../utils/formatDate";

export default function IpFilingTracker() {
  const { user } = useAuth();
  const [ipFilings, setIpFilings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFiling, setEditingFiling] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [patentStudioFiling, setPatentStudioFiling] = useState(null);
  const [serverStats, setServerStats] = useState(null);

  const [newFiling, setNewFiling] = useState({
    projectId: "",
    projectTitle: "",
    studentName: "",
    ipType: "PATENT",
    applicationNo: `IN-PAT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    filingStatus: "DRAFTED",
    filingDate: new Date().toISOString().split("T")[0],
    inventors: "",
    notes: "",
  });

  const fetchIpFilings = async () => {
    try {
      setLoading(true);
      const [res, statsRes] = await Promise.all([
        axios.get("/api/ip-filings"),
        axios.get("/api/ip-filings/stats").catch(() => null)
      ]);
      setIpFilings(Array.isArray(res.data) ? res.data : []);
      if (statsRes && statsRes.data) {
        setServerStats(statsRes.data);
      }
    } catch (e) {
      console.error("Error fetching IP filings:", e);
      setIpFilings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/api/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching proposals list:", e);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchIpFilings();
    fetchProjects();
  }, []);

  const generateNewAppNo = (type) => {
    const prefix =
      type === "PATENT"
        ? "IN-PAT"
        : type === "COPYRIGHT"
        ? "IN-CR"
        : type === "TRADE_SECRET"
        ? "IN-TS"
        : "IN-DES";
    return `${prefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleSelectProposal = (projectIdStr) => {
    if (!projectIdStr) {
      setNewFiling((prev) => ({
        ...prev,
        projectId: "",
        projectTitle: "",
        studentName: "",
        inventors: "",
      }));
      return;
    }
    const p = projects.find((proj) => String(proj.id) === String(projectIdStr));
    if (p) {
      const student = p.studentName || p.student_name || "Campus Researcher";
      const mentor = p.facultyName || p.faculty_name || "";
      const inventorsList = mentor ? `${student}, ${mentor}` : student;
      setNewFiling((prev) => ({
        ...prev,
        projectId: p.id,
        projectTitle: p.title,
        studentName: student,
        inventors: inventorsList,
        notes: `Recorded for project #${p.id}: ${p.title}`,
      }));
    }
  };

  const handleCreateIp = async (e) => {
    e.preventDefault();
    if (!newFiling.projectTitle.trim()) {
      alert("Please provide an invention or project title.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        projectId: newFiling.projectId ? Number(newFiling.projectId) : null,
        projectTitle: newFiling.projectTitle.trim(),
        studentName: newFiling.studentName.trim() || user?.name || "Campus Researcher",
        ipType: newFiling.ipType,
        applicationNo: newFiling.applicationNo.trim(),
        filingStatus: newFiling.filingStatus,
        filingDate: newFiling.filingDate,
        inventors: newFiling.inventors.trim(),
        notes: newFiling.notes.trim(),
      };

      await axios.post("/api/ip-filings", payload);
      setIsNewModalOpen(false);
      setNewFiling({
        projectId: "",
        projectTitle: "",
        studentName: "",
        ipType: "PATENT",
        applicationNo: generateNewAppNo("PATENT"),
        filingStatus: "DRAFTED",
        filingDate: new Date().toISOString().split("T")[0],
        inventors: "",
        notes: "",
      });
      fetchIpFilings();
      alert("IP filing record created successfully!");
    } catch (err) {
      alert("Failed to create IP filing: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateIp = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        projectId: editingFiling.projectId || editingFiling.project_id || null,
        projectTitle: editingFiling.projectTitle || editingFiling.project_title,
        studentName: editingFiling.studentName || editingFiling.student_name,
        ipType: editingFiling.ipType || editingFiling.ip_type,
        applicationNo: editingFiling.applicationNo || editingFiling.application_no,
        filingStatus: editingFiling.filingStatus || editingFiling.filing_status,
        filingDate: editingFiling.filingDate || editingFiling.filing_date,
        inventors: editingFiling.inventors,
        notes: editingFiling.notes,
      };

      await axios.put(`/api/ip-filings/${editingFiling.id}`, payload);
      setEditingFiling(null);
      fetchIpFilings();
      alert("IP filing updated successfully!");
    } catch (err) {
      alert("Failed to update IP filing record: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIp = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove the IP filing record for:\n"${title}"?`)) {
      return;
    }
    try {
      await axios.delete(`/api/ip-filings/${id}`);
      fetchIpFilings();
    } catch (err) {
      alert("Failed to delete record: " + (err.response?.data?.message || err.message));
    }
  };

  const getFilingStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    const map = {
      DRAFTED: { bg: "rgba(59, 130, 246, 0.15)", border: "#3B82F6", text: "#93C5FD", label: "Drafted" },
      FILED: { bg: "rgba(245, 158, 11, 0.15)", border: "#F59E0B", text: "#FCD34D", label: "Application Filed" },
      UNDER_EXAMINATION: { bg: "rgba(139, 92, 246, 0.15)", border: "#8B5CF6", text: "#C4B5FD", label: "Under Examination" },
      GRANTED: { bg: "rgba(16, 185, 129, 0.15)", border: "#10B981", text: "#6EE7B7", label: "Patent Granted" },
      REJECTED: { bg: "rgba(239, 68, 68, 0.15)", border: "#EF4444", text: "#FCA5A5", label: "Application Rejected" },
    };
    const b = map[s] || map.DRAFTED;
    return (
      <span
        style={{
          backgroundColor: b.bg,
          color: b.text,
          border: `1px solid ${b.border}`,
          padding: "4px 14px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: 600,
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {b.label}
      </span>
    );
  };

  const safeFilings = Array.isArray(ipFilings) ? ipFilings : [];

  const filteredFilings = safeFilings.filter((i) => {
    const title = (i.projectTitle || i.project_title || "").toLowerCase();
    const student = (i.studentName || i.student_name || "").toLowerCase();
    const appNo = (i.applicationNo || i.application_no || "").toLowerCase();
    const inventors = (i.inventors || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      title.includes(query) || student.includes(query) || appNo.includes(query) || inventors.includes(query);

    const type = (i.ipType || i.ip_type || "").toUpperCase();
    const matchesType = selectedType === "ALL" || type === selectedType;

    const status = (i.filingStatus || i.filing_status || "").toUpperCase();
    const matchesStatus = selectedStatus === "ALL" || status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  };

  const sortedFilings = [...filteredFilings].sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortBy === "title") {
      aVal = (a.projectTitle || a.project_title || "").toLowerCase();
      bVal = (b.projectTitle || b.project_title || "").toLowerCase();
    } else if (sortBy === "appNo") {
      aVal = (a.applicationNo || a.application_no || "").toLowerCase();
      bVal = (b.applicationNo || b.application_no || "").toLowerCase();
    } else if (sortBy === "status") {
      aVal = (a.filingStatus || a.filing_status || "").toLowerCase();
      bVal = (b.filingStatus || b.filing_status || "").toLowerCase();
    } else if (sortBy === "type") {
      aVal = (a.ipType || a.ip_type || "").toLowerCase();
      bVal = (b.ipType || b.ip_type || "").toLowerCase();
    } else {
      aVal = a.filingDate || a.filing_date || "";
      bVal = b.filingDate || b.filing_date || "";
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const exportCsv = () => {
    if (filteredFilings.length === 0) return;
    const headers = [
      "ID",
      "Project Title",
      "Lead Researcher",
      "IP Type",
      "Application No",
      "Filing Status",
      "Filing Date",
      "Inventors",
      "Notes",
    ];
    const rows = filteredFilings.map((f) => [
      f.id,
      `"${(f.projectTitle || f.project_title || "").replace(/"/g, '""')}"`,
      `"${(f.studentName || f.student_name || "").replace(/"/g, '""')}"`,
      f.ipType || f.ip_type || "",
      f.applicationNo || f.application_no || "",
      f.filingStatus || f.filing_status || "",
      f.filingDate ? formatDate(f.filingDate) : "",
      `"${(f.inventors || "").replace(/"/g, '""')}"`,
      `"${(f.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nexus-AI_IP_Filings_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = serverStats?.totalFilings ?? safeFilings.length;
  const draftedCount = serverStats?.drafted ?? safeFilings.filter((i) => (i.filingStatus || i.filing_status) === "DRAFTED").length;
  const filedCount = (serverStats ? (serverStats.filed + serverStats.underExamination) : safeFilings.filter((i) =>
    ["FILED", "UNDER_EXAMINATION"].includes(i.filingStatus || i.filing_status)
  ).length);
  const grantedCount = serverStats?.granted ?? safeFilings.filter((i) => (i.filingStatus || i.filing_status) === "GRANTED").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#09090B",
        color: "#FAFAFA",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "28px 36px", minWidth: 0 }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <ShieldCheck size={28} color="#8B5CF6" />
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#FAFAFA", letterSpacing: "-0.5px" }}>
                  Campus IP &amp; Patent Tracker
                </h2>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={exportCsv}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#18181B",
                  border: "1px solid #27272A",
                  color: "#FAFAFA",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                onClick={() => setIsNewModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "10px",
                  backgroundColor: "#3B82F6",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Record IP Filing
              </button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                backgroundColor: "#18181B",
                padding: "18px 20px",
                borderRadius: "12px",
                border: "1px solid #27272A",
              }}
            >
              <div style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>Total Tracked Assets</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#FAFAFA", marginTop: "4px" }}>
                {totalCount}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#18181B",
                padding: "18px 20px",
                borderRadius: "12px",
                border: "1px solid #27272A",
              }}
            >
              <div style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>In Drafting Phase</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#93C5FD", marginTop: "4px" }}>
                {draftedCount}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#18181B",
                padding: "18px 20px",
                borderRadius: "12px",
                border: "1px solid #27272A",
              }}
            >
              <div style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>Under Examination</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#FCD34D", marginTop: "4px" }}>
                {filedCount}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#18181B",
                padding: "18px 20px",
                borderRadius: "12px",
                border: "1px solid #27272A",
              }}
            >
              <div style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>Granted IP Rights</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>
                {grantedCount}
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div
            style={{
              backgroundColor: "#18181B",
              borderRadius: "12px",
              border: "1px solid #27272A",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 260px" }}>
              <Search size={16} color="#71717A" style={{ position: "absolute", left: "12px", top: "11px" }} />
              <input
                type="text"
                placeholder="Search by title, inventor, or application #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: "8px",
                  border: "1px solid #27272A",
                  backgroundColor: "#09090B",
                  color: "#FAFAFA",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>IP Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #27272A",
                  backgroundColor: "#09090B",
                  color: "#FAFAFA",
                  fontSize: "13px",
                }}
              >
                <option value="ALL">All</option>
                <option value="PATENT">Patent</option>
                <option value="COPYRIGHT">Copyright</option>
                <option value="TRADE_SECRET">Trade Secret</option>
                <option value="INDUSTRIAL_DESIGN">Industrial Design</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #27272A",
                  backgroundColor: "#09090B",
                  color: "#FAFAFA",
                  fontSize: "13px",
                }}
              >
                <option value="ALL">All</option>
                <option value="DRAFTED">Drafted</option>
                <option value="FILED">Application Filed</option>
                <option value="UNDER_EXAMINATION">Under Examination</option>
                <option value="GRANTED">Patent Granted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              backgroundColor: "#18181B",
              borderRadius: "12px",
              border: "1px solid #27272A",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#A1A1AA" }}>
                Loading IP filings repository...
              </div>
            ) : filteredFilings.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "#A1A1AA" }}>
                <ShieldCheck size={36} color="#3F3F46" style={{ margin: "0 auto 12px auto" }} />
                <h4 style={{ margin: "0 0 4px 0", color: "#FAFAFA", fontSize: "15px" }}>No IP Filings Matched</h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "13px" }}>
                  Record a new IP application or endorse a campus proposal to begin.
                </p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#3B82F6",
                    color: "#FFFFFF",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={15} /> Record IP Filing Now
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#141416", borderBottom: "1px solid #27272A", color: "#A1A1AA" }}>
                      <th
                        onClick={() => handleToggleSort("title")}
                        style={{ padding: "14px 16px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>Project Title &amp; Lead Researcher</span>
                          {sortBy === "title" ? (
                            sortOrder === "asc" ? <ChevronUp size={14} color="#8B5CF6" /> : <ChevronDown size={14} color="#8B5CF6" />
                          ) : (
                            <ArrowUpDown size={12} color="#71717A" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleToggleSort("type")}
                        style={{ padding: "14px 16px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>IP Category</span>
                          {sortBy === "type" ? (
                            sortOrder === "asc" ? <ChevronUp size={14} color="#8B5CF6" /> : <ChevronDown size={14} color="#8B5CF6" />
                          ) : (
                            <ArrowUpDown size={12} color="#71717A" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleToggleSort("appNo")}
                        style={{ padding: "14px 16px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>Application No.</span>
                          {sortBy === "appNo" ? (
                            sortOrder === "asc" ? <ChevronUp size={14} color="#8B5CF6" /> : <ChevronDown size={14} color="#8B5CF6" />
                          ) : (
                            <ArrowUpDown size={12} color="#71717A" />
                          )}
                        </div>
                      </th>
                      <th style={{ padding: "14px 16px", fontWeight: 700 }}>Inventors &amp; Collaborators</th>
                      <th
                        onClick={() => handleToggleSort("date")}
                        style={{ padding: "14px 16px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>Filing Date</span>
                          {sortBy === "date" ? (
                            sortOrder === "asc" ? <ChevronUp size={14} color="#8B5CF6" /> : <ChevronDown size={14} color="#8B5CF6" />
                          ) : (
                            <ArrowUpDown size={12} color="#71717A" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleToggleSort("status")}
                        style={{ padding: "14px 16px", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>Status</span>
                          {sortBy === "status" ? (
                            sortOrder === "asc" ? <ChevronUp size={14} color="#8B5CF6" /> : <ChevronDown size={14} color="#8B5CF6" />
                          ) : (
                            <ArrowUpDown size={12} color="#71717A" />
                          )}
                        </div>
                      </th>
                      <th style={{ padding: "14px 16px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilings.map((ip) => {
                      const title = ip.projectTitle || ip.project_title || "Campus Invention";
                      const student = ip.studentName || ip.student_name || "Lead Researcher";
                      const appNo = ip.applicationNo || ip.application_no;
                      const ipType = ip.ipType || ip.ip_type;
                      const status = ip.filingStatus || ip.filing_status;
                      const date = ip.filingDate ? formatDate(ip.filingDate) : "In Drafting";

                      return (
                        <tr key={ip.id} style={{ borderBottom: "1px solid #27272A" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 600, color: "#FAFAFA", maxWidth: "300px" }}>{title}</div>
                            <div style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "2px" }}>
                              Lead: {student}
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "3px 8px",
                                borderRadius: "4px",
                                backgroundColor: "#27272A",
                                color: "#FAFAFA",
                              }}
                            >
                              {ipType}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "#93C5FD",
                            }}
                          >
                            {appNo || "PENDING"}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#FAFAFA", maxWidth: "200px" }}>
                            {ip.inventors || student}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#A1A1AA" }}>
                            {date}
                          </td>
                          <td style={{ padding: "14px 16px" }}>{getFilingStatusBadge(status)}</td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <button
                                onClick={() => setPatentStudioFiling(ip)}
                                title="Open AI Patent Claims Studio & Prior-Art Radar"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(139, 92, 246, 0.15)",
                                  color: "#C4B5FD",
                                  border: "1px solid rgba(139, 92, 246, 0.3)",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                <Sparkles size={13} color="#A78BFA" /> Claims Studio
                              </button>
                              <button
                                onClick={() => setEditingFiling(ip)}
                                title="Manage & Update IP Lifecycle"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  backgroundColor: "#27272A",
                                  color: "#FAFAFA",
                                  border: "1px solid #3F3F46",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteIp(ip.id, title)}
                                title="Remove IP record"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                                  color: "#FCA5A5",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Record New IP Filing Modal */}
      {isNewModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "580px",
              backgroundColor: "#18181B",
              borderRadius: "16px",
              border: "1px solid #27272A",
              padding: "26px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
              color: "#FAFAFA",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#27272A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={20} color="#3B82F6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#FAFAFA" }}>
                    Record New Institutional IP Filing
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#A1A1AA" }}>
                    Archive a patent, copyright, or design registration into the campus IP repository
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#A1A1AA",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Optional Link to Proposal */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Link to Campus Research Proposal (Optional)
                </label>
                <select
                  value={newFiling.projectId}
                  onChange={(e) => handleSelectProposal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">[ Independent Invention / Custom Entry ]</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} — {p.title} ({p.studentName || "Student"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Invention / IP Title <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFiling.projectTitle}
                  onChange={(e) => setNewFiling({ ...newFiling, projectTitle: e.target.value })}
                  placeholder="e.g. Autonomous Drone Swarm Navigation via Deep Reinforcement Learning"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Lead Researcher */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Lead Researcher / Applicant Name
                </label>
                <input
                  type="text"
                  value={newFiling.studentName}
                  onChange={(e) => setNewFiling({ ...newFiling, studentName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* IP Category & Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FAFAFA",
                      marginBottom: "4px",
                    }}
                  >
                    IP Category
                  </label>
                  <select
                    value={newFiling.ipType}
                    onChange={(e) => {
                      const t = e.target.value;
                      setNewFiling({
                        ...newFiling,
                        ipType: t,
                        applicationNo: generateNewAppNo(t),
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "8px",
                      border: "1px solid #27272A",
                      backgroundColor: "#09090B",
                      color: "#FAFAFA",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="PATENT">Patent</option>
                    <option value="COPYRIGHT">Copyright</option>
                    <option value="TRADE_SECRET">Trade Secret</option>
                    <option value="INDUSTRIAL_DESIGN">Industrial Design</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FAFAFA",
                      marginBottom: "4px",
                    }}
                  >
                    Lifecycle Status
                  </label>
                  <select
                    value={newFiling.filingStatus}
                    onChange={(e) => setNewFiling({ ...newFiling, filingStatus: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "8px",
                      border: "1px solid #27272A",
                      backgroundColor: "#09090B",
                      color: "#FAFAFA",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="DRAFTED">Drafted</option>
                    <option value="FILED">Application Filed</option>
                    <option value="UNDER_EXAMINATION">Under Examination</option>
                    <option value="GRANTED">Patent Granted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Application No. & Filing Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#FAFAFA" }}>
                      Application Number
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewFiling({
                          ...newFiling,
                          applicationNo: generateNewAppNo(newFiling.ipType),
                        })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#93C5FD",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newFiling.applicationNo}
                    onChange={(e) => setNewFiling({ ...newFiling, applicationNo: e.target.value })}
                    placeholder="e.g. IN202641098234"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #27272A",
                      backgroundColor: "#09090B",
                      color: "#FAFAFA",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FAFAFA",
                      marginBottom: "4px",
                    }}
                  >
                    Filing Date
                  </label>
                  <input
                    type="date"
                    value={newFiling.filingDate}
                    onChange={(e) => setNewFiling({ ...newFiling, filingDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #27272A",
                      backgroundColor: "#09090B",
                      color: "#FAFAFA",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Inventors */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Inventors &amp; Collaborators
                </label>
                <input
                  type="text"
                  value={newFiling.inventors}
                  onChange={(e) => setNewFiling({ ...newFiling, inventors: e.target.value })}
                  placeholder="e.g. Aarav Sharma, Dr. Rajesh Kumar"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Institutional IP Notes &amp; Prior Art Log
                </label>
                <textarea
                  rows={3}
                  value={newFiling.notes}
                  onChange={(e) => setNewFiling({ ...newFiling, notes: e.target.value })}
                  placeholder="Notes on novelty check, prior art search, or patent office communication..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#27272A",
                    color: "#A1A1AA",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#3B82F6",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Recording..." : "Archive IP Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit IP Modal */}
      {editingFiling && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "#18181B",
              borderRadius: "16px",
              border: "1px solid #27272A",
              padding: "26px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
              color: "#FAFAFA",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#27272A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck size={20} color="#8B5CF6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#FAFAFA" }}>
                    Manage Institutional IP Record
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#A1A1AA" }}>
                    {editingFiling.projectTitle || editingFiling.project_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingFiling(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#A1A1AA",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateIp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FAFAFA",
                      marginBottom: "4px",
                    }}
                  >
                    IP Category
                  </label>
                  <select
                    value={editingFiling.ipType || editingFiling.ip_type || "PATENT"}
                    onChange={(e) =>
                      setEditingFiling({
                        ...editingFiling,
                        ipType: e.target.value,
                        ip_type: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "8px",
                      border: "1px solid #27272A",
                      backgroundColor: "#09090B",
                      color: "#FAFAFA",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="PATENT">Patent</option>
                    <option value="COPYRIGHT">Copyright</option>
                    <option value="TRADE_SECRET">Trade Secret</option>
                    <option value="INDUSTRIAL_DESIGN">Industrial Design</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FAFAFA",
                      marginBottom: "4px",
                    }}
                  >
                    Lifecycle Status
                  </label>
                  <select
                    value={editingFiling.filingStatus || editingFiling.filing_status || "DRAFTED"}
                    onChange={(e) =>
                      setEditingFiling({
                        ...editingFiling,
                        filingStatus: e.target.value,
                        filing_status: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "8px",
                      border: "1px solid #27272A",
                      backgroundColor: "#09090B",
                      color: "#FAFAFA",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="DRAFTED">Drafted</option>
                    <option value="FILED">Application Filed</option>
                    <option value="UNDER_EXAMINATION">Under Examination</option>
                    <option value="GRANTED">Patent Granted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Application Number
                </label>
                <input
                  type="text"
                  value={editingFiling.applicationNo || editingFiling.application_no || ""}
                  onChange={(e) =>
                    setEditingFiling({
                      ...editingFiling,
                      applicationNo: e.target.value,
                      application_no: e.target.value,
                    })
                  }
                  placeholder="e.g. IN202641098234"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Filing Date
                </label>
                <input
                  type="date"
                  value={editingFiling.filingDate || editingFiling.filing_date || ""}
                  onChange={(e) =>
                    setEditingFiling({
                      ...editingFiling,
                      filingDate: e.target.value,
                      filing_date: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Inventors &amp; Collaborators
                </label>
                <input
                  type="text"
                  value={editingFiling.inventors || ""}
                  onChange={(e) => setEditingFiling({ ...editingFiling, inventors: e.target.value })}
                  placeholder="e.g. Sarah Williams, Dr. Emily Carter"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#FAFAFA",
                    marginBottom: "4px",
                  }}
                >
                  Institutional IP Cell Notes &amp; Examination Log
                </label>
                <textarea
                  rows={3}
                  value={editingFiling.notes || ""}
                  onChange={(e) => setEditingFiling({ ...editingFiling, notes: e.target.value })}
                  placeholder="Notes on novelty check, prior art search, or examiner queries..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#09090B",
                    color: "#FAFAFA",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingFiling(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid #27272A",
                    backgroundColor: "#27272A",
                    color: "#A1A1AA",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#3B82F6",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving..." : "Save IP Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {patentStudioFiling && (
        <PatentClaimsModal
          filing={patentStudioFiling}
          onClose={() => setPatentStudioFiling(null)}
        />
      )}
    </div>
  );
}
