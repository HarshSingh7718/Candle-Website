import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * BackButton - Reusable back navigation button.
 * Uses window.history to navigate back if history exists, or falls back to home ('/').
 */
const BackButton = ({ label = "Back", className = "", fallbackPath = "/" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if browser history has past pages in current session
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-primary transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/40 rounded px-2 py-1 ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft
        size={16}
        className="transition-transform group-hover:-translate-x-1"
      />
      {label && <span>{label}</span>}
    </button>
  );
};

export default BackButton;
