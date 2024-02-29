/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import MenuBar from "../../../src/MenuBar";
import {
  commandMenuEnhancer,
  genericCommandFactory,
  getCommandHotkeyHandlers,
  getCommandHotkeys,
  HotkeysDialog,
  showCommandContextMenu,
  showContextMenu,
  withHotkeys
} from "../../../src";
import {
  CmdButton,
  CmdCheckbox,
  CmdDiv,
  CmdSwitch
} from "../../../src/utils/commandControls";
import { MenuItem } from "@blueprintjs/core";
import DemoWrapper from "../DemoWrapper";
import "./MenuBarStyle.css";

export default class MenuBarDemo extends React.Component {
  constructor(props) {
    super(props);
    this.showDialog = this.showDialog.bind(this);
    this.hideDialog = this.hideDialog.bind(this);

    // This can be (re)used for hotkey handling, top menu clicks, context menu
    // clicks, etc.
    const commandDefs = {
      cmdSubmenu: {
        preventDefault: true,
        hotkey: "mod+n",
        text: "cmdSubmenu",
        submenu: () => {
          if (window.Cypress) {
            window.Cypress.submenuComputed = true;
          }
          return [
            {
              text: "yay I'm a dynamic submenu",
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              onClick: () => {}
            }
          ];
        },
        handler: () => alert('Triggered "New File"')
      },
      cmdComponent: {
        //cmd's can also pass component
        preventDefault: true,
        hotkey: "mod+n",
        name: "component cmd example",
        component: topLevelProps => instanceProps => {
          //topLevelProps would be props passed to all cmds via the cmd enhancer
          console.info(`topLevelProps:`, topLevelProps);
          return (
            <MenuItem text={instanceProps.name} {...instanceProps}></MenuItem>
          );
        }
      },
      cmdWithTicks: {
        isActive: () => {
          return this.state.isChecked;
          // const ret = Math.round(Math.random())
          // return ret
        },
        // hiddenButSearchableText: "I'm hidden but searchable",
        handler: () => {
          this.setState({ isChecked: !this.state.isChecked });
        }
      },
      newFile: {
        preventDefault: true,
        hotkey: "mod+n",
        handler: () => alert('Triggered "New File"')
      },
      fakeCmd1: {
        handler: () => alert("Triggering Fake Cmd"),
        name: () => {
          return "Fake Cmd";
        }
      },
      fakeCmd2: {
        handler: () => alert("Triggering Fake Cmd 2"),
        name: () => {
          return "Fake Cmd 2";
        }
      },
      openFile: {
        isDisabled: () => {
          return "yep I'm disabled";
        },
        preventDefault: true,
        hotkey: "mod+n",
        handler: () => alert('Triggered "Open File"')
      },
      quit: { hotkey: "mod+n", handler: () => alert('Triggered "Quit"') },
      cut: { hotkey: "mod+n", handler: () => alert('Triggered "Cut"') },
      copy: { hotkey: "mod+n", handler: () => alert('Triggered "Copy"') },
      paste: { hotkey: "mod+n", handler: () => alert('Triggered "Paste"') },
      command1: {
        hotkey: "mod+n",
        handler: () => alert('Triggered "Command One"')
      },
      command2: {
        hotkey: "mod+n",
        handler: () => alert('Triggered "Command Two"')
      },
      showHotkeys: { hotkey: "mod+n", handler: this.showDialog }
    };

    // Create commands without any special logic
    const commands = genericCommandFactory({
      /* eslint-enable no-undef*/
      commandDefs,
      getArguments: () => [],
      handleReturn: () => {}
    });
    this.commands = commands;

    const menu = [
      {
        text: "File",
        submenu: [
          {
            text: "New",
            icon: "add",
            tooltip: "May use tooltips",
            cmd: "newFile"
          },
          {
            text: "Melting Temp of Selection",
            component: props => (
              <MenuItem
                {...props}
                key="zoioink"
                shouldDismissPopover={false}
                onClick={() => {
                  alert("hey");
                }}
                icon={"small-tick"}
              ></MenuItem>
            )
          },
          "cmdComponent",
          {
            text: <span>ReactText {9}</span>,
            onClick: () => {
              window.toastr.success("Fired ReactText!");
            },
            submenu: [
              {
                text: "hello!!",
                onClick: () => {
                  window.toastr.success("hello!");
                }
              },
              "cmdSubmenu"
            ]
          },
          "cmdSubmenu",
          {
            shouldDismissPopover: false,
            text: (
              <span>
                Long React El Text <input /> <span> Text</span>{" "}
                <span>Other Text </span>
              </span>
            ),
            onClick: () => {}
          },
          {
            shouldDismissPopover: false,
            hiddenButSearchableText: "I'm hidden but searchable",
            cmd: "cmdWithTicks"
          },
          {
            shouldDismissPopover: false,
            text: "Don't Dismiss",
            onClick: () => {
              window.toastr.success("This menu's not going away any time soon");
            }
          },
          { text: "Open...", icon: "document", cmd: "openFile" },
          { divider: "" },
          { cmd: "showHotkeys" },
          {
            cmd: "fakeCmd1",
            submenu: [
              "fakeCmd1",
              "fakeCmd1",
              "fakeCmd1",
              { disabled: true, text: "YYY", onClick: () => {} },
              { disabled: true, text: "Y", onClick: () => {} },
              { disabled: true, text: "YYYY", onClick: () => {} },
              { disabled: true, text: "YY", onClick: () => {} },
              { disabled: true, text: "YYYYY", onClick: () => {} }
            ]
          },
          { divider: "" },
          { icon: "log-out", cmd: "quit" } // no text prop here
        ]
      },
      {
        text: "Edit",
        submenu: [
          { icon: "cut", cmd: "cut" }, // no text props here
          {
            icon: "duplicate",
            disabled:
              "Hey I'm a tooltip created by passing a string to disabled:''",
            cmd: "copy"
          },
          { text: "I'm disabled", disabled: true, onClick: () => {} },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { icon: "clipboard", cmd: "paste" },
          { divider: "" },
          {
            text: "Other",
            showInSearchMenu: true, //you can also just define an onClick handler and it will show up as well!
            submenu: [
              // no hotkeys or commands used here
              {
                text: "Not a command"
              },
              {
                text: "Not a command",
                submenu: [
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  },
                  {
                    text: "zoiiiiink"
                  }
                ]
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command"
              },
              {
                text: "Not a command",
                label: "Label",
                icon: "code",
                onClick: () => {
                  console.info("h");
                }
              },
              {
                text: "XXXXX",
                onClick: () => {
                  window.toastr.success("XXXXX");
                }
              },
              {
                text: "Some command 1",
                label: "Label",
                icon: "code",
                cmd: "command1",
                onClick: () => alert("Do something") //this should override the cmd
              },
              {
                text: "Some command 2",
                icon: "numerical",
                cmd: "command2"
                // onClick: () => alert("Do something else")
              }
            ]
          }
        ]
      },
      {
        text: "No Submenu",
        onClick: () => alert("This triggers an action directly")
      },
      {
        text: "Help",
        submenu: [
          { isMenuSearch: true }, //this will only work in a top level item submenu
          "--",
          {
            text: "About",
            hideFromMenuSearch: true,
            onClick: () => {
              window.toastr.success("About clicked");
            }
          },
          {
            text: "App Info",
            hideFromMenuSearch: true,
            onClick: () => {
              window.toastr.success("App Info clicked");
            }
          }
        ]
      }
    ];

    // Sets will normally be different routes/modules/views of an app, but any
    // arbitrary separation criteria will work
    this.hotkeySets = {
      // "File Menu": reduce(commandDefs, (acc, ) => {}, {}),
      "Other Section": {
        something: "alt+shift+s",
        somethingElse: "alt+shift+e"
      }
    };

    // An existing component may be wrapped, or a new one created, as in this case
    this.hotkeyEnabler = withHotkeys(
      getCommandHotkeys(commands), // in this example, equivalent to `hotkeys`,
      getCommandHotkeyHandlers(commands) // in this example, equivalent to `handlers`
    );

    this.menu = menu;
    this.menuEnhancers = [
      commandMenuEnhancer(commands, {
        useTicks: true
      })
    ];
    /* eslint-enable no-undef*/

    this.state = {
      count: 0,
      isChecked: false,
      showDialog: false
    };
  }

  showDialog() {
    this.setState({ showDialog: true });
  }

  hideDialog() {
    this.setState({ showDialog: false });
  }

  render() {
    return (
      <div>
        <DemoWrapper>
          Classic usage as a top menu bar component with dropdown menus and
          help:
          <br />
          <div
            style={{
              // backgroundColor: "#f8f8f8",
              height: "300px",
              border: "1px solid #eee"
            }}
          >
            <MenuBar
              menu={this.menu}
              enhancers={this.menuEnhancers}
              // menuSearchHotkey="alt+/"
            />
          </div>
        </DemoWrapper>
        <DemoWrapper style={{ marginTop: 15 }}>
          Can also be used as a context menu or shown at a specific position on
          button click:
          <br />
          <br />
          <code>config.useTicks</code>
          <code>config.omitIcons</code>
          <code>config.forceIconAlignment</code>
          <br />
          <button
            onClick={e => {
              return showCommandContextMenu(
                /* eslint-enable no-undef*/
                this.menu[0].submenu,
                this.commands,
                {
                  useTicks: true
                },
                e,
                () => {
                  console.info(`closin 2`);
                },
                {}
              );
            }}
          >
            Menu using the imperative showCommandContextMenu
          </button>
        </DemoWrapper>
        <DemoWrapper style={{ marginTop: 15 }}>
          Menu created using the imperative showContextMenu(menu, undefined,
          event)
          <button
            onClick={e => {
              showContextMenu(
                /* eslint-enable no-undef*/
                [
                  { text: "hey" },
                  undefined,
                  {
                    text: "you",
                    submenu: [
                      {
                        text: "yup",
                        willUnmount: () => {
                          console.info("hellllo");
                        },
                        didMount: () => {
                          console.info("yaaa");
                        }
                      }
                    ]
                  }
                ], //the "undefined" will be filtered out
                undefined,
                e,
                () => {
                  console.info("closin");
                }
              );
            }}
          >
            show menu
          </button>
        </DemoWrapper>
        <div style={{ marginTop: 20 }} />
        <DemoWrapper>
          <h3>Examples of using CmdCheckbox, CmdSwitch, CmdDiv, CmdButton</h3>
          <CmdCheckbox cmd={this.commands.fakeCmd1} />
          <CmdSwitch cmd={this.commands.fakeCmd1} />
          <CmdDiv cmd={this.commands.fakeCmd2} />
          <CmdButton cmd={this.commands.fakeCmd2} />
          <br />
          <code>{"<CmdButton cmd={this.commands.showHotkeys} />"}</code>
          <CmdButton cmd={this.commands.showHotkeys} />
          <this.hotkeyEnabler />
          <HotkeysDialog
            hotkeySets={this.hotkeySets}
            isOpen={this.state.showDialog}
            onClose={this.hideDialog}
          />
          <br />
          <p>
            <div className={"noCodeNewline"}>
              The <code>menu</code> prop must be an array of objects with{" "}
              <code>text</code> and
              <code>submenu</code> properties. Each <code>submenu</code> is
              itself an array of item descriptor objects or{" "}
              <code>MenuItem</code> elements. Item descriptors may contain
              several properties, namely{" "}
              <code>
                text icon label hotkey onClick tooltip key divider navTo
                hiddenButSearchableText
              </code>
              <code> href target</code> and <code>submenu</code>.<br></br>
              <br></br>
              You may also include custom fields and have custom menu enhancers
              derive other props from them. For example, the <code>
                cmd
              </code>{" "}
              property can be used in combination with the{" "}
              <code>commandMenuEnhancer</code> to link menu items with commands,
              wiring not only the handler, but also the hotkeys, icon, disabled
              and active states, name, etc. Check the{" "}
              <code>DynamicMenuItem</code> component and
              <code>commandMenuEnhancer()</code> util for more details.
            </div>
          </p>
        </DemoWrapper>
      </div>
    );
  }
}
