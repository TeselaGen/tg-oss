import React from "react";

function OptionsSection({ children, title = "Options", noTitle = false }) {
  return (
    <div className="options-section">
      {!noTitle && <h6 style={{ fontWeight: "bold" }}>{title}</h6>}
      {children}
    </div>
  );
}

export default OptionsSection;
