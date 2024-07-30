import React from "react";

const OptionsSection = ({ children, title = "Options", noTitle = false }) => (
  <div className="options-section">
    {!noTitle && <h6 style={{ fontWeight: "bold" }}>{title}</h6>}
    {children}
  </div>
);

export default OptionsSection;
