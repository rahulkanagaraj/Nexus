import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { PlusCircle, Sparkles, CheckCircle, Clock, Users, BookOpen, Layers, Search, Filter } from "lucide-react";
import axios from "axios";

export default function AcademicOfficeDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("allocation"); // 'allocation' or 'catalogue'

  // Selections & Allocation State
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSelection, setSelectedSelection] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [allocating, setAllocating] = useState(false);

  // Catalogue Management State
  const [catalogueItems, setCatalogueItems] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [domain, setDomain] = useState("AI & Robotics");
  const [techStack, setTechStack] = useState("PyTorch, Python");
  const [submittingCat, setSubmittingCat] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resSel, resCat] = await Promise.all([
        axios.get("/api/project-catalogue/selections"),
        axios.get("/api/project-catalogue"),
      ]);
      setSelections(resSel.data || []);
      setCatalogueItems(resCat.data || []);
    } catch (err) {
      console.error("Failed to load Academic Office dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAllocationModal = async (selection) => {
    setSelectedSelection(selection);
    setSelectedFacultyId("");
    try {
      const resAi = await axios.get(`/api/project-catalogue/ai-recommend-mentor?domain=${encodeURIComponent(selection.catalogueItem?.domain || "CSE")}`);
      setAiRecommendations(resAi.data || null);
      if (resAi.data?.facultyList?.length > 0) {
        setSelectedFacultyId(resAi.data.facultyList[0].facultyId);
      }
    } catch (err) {
      console.error("Failed to fetch AI mentor recommendations", err);
    }
  };

  const handleConfirmMentorAllocation = async (e) => {
    e.preventDefault();
    if (!selectedSelection || !selectedFacultyId) return;

    setAllocating(true);
    try {
      await axios.post(`/api/project-catalogue/selections/${selectedSelection.id}/allocate-mentor`, {
        facultyId: selectedFacultyId,
      });

      setSelectedSelection(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to allocate mentor.");
    } finally {
      setAllocating(false);
    }
  };

  const handleCreateCatalogueItem = async (e) => {
    e.preventDefault();
    if (!code || !title) return;

    setSubmittingCat(true);
    try {
      await axios.post("/api/project-catalogue", {
        code,
        title,
        description,
        department,
        domain,
        techStack,
        pdfUrl: "/uploads/S5_Project_Catalogue_2026.pdf",
      });

      setShowCreateModal(false);
      setCode("");
      setTitle("");
      setDescription("");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to create catalogue item", err);
    } finally {
      setSubmittingCat(false);
    }
  };

  const pendingSelections = selections.filter((s) => s.status === "PENDING_MENTOR");
  const confirmedSelections = selections.filter((s) => s.status === "CONFIRMED");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab="academics" />

        <main style={{ flex: 1, padding: "28px 36px", maxWidth: "1240px", margin: "0 auto", boxSizing: "border-box" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#FAFAFA", margin: 0 }}>
                Academic Office Allocation &amp; Catalogue Portal
              </h1>
              <p style={{ fontSize: "13px", color: "#71717A", margin: "4px 0 0 0" }}>
                Smart AI Mentor Matching, Grouping Same-Topic Students, and Managing S5 Catalogue.
              </p>
            </div>

            {activeTab === "catalogue" && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: "#3B82F6",
                  color: "#FFFFFF",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <PlusCircle size={15} /> Publish New Catalogue Project
              </button>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #27272A", paddingBottom: "10px" }}>
            <button
              onClick={() => setActiveTab("allocation")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: activeTab === "allocation" ? "1px solid #3B82F6" : "1px solid #27272A",
                backgroundColor: activeTab === "allocation" ? "#3B82F6" : "#18181B",
                color: activeTab === "allocation" ? "#FFFFFF" : "#A1A1AA",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              🎯 Smart Mentor Allocation ({pendingSelections.length} Pending)
            </button>
            <button
              onClick={() => setActiveTab("catalogue")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: activeTab === "catalogue" ? "1px solid #3B82F6" : "1px solid #27272A",
                backgroundColor: activeTab === "catalogue" ? "#3B82F6" : "#18181B",
                color: activeTab === "catalogue" ? "#FFFFFF" : "#A1A1AA",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              📚 S5 Catalogue Projects ({catalogueItems.length})
            </button>
          </div>

          {/* Metrics Overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <div style={{ backgroundColor: "#18181B", padding: "16px", borderRadius: "12px", border: "1px solid #27272A" }}>
              <div style={{ fontSize: "11px", color: "#71717A", fontWeight: 600 }}>Total S5 Catalogue Topics</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#FAFAFA", marginTop: "4px" }}>{catalogueItems.length}</div>
            </div>
            <div style={{ backgroundColor: "#18181B", padding: "16px", borderRadius: "12px", border: "1px solid #27272A" }}>
              <div style={{ fontSize: "11px", color: "#71717A", fontWeight: 600 }}>Pending Mentor Assignments</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#EF4444", marginTop: "4px" }}>{pendingSelections.length}</div>
            </div>
            <div style={{ backgroundColor: "#18181B", padding: "16px", borderRadius: "12px", border: "1px solid #27272A" }}>
              <div style={{ fontSize: "11px", color: "#71717A", fontWeight: 600 }}>Confirmed Student Groups</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#10B981", marginTop: "4px" }}>{confirmedSelections.length}</div>
            </div>
            <div style={{ backgroundColor: "#18181B", padding: "16px", borderRadius: "12px", border: "1px solid #27272A" }}>
              <div style={{ fontSize: "11px", color: "#71717A", fontWeight: 600 }}>Supported Departments</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#8B5CF6", marginTop: "4px" }}>7 Depts</div>
            </div>
          </div>

          {/* Tab 1: Smart Mentor Allocation */}
          {activeTab === "allocation" && (
            <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px" }}>
                Pending Student Project Selections &amp; AI Guide Matching
              </h2>

              {loading ? (
                <p style={{ color: "#71717A", fontSize: "13px" }}>Loading pending selections...</p>
              ) : selections.length === 0 ? (
                <p style={{ color: "#71717A", fontSize: "13px" }}>No student project selections submitted yet.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#09090B", borderBottom: "1px solid #27272A" }}>
                        <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Student Name</th>
                        <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Dept</th>
                        <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Selected Project Topic</th>
                        <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Domain</th>
                        <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Status</th>
                        <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Assigned Guide</th>
                        <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selections.map((sel) => (
                        <tr key={sel.id} style={{ borderBottom: "1px solid #27272A" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: "#FAFAFA", borderRight: "1px solid #27272A" }}>
                            {sel.student?.fullName}
                          </td>
                          <td style={{ padding: "10px 12px", color: "#A1A1AA", borderRight: "1px solid #27272A" }}>
                            {sel.student?.department}
                          </td>
                          <td style={{ padding: "10px 12px", borderRight: "1px solid #27272A" }}>
                            <div style={{ fontWeight: 700, color: "#3B82F6" }}>[{sel.catalogueItem?.code}] {sel.catalogueItem?.title}</div>
                            <div style={{ color: "#10B981", fontSize: "10px" }}>Tech: {sel.catalogueItem?.techStack}</div>
                          </td>
                          <td style={{ padding: "10px 12px", borderRight: "1px solid #27272A" }}>
                            <span style={{ backgroundColor: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6", border: "1px solid rgba(139, 92, 246, 0.25)", fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "6px" }}>
                              {sel.catalogueItem?.domain}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", borderRight: "1px solid #27272A" }}>
                            <span
                              style={{
                                backgroundColor: sel.status === "CONFIRMED" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                color: sel.status === "CONFIRMED" ? "#10B981" : "#F59E0B",
                                border: `1px solid ${sel.status === "CONFIRMED" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "6px",
                              }}
                            >
                              {sel.status}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#A1A1AA", fontWeight: 600, borderRight: "1px solid #27272A" }}>
                            {sel.faculty?.fullName || <em style={{ color: "#71717A" }}>Not Assigned</em>}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            {sel.status === "PENDING_MENTOR" ? (
                              <button
                                onClick={() => handleOpenAllocationModal(sel)}
                                style={{
                                  backgroundColor: "#3B82F6",
                                  color: "#FFFFFF",
                                  border: "none",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Sparkles size={12} /> Smart Guide Match
                              </button>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>Confirmed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Catalogue Manager */}
          {activeTab === "catalogue" && (
            <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px" }}>
                Published S5 Catalogue Topics ({catalogueItems.length} Total)
              </h2>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#09090B", borderBottom: "1px solid #27272A" }}>
                      <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "70px" }}>Code</th>
                      <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Title &amp; Summary</th>
                      <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "80px" }}>Dept</th>
                      <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "130px" }}>Domain</th>
                      <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "130px" }}>Tech Stack</th>
                      <th style={{ padding: "10px 12px", color: "#71717A", fontWeight: 700, width: "110px" }}>Student Load</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogueItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #27272A" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: "#3B82F6", borderRight: "1px solid #27272A" }}>{item.code}</td>
                        <td style={{ padding: "10px 12px", borderRight: "1px solid #27272A" }}>
                          <div style={{ fontWeight: 700, color: "#FAFAFA" }}>{item.title}</div>
                          <div style={{ color: "#71717A", fontSize: "11px" }}>{item.description}</div>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#A1A1AA", fontWeight: 600, borderRight: "1px solid #27272A" }}>{item.department}</td>
                        <td style={{ padding: "10px 12px", borderRight: "1px solid #27272A" }}>
                          <span style={{ backgroundColor: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6", border: "1px solid rgba(139, 92, 246, 0.25)", fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "6px" }}>{item.domain}</span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#10B981", fontWeight: 600, borderRight: "1px solid #27272A" }}>{item.techStack}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ backgroundColor: item.selectedCount >= 2 ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: item.selectedCount >= 2 ? "#EF4444" : "#10B981", border: `1px solid ${item.selectedCount >= 2 ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`, fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                            {item.selectedCount} / 2 Seats
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Smart Mentor Allocation Modal */}
          {selectedSelection && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", width: "100%", maxWidth: "560px", padding: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} color="#8B5CF6" /> AI Smart Staff Recommendation &amp; Guide Mapping
                </h3>
                <p style={{ fontSize: "12px", color: "#71717A", marginBottom: "16px" }}>
                  Allocating guide for <strong>{selectedSelection.student?.fullName}</strong>. Topic: <strong>{selectedSelection.catalogueItem?.title}</strong> ({selectedSelection.catalogueItem?.domain}).
                </p>

                <form onSubmit={handleConfirmMentorAllocation}>
                  {aiRecommendations && (
                    <div style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.25)", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#8B5CF6", marginBottom: "4px" }}>
                        🤖 AI Analysis for '{aiRecommendations.domain}':
                      </div>
                      <div style={{ fontSize: "11px", color: "#A1A1AA" }}>
                        Recommended Department Clusters: <strong>{aiRecommendations.primaryRecommendedDepts?.join(", ")}</strong>. Faculty in these departments are highlighted first.
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Select Faculty Guide (7 Dept Staff Available) *
                    </label>

                    <select
                      required
                      value={selectedFacultyId}
                      onChange={(e) => setSelectedFacultyId(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px", outline: "none" }}
                    >
                      {aiRecommendations?.facultyList?.map((f) => (
                        <option key={f.facultyId} value={f.facultyId}>
                          {f.aiRecommended ? "⭐ " : ""}{f.fullName} ({f.department}) - Current Load: {f.currentLoad}/10 Students {f.aiRecommended ? "[AI RECOMMENDED]" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ backgroundColor: "#09090B", border: "1px solid #27272A", padding: "10px", borderRadius: "8px", fontSize: "11px", color: "#A1A1AA", marginBottom: "20px" }}>
                    ℹ️ <strong>Group Rule:</strong> All students selecting topic '{selectedSelection.catalogueItem?.code}' will automatically be assigned to this same Faculty Guide. Max 10 students per guide.
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button type="button" onClick={() => setSelectedSelection(null)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #3F3F46", backgroundColor: "transparent", color: "#FAFAFA", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={allocating} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#3B82F6", color: "#FFFFFF", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      {allocating ? "Assigning..." : "Confirm & Assign Faculty Guide"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Catalogue Item Modal */}
          {showCreateModal && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", width: "100%", maxWidth: "520px", padding: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", marginBottom: "14px" }}>
                  Publish New S5 Project Topic
                </h3>

                <form onSubmit={handleCreateCatalogueItem}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>Code *</label>
                      <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="S5-11" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>Project Title *</label>
                      <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title..." style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px", boxSizing: "border-box" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>Department</label>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px" }}>
                        {["CSE", "AI&DS", "AI&ML", "IT", "CSBS", "ECE", "EEE"].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>Domain</label>
                      <select value={domain} onChange={(e) => setDomain(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px" }}>
                        {["AI & Robotics", "IoT & Embedded", "Cybersecurity", "Web & Cloud", "Signal Processing"].map((dm) => (
                          <option key={dm} value={dm}>{dm}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>Tech Stack</label>
                    <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="e.g. React, Python" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px", boxSizing: "border-box" }} />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>Description</label>
                    <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary..." style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px", boxSizing: "border-box" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #3F3F46", backgroundColor: "transparent", color: "#FAFAFA", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button type="submit" disabled={submittingCat} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#3B82F6", color: "#FFFFFF", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      {submittingCat ? "Publishing..." : "Publish Catalogue Project"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
