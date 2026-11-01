import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { PlusCircle, FileText, Download, CheckCircle } from "lucide-react";
import axios from "axios";

export default function AcademicCatalogueManager() {
  const [catalogueItems, setCatalogueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for New Topic
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [domain, setDomain] = useState("Gen-AI");
  const [techStack, setTechStack] = useState("PyTorch, Python");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCatalogue();
  }, []);

  const fetchCatalogue = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/project-catalogue");
      setCatalogueItems(res.data || []);
    } catch (err) {
      console.error("Failed to load project catalogue", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCatalogueItem = async (e) => {
    e.preventDefault();
    if (!code || !title) return;

    setSubmitting(true);
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
      fetchCatalogue();
    } catch (err) {
      console.error("Failed to create catalogue item", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab="academics-catalogue" />

        <main style={{ flex: 1, padding: "28px 36px", width: "100%", boxSizing: "border-box" }}>
          {/* Header Title */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#FAFAFA", margin: 0 }}>
              S5 Catalogue Management
            </h1>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                padding: "9px 18px",
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
              <PlusCircle size={15} /> Publish New Topic
            </button>
          </div>

          {/* S5 PDF Status Card */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#18181B",
              border: "1px solid #27272A",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FileText size={20} color="#3B82F6" />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>
                Active S5 Project Catalogue PDF Document
              </span>
            </div>

            <a
              href="/uploads/S5_Project_Catalogue_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                padding: "8px 16px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Download size={14} /> View Active PDF
            </a>
          </div>

          {/* Catalogue Table */}
          <div style={{ width: "100%", backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "20px", boxSizing: "border-box" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px" }}>
              Published Topics ({catalogueItems.length})
            </h2>

            {loading ? (
              <p style={{ color: "#71717A", fontSize: "13px" }}>Loading catalogue items...</p>
            ) : catalogueItems.length === 0 ? (
              <p style={{ color: "#71717A", fontSize: "13px" }}>No catalogue topics published yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#09090B", borderBottom: "1px solid #27272A" }}>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "80px" }}>Code</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Project Title &amp; Description</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "80px" }}>Dept</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "140px" }}>Domain</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "160px" }}>Tech Stack</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, width: "140px" }}>Student Quota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogueItems.map((item) => {
                      const selected = item.selectedCount || 0;
                      const max = item.maxStudents || 2;
                      const percent = Math.min(100, Math.round((selected / max) * 100));
                      const isFull = selected >= max;

                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid #27272A" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 700, color: "#3B82F6", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>{item.code}</td>
                          <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A", verticalAlign: "middle" }}>
                            <div style={{ fontWeight: 700, color: "#FAFAFA", fontSize: "13px", marginBottom: "3px" }}>{item.title}</div>
                            <div style={{ color: "#A1A1AA", fontSize: "11px", lineHeight: 1.4 }}>{item.description}</div>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#A1A1AA", fontWeight: 600, borderRight: "1px solid #27272A", verticalAlign: "middle" }}>{item.department}</td>
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
                              {item.domain}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#10B981", fontWeight: 600, borderRight: "1px solid #27272A", verticalAlign: "middle" }}>{item.techStack}</td>
                          <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ flex: 1, height: "6px", backgroundColor: "#27272A", borderRadius: "9999px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${percent}%`, backgroundColor: isFull ? "#EF4444" : selected > 0 ? "#F59E0B" : "#10B981", borderRadius: "9999px", transition: "width 0.3s ease" }} />
                              </div>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", minWidth: "24px" }}>{selected}/{max}</span>
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

          {/* Create Modal */}
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
                        {["Full-Stack", "CV", "Gen-AI", "Machine Learning", "IoT & Embedded", "Cybersecurity", "Cloud & DevOps"].map((dm) => (
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
                    <button type="submit" disabled={submitting} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#3B82F6", color: "#FFFFFF", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      {submitting ? "Publishing..." : "Publish Topic"}
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
