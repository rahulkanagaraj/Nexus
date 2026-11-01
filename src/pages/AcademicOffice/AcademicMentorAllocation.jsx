import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Sparkles, CheckCircle, Clock, UserCheck } from "lucide-react";
import axios from "axios";

export default function AcademicMentorAllocation() {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSelection, setSelectedSelection] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    fetchSelections();
  }, []);

  const fetchSelections = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/project-catalogue/selections");
      setSelections(res.data || []);
    } catch (err) {
      console.error("Failed to load selections", err);
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
      fetchSelections();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to allocate mentor.");
    } finally {
      setAllocating(false);
    }
  };

  const pendingSelections = selections.filter((s) => s.status === "PENDING_MENTOR");
  const confirmedSelections = selections.filter((s) => s.status === "CONFIRMED");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab="academics-allocation" />

        <main style={{ flex: 1, padding: "28px 36px", width: "100%", boxSizing: "border-box" }}>
          {/* Header Title */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#FAFAFA", margin: 0 }}>
              Faculty Guide Allocation
            </h1>
          </div>

          {/* Allocation Overview Cards */}
          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px", boxSizing: "border-box" }}>
            <div style={{ backgroundColor: "#18181B", padding: "20px", borderRadius: "14px", border: "1px solid #27272A" }}>
              <div style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>Unassigned Pending Students</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#EF4444", marginTop: "6px" }}>{pendingSelections.length}</div>
            </div>
            <div style={{ backgroundColor: "#18181B", padding: "20px", borderRadius: "14px", border: "1px solid #27272A" }}>
              <div style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>Confirmed Student Groups</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#10B981", marginTop: "6px" }}>{confirmedSelections.length}</div>
            </div>
            <div style={{ backgroundColor: "#18181B", padding: "20px", borderRadius: "14px", border: "1px solid #27272A" }}>
              <div style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600 }}>Allocation Rule</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#8B5CF6", marginTop: "8px" }}>
                2 Students : 1 Guide per Title
              </div>
            </div>
          </div>

          {/* Unassigned Students Table */}
          <div style={{ width: "100%", backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "20px", marginBottom: "24px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="#F59E0B" /> Pending Unassigned Students ({pendingSelections.length})
              </h2>
            </div>

            {loading ? (
              <p style={{ color: "#71717A", fontSize: "13px" }}>Loading pending selections...</p>
            ) : pendingSelections.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#09090B", borderRadius: "8px", border: "1px solid #27272A" }}>
                <UserCheck size={32} color="#10B981" style={{ marginBottom: "8px" }} />
                <p style={{ color: "#10B981", fontSize: "13px", fontWeight: 700, margin: 0 }}>All student selections have been successfully mapped to Faculty Guides!</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#09090B", borderBottom: "1px solid #27272A" }}>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Student Name</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "90px" }}>Dept</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Chosen S5 Topic</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "140px" }}>Domain</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "100px" }}>Status</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, textAlign: "center", width: "160px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSelections.map((sel) => (
                      <tr key={sel.id} style={{ borderBottom: "1px solid #27272A" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#FAFAFA", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          {sel.student?.fullName}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#A1A1AA", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          {sel.student?.department}
                        </td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          <div style={{ fontWeight: 700, color: "#3B82F6" }}>[{sel.catalogueItem?.code}] {sel.catalogueItem?.title}</div>
                          <div style={{ color: "#10B981", fontSize: "10px" }}>Tech: {sel.catalogueItem?.techStack}</div>
                        </td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          <span
                            style={{
                              display: "inline-block",
                              backgroundColor: "rgba(139, 92, 246, 0.12)",
                              color: "#8B5CF6",
                              border: "1px solid rgba(139, 92, 246, 0.25)",
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: "6px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sel.catalogueItem?.domain}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          <span style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
                            Unassigned
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                          <button
                            onClick={() => handleOpenAllocationModal(sel)}
                            style={{
                              backgroundColor: "#3B82F6",
                              color: "#FFFFFF",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Sparkles size={12} /> Assign Guide &amp; Pair
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Confirmed Student & Mentor Allocations Table */}
          <div style={{ width: "100%", backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "20px", boxSizing: "border-box" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={16} color="#10B981" /> Confirmed Guide Allocations ({confirmedSelections.length})
            </h2>

            {confirmedSelections.length === 0 ? (
              <p style={{ color: "#71717A", fontSize: "13px" }}>No confirmed guide allocations yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#09090B", borderBottom: "1px solid #27272A" }}>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Student Name</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Assigned Faculty Guide</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Project Title</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Domain</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedSelections.map((sel) => (
                      <tr key={sel.id} style={{ borderBottom: "1px solid #27272A" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#FAFAFA", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>{sel.student?.fullName}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#10B981", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          {sel.faculty?.fullName} ({sel.faculty?.department})
                        </td>
                        <td style={{ padding: "12px 16px", color: "#3B82F6", fontWeight: 600, borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          [{sel.catalogueItem?.code}] {sel.catalogueItem?.title}
                        </td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                          <span
                            style={{
                              display: "inline-block",
                              backgroundColor: "rgba(139, 92, 246, 0.12)",
                              color: "#8B5CF6",
                              border: "1px solid rgba(139, 92, 246, 0.25)",
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: "6px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sel.catalogueItem?.domain}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                          <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>Confirmed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Guide Mapping Modal */}
          {selectedSelection && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", width: "100%", maxWidth: "560px", padding: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} color="#8B5CF6" /> AI Guide Pairing &amp; Allocation
                </h3>
                <p style={{ fontSize: "12px", color: "#A1A1AA", marginBottom: "16px" }}>
                  Assigning Faculty Guide for <strong>{selectedSelection.student?.fullName}</strong>. Topic: <strong>{selectedSelection.catalogueItem?.title}</strong> ({selectedSelection.catalogueItem?.domain}).
                </p>

                <form onSubmit={handleConfirmMentorAllocation}>
                  {aiRecommendations && (
                    <div style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.25)", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#8B5CF6", marginBottom: "4px" }}>
                        🤖 AI Analysis for '{aiRecommendations.domain}':
                      </div>
                      <div style={{ fontSize: "11px", color: "#A1A1AA" }}>
                        Recommended Staff Departments: <strong>{aiRecommendations.primaryRecommendedDepts?.join(", ")}</strong>. High-alignment staff highlighted below.
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Select Faculty Guide *
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
        </main>
      </div>
    </div>
  );
}
