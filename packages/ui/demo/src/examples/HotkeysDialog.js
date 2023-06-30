import { KeyCombo } from '@blueprintjs/core';
import React from 'react'
import { hotkeysById, HotkeysDialog, withHotkeys } from '../../../src';

export default class HotkeysDialogDemo extends React.Component {
  constructor(props) {
    super(props);
    this.showDialog = this.showDialog.bind(this);
    this.hideDialog = this.hideDialog.bind(this);

    // Hotkey definitions: these can be (re)used for hotkey processing,
    // decorating bar or context menus, and populating the hotkeys dialog.
    // Where labels are not specified, the startCased id is used.
    // See blueprintjs hotkeys documentation to learn about all props.
    const hotkeys1 = {
      // string shortcut syntax eq. to { combo: 'alt+shift+s' }
      something: 'alt+shift+s',

      // array shortcut syntax, eq. to { combo: 'alt+shift+e', label: 'Some Other Thing' }
      somethingElse: ['alt+shift+e', 'Some Other Thing'],

      // array shortcut syntax, eq. to { combo: 'alt+shift+a', stopPropagation: true }
      anotherOne: ['alt+shift+a', '', { stopPropagation: true }],

      // full object syntax
      showHotkeys: { combo: 'mod+h', preventDefault: true },
    };

    const hotkeys2 = {
      command1: 'shift+1',
      command2: 'shift+2',
      command3: 'shift+3',
    };


    // This can be (re)used for hotkey handling, top menu clicks, context menu
    // clicks, etc.
    const handlers = {
      something: () => alert('Triggered "Something"'),
      somethingElse: () => alert('Triggered "Something Else"'),
      anotherOne: () => alert('Triggered "Another One"'),
      command1: () => alert('Triggered "Command One"'),
      command2: () => alert('Triggered "Command Two"'),
      command3: () => alert('Triggered "Command Three"'),
      showHotkeys: this.showDialog
    };

    // An existing component may be wrapped, or a new one created, as in this
    // case. If using non-global hotkeys, an existing component must be wrapped,
    // so it can get focus.
    this.hotkeyEnabler = withHotkeys({ ...hotkeys1, ...hotkeys2}, handlers);

    // HotkeysDialog
    // Sets will normally be different routes/modules/views of an app, but any
    // arbitrary separation criteria will work
    this.hotkeySets = {
      'Some Section': hotkeys1,
      'Another Section': hotkeys2
    };

    this.state = {
      showDialog: false
    };

    // Safe way to retrieve hotkey combos (e.g. for display purposes)
    this.dialogHotkeyCombo = hotkeysById(hotkeys1, 'raw')('showHotkeys');
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
        <div style={{
          // backgroundColor: '#f8f8f8',
          height: '300px',
          border: '1px solid #eee',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h2 style={{ fontWeight: 300, textAlign: 'center' }}>
            To view available hotkeys, press<br />
            <KeyCombo combo={this.dialogHotkeyCombo} />
          </h2>
        </div>
        <this.hotkeyEnabler />
        <HotkeysDialog
          hotkeySets={this.hotkeySets}
          isOpen={this.state.showDialog}
          onClose={this.hideDialog}
        />
        <br/>
        <p>


        </p>
      </div>
    );
  }
}


