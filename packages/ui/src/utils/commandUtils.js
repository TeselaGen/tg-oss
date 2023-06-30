import { startCase } from "lodash";

// Generic factory function to create command objects.
// TODO add documentation
export function genericCommandFactory(config) {
  const out = {};
  // eslint-disable-next-line no-unused-vars
  for (const cmdId in config.commandDefs) {
    const def = config.commandDefs[cmdId];
    const command = { id: cmdId };
    command.execute = (...execArgs) => {
      config.handleReturn(
        cmdId,
        def.handler &&
          def.handler.apply(command, config.getArguments(cmdId, execArgs))
      );
    };

    const properties = [
      "icon",
      "name",
      "component",
      "shortName",
      "description",
      "hotkey",
      "hotkeyProps",
      "isDisabled",
      "submenu",
      "isActive",
      "isHidden",
      "tooltip",
      "inactiveIcon",
      "inactiveName"
    ];

    properties.forEach(prop => {
      if (def[prop] !== undefined) {
        if (typeof def[prop] === "function") {
          Object.defineProperty(command, prop, {
            get: () => {
              return def[prop].apply(command, config.getArguments(cmdId, []));
            }
          });
        } else {
          command[prop] = def[prop];
        }
      }
    });

    // If no name was specified in the definition, let's try to give some
    // auto-generated names
    if (!def.name) {
      command.name = startCase(cmdId);
      if (def.toggle && cmdId.startsWith("toggle")) {
        command.name = startCase(cmdId.replace("toggle", def.toggle[0] || ""));
        command.inactiveName = startCase(
          cmdId.replace("toggle", def.toggle[1] || "")
        );
        command.shortName = startCase(cmdId.replace("toggle", ""));
      }
    }

    out[cmdId] = command;
  }

  return out;
}

// Extract hotkey props from the given commands or command defs, returning
// a mapping of command ids to hotkey prop objects
export function getCommandHotkeys(commandsOrDefs) {
  const hotkeyDefs = {};
  Object.keys(commandsOrDefs).forEach(cmdId => {
    if (commandsOrDefs[cmdId].hotkey) {
      hotkeyDefs[cmdId] = {
        combo: commandsOrDefs[cmdId].hotkey,
        label: commandsOrDefs[cmdId].name || startCase(cmdId),
        ...commandsOrDefs[cmdId].hotkeyProps
      };
    }
  });

  return hotkeyDefs;
}

// Extract handler functions from the given commands, returning a mapping of
// command ids to handlers (directly - no checks added).
export function getCommandHandlers(commands) {
  const handlers = {};
  Object.keys(commands).forEach(cmdId => {
    handlers[cmdId] = commands[cmdId].execute;
  });

  return handlers;
}

// Get hotkey handler functions for the given commands, returning a mapping of
// command ids to hotkey handlers.
export function getCommandHotkeyHandlers(commands) {
  const handlers = {};
  Object.keys(commands).forEach(cmdId => {
    if (commands[cmdId].hotkey) {
      handlers[cmdId] = event => {
        if (!commands[cmdId].isDisabled && !commands[cmdId].isHidden) {
          commands[cmdId].execute({ event, viaHotkey: true });
        }
      };
    }
  });

  return handlers;
}
