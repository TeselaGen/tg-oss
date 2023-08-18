import React from "react";
import { Editor, updateEditor } from "@teselagen/ove";
import store from "./store";

import "./App.css";

function App() {
  React.useEffect(() => {
    updateEditor(store, "DemoEditor", {
      sequenceData: {
        circular: true,
        sequence:
          "gtagagagagagtgagcccgacccccgtagagagagagtgagcccgacccccgtagagagagagtgagcccgacccccgtagagagagagtgagcccgaccccc",
        features: [
          {
            id: "2oi452",
            name: "I'm a feature :)",
            start: 10,
            end: 20
          }
        ]
      }
    });
  });
  const editorProps = {
    editorName: "DemoEditor",
    isFullscreen: true,
    showMenuBar: true
  };

  return (
    <div>
      <Editor {...editorProps} />
    </div>
  );
}

export default App;
