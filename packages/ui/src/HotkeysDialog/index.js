import React from "react";
import {
  Dialog,
  Tab,
  Tabs,
  KeyCombo,
  Classes /*, Tooltip*/
} from "@blueprintjs/core";
// import { startCase } from "lodash";
import classNames from "classnames";
import {
  getHotkeyProps /*, hotkeysById, comboToLabel*/
} from "../utils/hotkeyUtils";

import "./style.css";

export default function HotkeysDialog(props) {
  if (!props.hotkeySets) {
    console.error("Missing hotkeySets in HotkeysDialog");
    return null;
  }
  const sections = Object.keys(props.hotkeySets);
  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={props.dialogTitle || "Keyboard Shortcuts"}
    >
      <Tabs className="tg-hotkeys-dialog">
        {sections.map(name => (
          <Tab
            key={name}
            id={name}
            title={sections.length === 1 ? undefined : name}
            panel={
              <div className="tg-table-wrapper">
                <table
                  className={classNames(
                    Classes.HTML_TABLE,
                    Classes.HTML_TABLE_STRIPED,
                    Classes.HTML_TABLE_BORDERED
                  )}
                >
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Shortcut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(props.hotkeySets[name]).map(id => {
                      const def = getHotkeyProps(
                        props.hotkeySets[name][id],
                        id
                      );
                      return (
                        <tr key={id}>
                          <td>{def.label}</td>
                          <td>
                            <KeyCombo combo={def.combo} />
                            {/* <Tooltip
                              content={comboToLabel(def.combo, false)}
                            >
                              {comboToLabel(def.combo)}
                            </Tooltip> */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            }
          />
        ))}
      </Tabs>
    </Dialog>
  );
}
