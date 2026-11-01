import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { FileText, Download, CheckCircle, Filter, Search } from "lucide-react";
import axios from "axios";

const DOMAINS = [
  "ALL",
  "Full-Stack",
  "CV",
  "Gen-AI",
  "Machine Learning",
  "IoT & Embedded",
  "Cybersecurity",
  "Cloud & DevOps",
];

export default function ProjectCatalogueSelection() {
  const { user } = useAuth();
  const [catalogue, setCatalogue] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mySelection, setMySelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchCatalogueAndSelection();
  }, [user]);

  const fetchCatalogueAndSelection = async () => {
    try {
      setLoading(true);
      const [resCat, resSel] = await Promise.all([
        axios.get("/api/project-catalogue"),
        user?.id ? axios.get(`/api/project-catalogue/selections/student?studentId=${user.id}`).catch(() => ({ data: null })) : { data: null },
      ]);

      setCatalogue(resCat.data || []);
      setMySelection(resSel.data || null);
    } catch (err) {
      console.error("Failed to fetch S5 project catalogue", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (catalogueId) => {
    if (!user?.id) return;
    setSubmittingId(catalogueId);
    try {
      await axios.post("/api/project-catalogue/selections", {
        studentId: user.id,
        catalogueId: catalogueId,
      });

      fetchCatalogueAndSelection();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to select project topic.");
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredProjects = catalogue.filter((item) => {
    const matchesDomain = selectedDomain === "ALL" || item.domain?.toLowerCase() === selectedDomain.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.techStack.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab="catalogue" />

        <main style={{ flex: 1, padding: "28px 36px", width: "100%", boxSizing: "border-box" }}>
          {/* Header Title */}
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#FAFAFA", margin: 0 }}>
              S5 Project Catalogue
            </h1>
          </div>

          {/* S5 PDF Download Card */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#18181B",
              border: "1px solid #27272A",
              borderRadius: "14px",
              padding: "16px 24px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FileText size={22} color="#3B82F6" />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>
                Official S5 Capstone Project Catalogue PDF
              </span>
            </div>

            <a
              href="/uploads/S5_Project_Catalogue_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                padding: "9px 18px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Download size={15} /> Download PDF
            </a>
          </div>

          {/* Student's Current Confirmed Selection Banner */}
          {mySelection && (
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "14px",
                padding: "14px 24px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxSizing: "border-box",
              }}
            >
              <CheckCircle size={20} color="#10B981" />
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#10B981" }}>
                Confirmed: [{mySelection.catalogueItem?.code}] {mySelection.catalogueItem?.title} ({mySelection.catalogueItem?.domain})
                {mySelection.faculty ? ` — Mentor: ${mySelection.faculty.fullName}` : ""}
              </div>
            </div>
          )}

          {/* Domain Filter Pills & Search Bar */}
          <div style={{ width: "100%", backgroundColor: "#18181B", padding: "18px 24px", borderRadius: "14px", border: "1px solid #27272A", marginBottom: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "#FAFAFA" }}>
                <Filter size={15} color="#8B5CF6" /> Domain Filters:
              </div>

              <div style={{ position: "relative", minWidth: "280px" }}>
                <Search size={15} color="#71717A" style={{ position: "absolute", left: "12px", top: "10px" }} />
                <input
                  type="text"
                  placeholder="Search title, tech stack..."
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
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {DOMAINS.map((domain) => {
                const isActive = selectedDomain.toLowerCase() === domain.toLowerCase();
                return (
                  <button
                    key={domain}
                    onClick={() => setSelectedDomain(domain)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "9999px",
                      border: isActive ? "1px solid #3B82F6" : "1px solid #27272A",
                      backgroundColor: isActive ? "#3B82F6" : "#09090B",
                      color: isActive ? "#FFFFFF" : "#A1A1AA",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {domain === "ALL" ? "All Domains" : domain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Width Gridline Table */}
          <div style={{ width: "100%", backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", overflow: "hidden", boxSizing: "border-box" }}>
            {loading ? (
              <div style={{ padding: "28px", color: "#71717A", fontSize: "13px", textAlign: "center" }}>Loading catalogue items...</div>
            ) : filteredProjects.length === 0 ? (
              <div style={{ padding: "36px", textAlign: "center", color: "#71717A", fontSize: "13px" }}>
                No project topics found matching the selected domain filter.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#09090B", borderBottom: "1px solid #27272A" }}>
                      <th style={{ padding: "14px 18px", color: "#71717A", fontWeight: 700, width: "90px" }}>Code</th>
                      <th style={{ padding: "14px 18px", color: "#71717A", fontWeight: 700 }}>Project Title &amp; Description</th>
                      <th style={{ padding: "14px 18px", color: "#71717A", fontWeight: 700, width: "150px" }}>Domain</th>
                      <th style={{ padding: "14px 18px", color: "#71717A", fontWeight: 700, width: "190px" }}>Tech Stack</th>
                      <th style={{ padding: "14px 18px", color: "#71717A", fontWeight: 700, width: "150px" }}>Quota</th>
                      <th style={{ padding: "14px 18px", color: "#71717A", fontWeight: 700, width: "130px", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p) => {
                      const selected = p.selectedCount || 0;
                      const max = p.maxStudents || 2;
                      const percent = Math.min(100, Math.round((selected / max) * 100));
                      const isFull = selected >= max;
                      const isSelectedByMe = mySelection?.catalogueItem?.id === p.id;

                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: "1px solid #27272A",
                            backgroundColor: isSelectedByMe ? "rgba(16, 185, 129, 0.08)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "14px 18px", fontWeight: 700, color: "#3B82F6", verticalAlign: "middle" }}>
                            {p.code}
                          </td>
                          <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                            <div style={{ fontWeight: 700, color: "#FAFAFA", fontSize: "14px", marginBottom: "4px" }}>{p.title}</div>
                            <div style={{ color: "#A1A1AA", fontSize: "12px", lineHeight: 1.5 }}>{p.description}</div>
                          </td>
                          <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                            <span
                              style={{
                                display: "inline-block",
                                backgroundColor: "rgba(139, 92, 246, 0.12)",
                                color: "#8B5CF6",
                                border: "1px solid rgba(139, 92, 246, 0.25)",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: "9999px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.domain}
                            </span>
                          </td>
                          <td style={{ padding: "14px 18px", color: "#10B981", fontWeight: 600, fontSize: "12px", verticalAlign: "middle" }}>
                            {p.techStack}
                          </td>
                          <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ flex: 1, height: "6px", backgroundColor: "#27272A", borderRadius: "9999px", overflow: "hidden" }}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${percent}%`,
                                    backgroundColor: isFull ? "#EF4444" : selected > 0 ? "#F59E0B" : "#10B981",
                                    borderRadius: "9999px",
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#A1A1AA", minWidth: "28px" }}>
                                {selected}/{max}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "center", verticalAlign: "middle" }}>
                            {isSelectedByMe ? (
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#10B981", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle size={15} /> Selected
                              </span>
                            ) : mySelection ? (
                              <span style={{ fontSize: "12px", color: "#52525B" }}>Locked</span>
                            ) : isFull ? (
                              <span style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>Full</span>
                            ) : (
                              <button
                                onClick={() => handleSelectProject(p.id)}
                                disabled={submittingId === p.id}
                                style={{
                                  backgroundColor: "#3B82F6",
                                  color: "#FFFFFF",
                                  border: "none",
                                  padding: "7px 14px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                {submittingId === p.id ? "Selecting..." : "Select Topic"}
                              </button>
                            )}
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
    </div>
  );
}
