import React from "react";
import "./style.css";
export const FormSeparator = ({ label = "or" } = {}) => {
  return (
    <div className="form-separator">
      <p style={{ opacity: 0.8 }}>{label}</p>
    </div>
  );
};
