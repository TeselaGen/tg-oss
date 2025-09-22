import React from "react";
import { ReactTableDefaults } from "@teselagen-biotech/react-table";
const { LoadingComponent } = ReactTableDefaults;

function DisabledLoadingComponent({ disabled, loading, loadingText }) {
  return (
    <LoadingComponent
      className={disabled ? "disabled" : ""}
      loading={loading}
      loadingText={disabled ? "" : loadingText}
    />
  );
}

export default DisabledLoadingComponent;
