import React, { useMemo } from "react";
import { Provider } from "react-redux";

import store from "./store";
// import { createRoot } from "react-dom/client";
import { render } from "react-dom";

import {
  CircularView,
  RowView,
  LinearView,
  DigestTool,
  updateEditor,
  EnzymeViewer
} from "../../src";

import exampleSequenceData from "./exampleData/exampleSequenceData";
import StandaloneDemo from "./StandaloneDemo";
import SimpleCircularOrLinearViewDemo from "./SimpleCircularOrLinearViewDemo";
import StandaloneAlignmentDemo from "./StandaloneAlignmentDemo";
import AlignmentDemo from "./AlignmentDemo";
import EditorDemo from "./EditorDemo";
import VersionHistoryViewDemo from "./VersionHistoryViewDemo";

import "./style.css";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DemoPage } from "@teselagen/shared-demo";

const demos = {
  Editor: {
    noDemoMargin: true,
    demo: EditorDemo
  },
  Standalone: {
    noDemoMargin: true,

    demo: StandaloneDemo
  },
  VersionHistoryView: {
    demo: VersionHistoryViewDemo
  },
  StandaloneAlignment: {
    noDemoMargin: true,

    demo: StandaloneAlignmentDemo
  },
  Alignment: {
    noDemoMargin: true,

    demo: AlignmentDemo
  },
  SimpleCircularOrLinearView: {
    demo: SimpleCircularOrLinearViewDemo
  },
  DigestTool: {
    demo: () => {
      return (
        <WrapSimpleDemo>
          <DigestTool editorName="DemoEditor" />
        </WrapSimpleDemo>
      );
    }
  },
  EnzymeViewer: {
    demo: () => {
      const enzyme = {
        name: "BsaI",
        site: "ggtctc",
        forwardRegex: "g{2}tctc",
        reverseRegex: "gagac{2}",
        topSnipOffset: 7,
        bottomSnipOffset: 11
      };
      return (
        <WrapSimpleDemo>
          <EnzymeViewer
            {...{
              sequence: enzyme.site,
              reverseSnipPosition: enzyme.bottomSnipOffset,
              forwardSnipPosition: enzyme.topSnipOffset
            }}
          />
        </WrapSimpleDemo>
      );
    }
  },
  CircularView: {
    demo: () => {
      return (
        <WrapSimpleDemo>
          <CircularView editorName="DemoEditor" />
        </WrapSimpleDemo>
      );
    }
  },
  RowView: {
    demo: () => {
      return (
        <WrapSimpleDemo>
          <RowView dimensions={{ width: 800 }} editorName="DemoEditor" />
        </WrapSimpleDemo>
      );
    }
  },
  LinearView: {
    demo: () => {
      return (
        <WrapSimpleDemo>
          <LinearView withZoomLinearView={true} editorName="DemoEditor" />
        </WrapSimpleDemo>
      );
    }
  }
};

const Demo = () => {
  return (
    <Provider store={store}>
      <DemoPage moduleName="ove" demos={demos} />
    </Provider>
  );
};

const WrapSimpleDemo = ({ children }) => {
  useMemo(() => {
    updateEditor(store, "DemoEditor", {
      readOnly: false,
      sequenceData: exampleSequenceData
    });
  }, []);
  return children;
};

// createRoot(document.querySelector("#demo")).render(<Demo />);
render(<Demo />, document.querySelector("#demo"));
