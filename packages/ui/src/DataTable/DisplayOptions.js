import React, { useState } from "react";
import { map, isEmpty, noop, startCase } from "lodash-es";
import {
  Button,
  Menu,
  MenuItem,
  Classes,
  InputGroup,
  Popover,
  Switch
} from "@blueprintjs/core";
import { getCCDisplayName } from "./utils/tableQueryParamsToHasuraClauses";
import InfoHelper from "../InfoHelper";
import DraggableColumnOptions from "./DraggableColumnOptions";
import { dragNoticeEl } from "./dragNoticeEl";

const DisplayOptions = ({
  compact,
  extraCompact,
  disabled,
  doNotSearchHiddenColumns,
  hideDisplayOptionsIcon,
  resetDefaultVisibility = noop,
  updateColumnVisibility = noop,
  updateTableDisplayDensity,
  moveColumnPersist = noop,
  showForcedHiddenColumns,
  setShowForcedHidden,
  hasOptionForForcedHidden,
  schema
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerms, setSearchTerms] = useState({});

  const changeTableDensity = e => {
    updateTableDisplayDensity(e.target.value);
    setIsOpen(false);
  };

  const toggleForcedHidden = e => setShowForcedHidden(e.target.checked);

  if (hideDisplayOptionsIcon) {
    return null; //don't show antyhing!
  }
  const { fields } = schema;
  const fieldGroups = {};
  const mainFields = [];

  fields.forEach(field => {
    if (field.hideInMenu) return;
    if (!field.fieldGroup) return mainFields.push(field);
    if (!fieldGroups[field.fieldGroup]) fieldGroups[field.fieldGroup] = [];
    fieldGroups[field.fieldGroup].push(field);
  });

  let numVisible = 0;

  // Count number of visible fields
  mainFields.forEach(field => {
    if (!field.isHidden && !field.isForcedHidden) numVisible++;
  });

  // Handle column reordering
  const handleColumnReorder = ({ oldIndex, newIndex }) => {
    moveColumnPersist({ oldIndex, newIndex });
  };

  let fieldGroupMenu;
  if (!isEmpty(fieldGroups)) {
    fieldGroupMenu = map(fieldGroups, (groupFields, groupName) => {
      const searchTerm = searchTerms[groupName] || "";
      const anyVisible = groupFields.some(
        field => !field.isHidden && !field.isForcedHidden
      );
      const anyNotForcedHidden = groupFields.some(
        field => !field.isForcedHidden
      );
      if (!anyNotForcedHidden) return;
      return (
        <MenuItem key={groupName} text={groupName}>
          <InputGroup
            leftIcon="search"
            value={searchTerm}
            onChange={e => {
              setSearchTerms(prev => ({
                ...prev,
                [groupName]: e.target.value
              }));
            }}
          />
          <Button
            className={Classes.MINIMAL}
            text={(anyVisible ? "Hide" : "Show") + " All"}
            style={{ margin: "10px 0" }}
            onClick={() => {
              updateColumnVisibility({
                shouldShow: !anyVisible,
                paths: groupFields.map(field => field.path)
              });
            }}
          />
          <DraggableColumnOptions
            fields={groupFields
              .filter(
                field =>
                  startCase(getCCDisplayName(field)) // We have to use startCase with the camelCase here because the displayName is not always a string
                    .toLowerCase()
                    .indexOf(searchTerm.toLowerCase()) > -1
              )
              .filter(field => !field.isForcedHidden)}
            onVisibilityChange={updateColumnVisibility}
            onReorder={handleColumnReorder}
            numVisible={numVisible}
          />
        </MenuItem>
      );
    });
  }

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      content={
        <Menu>
          <div style={{ padding: 10, paddingLeft: 20, paddingRight: 20 }}>
            <h5 style={{ marginBottom: 10, fontWeight: "bold" }}>
              Display Density:
            </h5>
            <div className={Classes.SELECT + " tg-table-display-density"}>
              <select
                onChange={changeTableDensity}
                value={
                  extraCompact ? "extraCompact" : compact ? "compact" : "normal"
                }
              >
                <option className={Classes.POPOVER_DISMISS} value="normal">
                  Comfortable
                </option>
                {/* tnr: as you can see we're calling what was "compact" Normal now in response to https://github.com/TeselaGen/lims/issues/4713 */}
                <option className={Classes.POPOVER_DISMISS} value="compact">
                  Normal
                </option>
                <option
                  className={Classes.POPOVER_DISMISS}
                  value="extraCompact"
                >
                  Compact
                </option>
              </select>
            </div>
            <h5
              style={{
                fontWeight: "bold",
                marginBottom: 0,
                marginTop: 10,
                display: "flex"
              }}
            >
              Displayed Columns: &nbsp;
              {doNotSearchHiddenColumns && (
                <InfoHelper>
                  Note: Hidden columns will NOT be used when searching the
                  datatable
                </InfoHelper>
              )}
            </h5>
            {dragNoticeEl}

            <div style={{ maxHeight: 360, overflowY: "auto", padding: 2 }}>
              <DraggableColumnOptions
                fields={mainFields.filter(field => !field.isForcedHidden)}
                onVisibilityChange={updateColumnVisibility}
                onReorder={handleColumnReorder}
                numVisible={numVisible}
              />
            </div>
            <div>{fieldGroupMenu}</div>
            {hasOptionForForcedHidden && (
              <div style={{ marginTop: 15 }}>
                <Switch
                  label="Show Empty Columns"
                  checked={showForcedHiddenColumns}
                  onChange={toggleForcedHidden}
                />
              </div>
            )}
            <Button
              marginTop={5}
              onClick={resetDefaultVisibility}
              title="Display Options"
              icon="reset"
              minimal
            >
              Reset Column Visibilites
            </Button>
          </div>
        </Menu>
      }
    >
      <Button
        className="tg-table-display-options"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        minimal
        icon="cog"
      />
    </Popover>
  );
};

export default DisplayOptions;
