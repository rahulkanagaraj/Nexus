import React, { useState } from "react";
import { X, Upload, FileText, CheckCircle } from "lucide-react";
import axios from "axios";

export default function NewProjectModal({ isOpen, onClose, onProjectCreated, studentId, studentDepartment }) {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("Artificial Intelligence & Robotics");
  const [abstractText, setAbstractText] = useState("");
  const [facultyId, setFacultyId] = useState("3");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstractText", abstractText);
      formData.append("domain", domain);
      formData.append("department", studentDepartment || "Computer Science & Engineering");
      formData.append("studentId", studentId || 1);
      formData.append("facultyId", facultyId);
      if (file) {
        formData.append("proposalFile", file);
      }

      await axios.post("/api/projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onProjectCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit research project proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#18181B",
          borderRadius: "14px",
          border: "1px solid #27272A",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            backgroundColor: "#09090B",
            borderBottom: "1px solid #27272A",
            color: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={18} color="#3B82F6" />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#FAFAFA" }}>Initiate New Campus Research Project</h3>
          </div>
          <button
            onClick={onClose}
            style={{ backgroundColor: "transparent", border: "none", color: "#71717A", cursor: "pointer", display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", padding: "12px 24px", fontSize: "12px", borderBottom: "1px solid rgba(239, 68, 68, 0.25)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                Research Domain / Field
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #27272A",
                  backgroundColor: "#09090B",
                  color: "#FAFAFA",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              >
                <option value="Artificial Intelligence & Robotics">Artificial Intelligence &amp; Robotics</option>
                <option value="Cybersecurity & Cryptography">Cybersecurity &amp; Cryptography</option>
                <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                <option value="Biomedical & Healthcare Tech">Biomedical &amp; Healthcare Tech</option>
                <option value="Renewable Energy & Embedded Systems">Renewable Energy &amp; Embedded Systems</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                Assign Faculty Reviewer / Mentor
              </label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #27272A",
                  backgroundColor: "#09090B",
                  color: "#FAFAFA",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              >
                <option value="3">Dr. Rajesh Kumar (CSE Dept)</option>
                <option value="4">Dr. Sunita Rao (AI &amp; DS Dept)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
              Abstract / Project Objectives *
            </label>
            <textarea
              required
              rows={4}
              value={abstractText}
              onChange={(e) => setAbstractText(e.target.value)}
              placeholder="Provide a detailed summary of your research methodology, problem statement, and expected novel outcomes..."
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
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
              Upload Proposal Document (PDF Abstract)
            </label>
            <div
              style={{
                border: "2px dashed #27272A",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                backgroundColor: "#09090B",
                cursor: "pointer",
              }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }}
                id="proposal-file-input"
              />
              <label htmlFor="proposal-file-input" style={{ cursor: "pointer" }}>
                <Upload size={22} color="#71717A" style={{ marginBottom: "6px" }} />
                <div style={{ fontSize: "13px", color: "#FAFAFA", fontWeight: 600 }}>
                  {file ? file.name : "Click to choose PDF document"}
                </div>
                <span style={{ fontSize: "11px", color: "#71717A" }}>PDF, DOCX up to 10MB</span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: "1px solid #3F3F46",
                backgroundColor: "transparent",
                color: "#FAFAFA",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? '✨ Analyzing PDF with AI...' : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
