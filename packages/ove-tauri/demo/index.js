import { render } from "react-dom";
import { Editor, updateEditor } from "@teselagen/ove";
import shortid from "shortid";

// eslint-disable-next-line @nx/enforce-module-boundaries
import exampleSequenceData from "../../ove/demo/src/exampleData/exampleSequenceData";
import store from "./store";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import "./appStyle.css";
import { Button, Tooltip } from "@blueprintjs/core";

import { open } from "@tauri-apps/api/dialog";
import { WebviewWindow, appWindow } from "@tauri-apps/api/window";

// import { LogicalSize } from "@tauri-apps/api/window";
// await appWindow.setSize(new LogicalSize(1200, 1200));

const editorName = appWindow.label;
const Demo = () => {
  // componentDidMount
  const [isDarkMode, changeDarkMode] = useState(
    window.localStorage.getItem("isDarkMode") === "true"
  );
  useEffect(() => {
    if (window.localStorage.getItem("isDarkMode") === "true") {
      document.body.classList.add("bp3-dark");
    }
    updateEditor(store, editorName, {
      readOnly: false,
      sequenceData: exampleSequenceData
    });
  }, []);

  return (
    <Provider store={store}>
      <Editor
        onOpen={async () => {
          // // Open a selection dialog for image files
          let selected = await open({
            multiple: true,
            filters: [
              {
                name: "Sequence",
                extensions: ["gb", "fasta"]
              }
            ]
          });
          if (Array.isArray(selected)) {
            // user selected multiple files
          } else if (selected === null) {
            // user cancelled the selection
            return;
          } else {
            selected = [selected];
            // user selected a single file
          }
          selected.forEach(async () => {
            // console.log(`f:`, f);
            // loading embedded asset:
            const webview = new WebviewWindow(shortid(), {
              url: "index.html"
            });

            webview.once("tauri://created", function () {
              // webview window successfully created
            });
            webview.once("tauri://error", function (e) {
              console.error(`e:`, e);
              // an error happened creating the webview window
            });

            // emit an event to the backend
            await webview.emit("some event", "data");
            // listen to an event from the backend
            // const unlisten = await webview.listen("event name", e => {

            // });
            // unlisten();
          });
        }}
        onNew={async () => {
          // loading embedded asset:
          const webview = new WebviewWindow("theUniqueLabel", {
            url: "index.html"
          });

          webview.once("tauri://created", function () {
            // webview window successfully created
          });
          webview.once("tauri://error", function (e) {
            console.error(`e:`, e);
            // an error happened creating the webview window
          });

          // emit an event to the backend
          await webview.emit("some event", "data");
          // listen to an event from the backend
          // const unlisten = await webview.listen("event name", e => {});
          // unlisten();

          // // Open a selection dialog for image files
          // const selected = await open({
          //   multiple: true,
          //   filters: [
          //     {
          //       name: "Image",
          //       extensions: ["png", "jpeg"]
          //     }
          //   ]
          // });
          // if (Array.isArray(selected)) {
          //   // user selected multiple files
          // } else if (selected === null) {
          //   // user cancelled the selection
          // } else {
          //   // user selected a single file
          // }
        }}
        additionalTopRightToolbarButtons={
          <Tooltip
            content={isDarkMode ? "Light Theme" : "Dark Theme"}
            key="theme"
          >
            <Button
              data-test="tg-toggle-dark-mode"
              icon={isDarkMode ? "flash" : "moon"}
              intent={isDarkMode ? "warning" : undefined}
              minimal
              onClick={() => {
                if (document.body.classList.contains("bp3-dark")) {
                  window.localStorage.setItem("isDarkMode", "false");
                  document.body.classList.remove("bp3-dark");
                } else {
                  window.localStorage.setItem("isDarkMode", "true");

                  document.body.classList.add("bp3-dark");
                }
                changeDarkMode(!isDarkMode);
              }}
            />
          </Tooltip>
        }
        showMenuBar
        editorName={editorName}
      ></Editor>
      ;
    </Provider>
  );
};

render(<Demo />, document.querySelector("#demo"));
