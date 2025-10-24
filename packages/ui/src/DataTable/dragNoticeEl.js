import { Classes, Icon } from "@blueprintjs/core";
import React from "react";

export const dragNoticeEl = (
  <div
    className={Classes.TEXT_MUTED}
    style={{
      padding: 10,
      fontSize: "12px"
    }}
  >
    <Icon icon="info-sign" size={12} /> Drag columns to reorder them
  </div>
);
