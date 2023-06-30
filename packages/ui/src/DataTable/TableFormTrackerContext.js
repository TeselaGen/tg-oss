import React from "react";

const TableFormTrackerContext = React.createContext({
  formNames: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pushFormName: () => {},
  isActive: false
});

export default TableFormTrackerContext;
