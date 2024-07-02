import React, { useState } from "react";
import classNames from "classnames";
import { Icon, Popover } from "@blueprintjs/core";

export const ColumnFilterMenu = ({
  addFilters,
  compact,
  currentFilter,
  currentParams,
  dataType,
  extraCompact,
  filterActiveForColumn,
  FilterMenu,
  filterOn,
  removeSingleFilter,
  schemaForField,
  setNewParams
}) => {
  const [columnFilterMenuOpen, setColumnFilterMenuOpen] = useState(false);
  return (
    <Popover
      position="bottom"
      onClose={() => {
        setColumnFilterMenuOpen(false);
      }}
      isOpen={columnFilterMenuOpen}
      modifiers={{
        preventOverflow: { enabled: true },
        hide: { enabled: false },
        flip: { enabled: false }
      }}
    >
      <Icon
        style={{ marginLeft: 5 }}
        icon="filter"
        iconSize={extraCompact ? 14 : undefined}
        onClick={() => {
          setColumnFilterMenuOpen(!columnFilterMenuOpen);
        }}
        className={classNames("tg-filter-menu-button", {
          "tg-active-filter": !!filterActiveForColumn
        })}
      />
      <FilterMenu
        addFilters={addFilters}
        compact={compact}
        currentFilter={currentFilter}
        currentParams={currentParams}
        dataType={dataType}
        filterOn={filterOn}
        removeSingleFilter={removeSingleFilter}
        schemaForField={schemaForField}
        setNewParams={setNewParams}
        togglePopover={() => {
          setColumnFilterMenuOpen(false);
        }}
      />
    </Popover>
  );
};
