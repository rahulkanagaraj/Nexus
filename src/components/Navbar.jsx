import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import SubmitQueryModal from "./SubmitQueryModal";

const ROLE_COLORS = {
  FACULTY: "#059669",
  IP_CELL: "#8B5CF6",
  ACADEMIC_OFFICE: "#3B82F6",
  ADMIN: "#F59E0B",
  STUDENT: "#3B82F6",
};

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: "64px",
        backgroundColor: "#09090B",
        borderBottom: "1px solid #27272A",
        fontFamily: "'Poppins', sans-serif",
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          boxSizing: "border-box",
        }}
      >
        {/* Brand */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Layers size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#FAFAFA", letterSpacing: "-0.5px" }}>
                Nexus<span style={{ color: "#8B5CF6" }}>-AI</span>
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 500, color: "#71717A" }}>
              Institutional Research &amp; IP Management
            </p>
          </div>
        </div>

        {/* Right: Query modal, Notifications, User */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (user.role === "STUDENT" || user.role === "FACULTY") && (
            <SubmitQueryModal user={user} />
          )}
          {user && <NotificationDropdown user={user} />}

          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 12px",
                borderRadius: "10px",
                backgroundColor: "#18181B",
                border: "1px solid #27272A",
              }}
            >
              {/* Text-only avatar initial */}
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  backgroundColor: ROLE_COLORS[user.role] || "#3B82F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "#71717A", lineHeight: 1 }}>
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
