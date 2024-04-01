import "../../src/external_styles";
import CollapsibleCard from "./examples/CollapsibleCard";
import MenuBar from "./examples/MenuBar";
import HotkeysDialog from "./examples/HotkeysDialog";
import DataTableExample from "./examples/DataTable";
import WrapDialog from "./examples/WrapDialog";
import Toastr from "./examples/Toastr";
import showConfirmationDialogDemo from "./examples/showConfirmationDialogDemo";
import ResizableDraggableDialogDemo from "./examples/ResizableDraggableDialog";
import CustomIcons from "./examples/CustomIcons";
import EllipsizedTextAutoTooltip from "./examples/EllipsizedTextAutoTooltip";
import SimpleTable from "./examples/SimpleTable";
import TgSelectDemo from "./examples/TgSelectDemo";
import InfoHelper from "./examples/InfoHelper";
import Loading from "./examples/Loading";
import PromptUnsavedChanges from "./examples/PromptUnsavedChanges";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DemoPage } from "@teselagen/shared-demo";
import FillWindowExample from "./examples/FillWindow";

import TimelineDemo from "./examples/TimelineDemo";
import UploaderDemo from "./examples/UploaderDemo";
import IntentTextDemo from "./examples/IntentText";
import ScrollToTopDemo from "./examples/ScrollToTop";

import showAppSpinnerDemo from "./examples/showAppSpinnerDemo";
import EditableCellTable from "./examples/EditableCellTable";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import { FocusStyleManager } from "@blueprintjs/core";
import AdvancedOptionsDemo from "./examples/AdvancedOptionsDemo";
import FormComponents from "./examples/FormComponents";
import UploadCsvWizard from "./examples/UploadCsvWizard";

FocusStyleManager.onlyShowFocusOnTabs();

const demos = {
  DataTable: {
    demo: DataTableExample,
    childLinks: {},
    noLiveCode: true
  },
  "DataTable - EditableCellTable": {
    demo: EditableCellTable
  },
  "DataTable - SimpleTable": {
    demo: SimpleTable
  },
  InfoHelper: {
    demo: InfoHelper,
    props: [
      {
        name: "className",
        description:
          "The CSS class name passed to the Button (if Popover) or Tooltip",
        type: "string"
      },
      {
        name: "isPopover",
        description:
          "If true then tooltip will be shown on click and false will show tooltip on hover",
        type: "boolean"
      },
      {
        name: "children",
        type: "React Element",
        description: "The contents of the Popover or Tooltip"
      },
      {
        name: "content",
        description:
          "A different way to specify the contents of the Popover or Tooltip",
        type: "React Element"
      },
      {
        name: "size",
        description: "Size of the icon",
        type: "number"
      },
      {
        name: "icon",
        type: "string",
        description: "Override the default info icon."
      }
    ]
  },
  TgSelect: {
    demo: TgSelectDemo
  },
  CollapsibleCard: {
    demo: CollapsibleCard,
    props: [
      {
        name: "title",
        description: "Header for the card",
        type: "string | React Element"
      },
      {
        name: "icon",
        description: "BlueprintJS icon to be displayed in card header",
        type: "string"
      },
      {
        name: "icon",
        description: "Custom icon to be displayed in card header",
        type: "React Element"
      },
      {
        name: "openTitleElements",
        type: "React Element",
        description: "Items to be displayed in header when card is open"
      },
      {
        name: "noCard",
        description: "Removes card styling",
        type: "boolean"
      },
      {
        name: "children",
        type: "React Element",
        description: "Content of the card when open"
      }
    ]
  },
  "Hotkeys and HotkeysDialog": {
    demo: HotkeysDialog,
    props: [
      {
        name: "hotkeySets",
        description:
          "Object holding hotkey sets (keys are set names, values are hotkey objects)",
        type: "Object"
      },
      {
        name: "isOpen",
        description: "Flag indicating whether the dialog should be visible",
        type: "boolean"
      },
      {
        name: "onClose",
        description:
          "Callback to run when the user attempts to close the dialog",
        type: "function"
      }
    ]
  },
  MenuBar: {
    demo: MenuBar,
    props: [
      {
        name: "menu",
        description:
          "Menu structure. Array of objects with `text` and `submenu` properties.",
        type: "Array"
      }
    ]
  },
  Loading: {
    demo: Loading,
    props: [
      {
        name: "className",
        description: "The CSS class name of the loading component",
        type: "string"
      },
      {
        name: "style",
        description: "Style properties for the loading component",
        type: "string"
      },
      {
        name: "children",
        type: "React Element",
        description: "Returned when loading is false"
      },
      {
        name: "loading",
        description:
          "Only used when children are passed. If true then children are hidden, false children are rendered",
        type: "string"
      },
      {
        name: "bounce",
        description: "Displays the bouncing lines style loader",
        type: "boolean"
      },
      {
        name: "inDialog",
        type: "boolean",
        description: "Sets a min-height of 200 and sets bounce to true"
      }
    ]
  },
  FormComponents: {
    DemoComponent: FormComponents
  },
  UploadCsvWizard: {
    DemoComponent: UploadCsvWizard
  },
  wrapDialog: {
    demo: WrapDialog
  },
  toastr: {
    demo: Toastr
  },
  showConfirmationDialog: {
    demo: showConfirmationDialogDemo
  },
  showAppSpinner: {
    demo: showAppSpinnerDemo
  },

  // MultiSelectSideBySide:
  //   demo: MultiSelectSideBySideDemo
  // },
  ResizableDraggableDialog: {
    demo: ResizableDraggableDialogDemo
  },
  customIcons: {
    demo: CustomIcons
  },
  "Ellipsized Text Auto-Tooltip": {
    demo: EllipsizedTextAutoTooltip
  },
  FillWindow: {
    demo: FillWindowExample
  },
  Timeline: {
    demo: TimelineDemo
  },
  Uploader: {
    demo: UploaderDemo
  },
  AdvancedOptions: {
    demo: AdvancedOptionsDemo
  },
  IntentText: {
    demo: IntentTextDemo
  },
  ScrollToTop: {
    demo: ScrollToTopDemo
  },
  PromptUnsavedChanges: {
    demo: PromptUnsavedChanges
  }
  // fonticons: {
  //   demo: FontIconsDemo,
  // }
};

const Demo = () => {
  return (
    <Provider store={store}>
      <DemoPage moduleName="ui" demos={demos} showComponentList></DemoPage>
    </Provider>
  );
};

render(<Demo />, document.querySelector("#demo"));
