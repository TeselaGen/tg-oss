import React from "react";
// import { DataTable } from "@teselagen/ui";
// import CutsiteFilter from "../CutsiteFilter";
// import { Tabs, Tab, Button, InputGroup, Intent } from "@blueprintjs/core";

export default ({ height = "100%" }) => {
  return (
    <div style={{ height, overflow: "auto", padding: 10 }}>
      <div>Add an alignment file (.gb, .fasta, .ab)</div>
    </div>
  );
};
