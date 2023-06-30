import React from "react";
// import { DataTable } from "@teselagen/ui";
// import CutsiteFilter from "../CutsiteFilter";
// import { Tabs, Tab, Button, InputGroup, Intent } from "@blueprintjs/core";

export default class AlignmentTool extends React.Component {
  // state={selectedTab: "virtualDigest"}
  render() {
    const { height = "100%" } = this.props;
    return (
      <div style={{ height, overflow: "auto", padding: 10 }}>
        <div>Add an alignment file (.gb, .fasta, .ab)</div>
      </div>
    );
  }
}
