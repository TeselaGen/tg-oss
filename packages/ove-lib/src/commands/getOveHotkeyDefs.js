import getCommands from "./index";
import { getCommandHotkeys } from "@teselagen/ui";

export default function getOveHotkeyDefs({ store, editorName }) {
  const commands = getCommands({
    props: {
      store,
      editorName
    }
  });
  return getCommandHotkeys(commands);
}
