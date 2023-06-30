/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import React from "react";
import { ProgressBar } from "@blueprintjs/core";

export default (message, value, key, opts) => {
  return window.toastr.default(
    <div>
      <div style={{ marginBottom: 10 }}>{message}</div>
      <ProgressBar
        intent={value >= 1 ? "success" : "primary"}
        animate={value < 1 || !value}
        stripes={value < 1 || !value}
        value={value}
      />
    </div>,
    {
      timeout: value >= 1 ? 3000 : 100000,
      key,
      ...opts
    }
  );
};
