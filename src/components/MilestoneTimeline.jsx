import React, { useState } from "react";
import { CheckCircle2, Clock, FileText, AlertCircle, Award, ShieldCheck } from "lucide-react";

export default function MilestoneTimeline({ status }) {
  const steps = [
    { id: "SUBMITTED",   label: "Submitted",     icon: FileText },
    { id: "UNDER_REVIEW",label: "In Evaluation", icon: Clock },
    { id: "APPROVED",    label: "Approved",       icon: CheckCircle2 },
    { id: "READY_FOR_IP",label: "Patent Eligible",icon: ShieldCheck },
    { id: "IP_FILED",    label: "IP Filed",       icon: Award },
  ];

  const getStepState = (stepId) => {
    if (status === "REJECTED") {
      if (stepId === "SUBMITTED") return "completed";
      if (stepId === "UNDER_REVIEW") return "rejected";
      return "pending";
    }
    if (status === "REVISION_REQUESTED") {
      if (stepId === "SUBMITTED") return "completed";
      if (stepId === "UNDER_REVIEW") return "warning";
      return "pending";
    }
    const order = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "READY_FOR_IP", "IP_FILED"];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepId);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const stateStyles = {
    completed: { bg: "#059669", border: "#059669", icon: "#FFFFFF", label: "#FAFAFA" },
    active:    { bg: "#3B82F6", border: "#3B82F6", icon: "#FFFFFF", label: "#FAFAFA" },
    warning:   { bg: "#F59E0B", border: "#F59E0B", icon: "#FFFFFF", label: "#FAFAFA" },
    rejected:  { bg: "#EF4444", border: "#EF4444", icon: "#FFFFFF", label: "#FAFAFA" },
    pending:   { bg: "#27272A", border: "#3F3F46", icon: "#52525B", label: "#52525B" },
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
        {steps.map((step, idx) => {
          const state = getStepState(step.id);
          const s = stateStyles[state];
          const Icon = step.icon;
          const isLastCompleted = state === "completed" && getStepState(steps[idx + 1]?.id) !== "pending";

          return (
            <React.Fragment key={step.id}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                {/* Icon circle */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: s.bg,
                    border: `2px solid ${s.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={16} color={s.icon} />
                </div>
                {/* Label */}
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: state === "pending" ? 400 : 600,
                    color: s.label,
                    marginTop: "6px",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    backgroundColor: state === "completed" ? "#059669" : "#3F3F46",
                    marginTop: "17px",
                    zIndex: 1,
                    transition: "background-color 0.2s ease",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
