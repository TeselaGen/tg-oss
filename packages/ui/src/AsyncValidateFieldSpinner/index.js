/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */

import React from "react";
import { Spinner } from "@blueprintjs/core";

export default function AsyncValidateFieldSpinner({ validating }) {
  if (validating) {
    return <Spinner size="18" />;
  } else {
    return null;
  }
}
