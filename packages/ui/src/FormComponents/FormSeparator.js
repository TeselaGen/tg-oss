import React from "react";
import "./style.css";
export const FormSeparator = ({ label = "or" } = {}) => {
  return (
    <div className="form-separator">
      <p>{label}</p>
    </div>
  );
};
