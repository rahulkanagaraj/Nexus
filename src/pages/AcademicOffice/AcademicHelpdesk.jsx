import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { MessageSquare, Send, CheckCircle, Clock, Filter, Search, User } from "lucide-react";
import axios from "axios";

export default function AcademicHelpdesk() {
  const [queries, setQueries] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("OPEN");
  const [loading, setLoading] = useState(true);

  // Reply Modal State
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, [selectedStatus]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/academic-queries?status=${selectedStatus}`);
      setQueries(res.data || []);
    } catch (err) {
      console.error("Failed to load academic queries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedQuery || !replyMessage) return;

    setReplying(true);
    try {
      await axios.post(`/api/academic-queries/${selectedQuery.id}/reply`, {
        replyMessage,
      });

      setSelectedQuery(null);
      setReplyMessage("");
      fetchQueries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send resolution.");
    } finally {
      setReplying(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", fontFamily: "'Poppins', sans-serif", color: "#FAFAFA" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar activeTab="academics-helpdesk" />

        <main style={{ flex: 1, padding: "28px 36px", width: "100%", boxSizing: "border-box" }}>
          {/* Header Title */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#FAFAFA", margin: 0 }}>
              Academic Helpdesk
            </h1>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {["OPEN", "RESOLVED", "ALL"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  border: selectedStatus === status ? "1px solid #3B82F6" : "1px solid #27272A",
                  backgroundColor: selectedStatus === status ? "#3B82F6" : "#18181B",
                  color: selectedStatus === status ? "#FFFFFF" : "#A1A1AA",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {status === "OPEN" ? "Pending Queries" : status === "RESOLVED" ? "Resolved Queries" : "All History"}
              </button>
            ))}
          </div>

          {/* Queries Table with Compact Gridlines */}
          <div style={{ width: "100%", backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", padding: "20px", boxSizing: "border-box" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FAFAFA", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={16} color="#3B82F6" /> Queries List ({queries.length})
            </h2>

            {loading ? (
              <p style={{ color: "#71717A", fontSize: "13px" }}>Loading queries...</p>
            ) : queries.length === 0 ? (
              <p style={{ color: "#71717A", fontSize: "13px" }}>No queries found in this status queue.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#09090B", borderBottom: "1px solid #27272A" }}>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "140px" }}>Sender</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "80px" }}>Role</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "130px" }}>Category</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A" }}>Subject &amp; Message</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, borderRight: "1px solid #27272A", width: "100px" }}>Status</th>
                      <th style={{ padding: "12px 16px", color: "#71717A", fontWeight: 700, textAlign: "center", width: "140px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.map((q) => (
                      <tr key={q.id} style={{ borderBottom: "1px solid #27272A" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#FAFAFA", borderRight: "1px solid #27272A" }}>
                          {q.sender?.fullName}
                        </td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A" }}>
                          <span style={{ backgroundColor: q.userRole === "STUDENT" ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)", color: q.userRole === "STUDENT" ? "#3B82F6" : "#10B981", border: `1px solid ${q.userRole === "STUDENT" ? "rgba(59, 130, 246, 0.3)" : "rgba(16, 185, 129, 0.3)"}`, fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
                            {q.userRole}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#A1A1AA", fontWeight: 600, borderRight: "1px solid #27272A" }}>
                          {q.category}
                        </td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A" }}>
                          <div style={{ fontWeight: 700, color: "#3B82F6", fontSize: "13px", marginBottom: "3px" }}>{q.subject}</div>
                          <div style={{ color: "#A1A1AA", fontSize: "12px", lineHeight: 1.4 }}>{q.message}</div>
                          {q.replyMessage && (
                            <div style={{ marginTop: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "8px 12px", borderRadius: "6px", color: "#10B981", fontSize: "11px" }}>
                              <strong>Academic Resolution Sent:</strong> {q.replyMessage}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid #27272A" }}>
                          <span style={{ backgroundColor: q.status === "RESOLVED" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: q.status === "RESOLVED" ? "#10B981" : "#F59E0B", border: `1px solid ${q.status === "RESOLVED" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`, fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
                            {q.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          {q.status === "OPEN" ? (
                            <button
                              onClick={() => setSelectedQuery(q)}
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
                              <Send size={12} /> Respond &amp; Notify
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reply Modal */}
          {selectedQuery && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div style={{ backgroundColor: "#18181B", borderRadius: "14px", border: "1px solid #27272A", width: "100%", maxWidth: "520px", padding: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FAFAFA", marginBottom: "4px" }}>
                  Respond &amp; Notify User
                </h3>
                <p style={{ fontSize: "12px", color: "#71717A", marginBottom: "16px" }}>
                  Replying to <strong>{selectedQuery.sender?.fullName}</strong> regarding <em>'{selectedQuery.subject}'</em>.
                </p>

                <form onSubmit={handleSendReply}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "4px" }}>
                      Academic Office Resolution Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your resolution, guidance, or status update here. This will trigger an instant notification to the user..."
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #27272A", backgroundColor: "#09090B", color: "#FAFAFA", fontSize: "12px", boxSizing: "border-box", outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button type="button" onClick={() => setSelectedQuery(null)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #3F3F46", backgroundColor: "transparent", color: "#FAFAFA", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={replying} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#3B82F6", color: "#FFFFFF", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      {replying ? "Sending..." : "Send Resolution & Notify User"}
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
