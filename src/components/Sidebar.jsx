import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_STYLE = {
  width: "44px",
  height: "44px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  transition: "background 0.15s ease, color 0.15s ease",
};

function SidebarItem({ to, iconClass, title }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <NavLink
        to={to}
        title={title}
        style={({ isActive }) => ({
          ...NAV_STYLE,
          color: isActive ? "#FAFAFA" : "#71717A",
          backgroundColor: isActive ? "#3B82F6" : "transparent",
          border: isActive ? "1px solid #3B82F6" : "1px solid transparent",
        })}
      >
        <i className={iconClass} style={{ fontSize: "1.2rem" }}></i>
      </NavLink>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleExit = () => {
    logout();
    navigate("/login");
  };

  const isStudent   = user.role === "STUDENT";
  const isFaculty   = user.role === "FACULTY";
  const isIpCell    = user.role === "IP_CELL";
  const isAcademics = user.role === "ACADEMIC_OFFICE";
  const isAdmin     = user.role === "ADMIN";

  return (
    <aside
      style={{
        width: "68px",
        minWidth: "68px",
        maxWidth: "68px",
        flexShrink: 0,
        position: "sticky",
        top: "64px",
        height: "calc(100vh - 64px)",
        maxHeight: "calc(100vh - 64px)",
        backgroundColor: "#09090B",
        borderRight: "1px solid #27272A",
        padding: "20px 0 16px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        zIndex: 90,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Nav items - Vertically Centered */}
      <div
        className="flex-1 flex flex-col justify-center items-center w-full"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          width: "100%",
          flex: 1,
        }}
      >
        {isAcademics && (
          <>
            <SidebarItem to="/academics/catalogue"        iconClass="bi bi-journal-plus"    title="S5 Catalogue Management" />
            <SidebarItem to="/academics/mentor-allocation" iconClass="bi bi-person-check"   title="Smart Guide Allocation" />
            <SidebarItem to="/academics/helpdesk"          iconClass="bi bi-chat-left-text" title="Academic Helpdesk Hub" />
          </>
        )}

        {isStudent && (
          <>
            <SidebarItem to="/student/catalogue"    iconClass="bi bi-journal-bookmark" title="S5 Project Catalogue Selection" />
            <SidebarItem to="/student/mini-project" iconClass="bi bi-kanban"           title="Semester Mini-Project Tracker" />
            <SidebarItem to="/student/dashboard"    iconClass="bi bi-journal-text"     title="Research Papers & Proposals" />
            <SidebarItem to="/ip-tracker"           iconClass="bi bi-shield-check"     title="IP Tracker" />
          </>
        )}

        {isFaculty && (
          <>
            <SidebarItem to="/faculty/weekly-review" iconClass="bi bi-calendar-check"  title="Weekly Log & Deliverables Review" />
            <SidebarItem to="/faculty/dashboard"     iconClass="bi bi-check2-square"   title="Research Paper Reviews" />
            <SidebarItem to="/ip-tracker"            iconClass="bi bi-shield-check"    title="IP Tracker" />
          </>
        )}

        {isIpCell && (
          <>
            <SidebarItem to="/ip-tracker"          iconClass="bi bi-shield-check"     title="IP Filing Tracker" />
            <SidebarItem to="/ip-cell/examination" iconClass="bi bi-clipboard2-check" title="Expedited IP Examination" />
          </>
        )}

        {isAdmin && (
          <>
            <SidebarItem to="/academics/catalogue"         iconClass="bi bi-journal-plus"    title="S5 Catalogue Management" />
            <SidebarItem to="/academics/mentor-allocation" iconClass="bi bi-person-check"    title="Smart Guide Allocation" />
            <SidebarItem to="/academics/helpdesk"          iconClass="bi bi-chat-left-text"  title="Academic Helpdesk Hub" />
            <SidebarItem to="/ip-tracker"                  iconClass="bi bi-shield-check"    title="IP Tracker" />
            <SidebarItem to="/ip-cell/examination"         iconClass="bi bi-clipboard2-check" title="Expedited IP Examination" />
          </>
        )}
      </div>

      {/* Sign Out */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          paddingTop: "16px",
          borderTop: "1px solid #27272A",
        }}
      >
        <button
          onClick={handleExit}
          title="Sign Out"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            border: "1px solid #27272A",
            backgroundColor: "transparent",
            color: "#71717A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color = "#EF4444";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#71717A";
            e.currentTarget.style.borderColor = "#27272A";
          }}
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: "1.2rem" }}></i>
        </button>
      </div>
    </aside>
  );
}
