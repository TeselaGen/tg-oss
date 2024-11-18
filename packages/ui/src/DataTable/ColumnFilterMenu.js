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
  setNewParams,
  formName
}) => {
  const [columnFilterMenuOpen, setColumnFilterMenuOpen] = useState(false);
  return (
    <Popover
      position="bottom"
      onClose={() => setColumnFilterMenuOpen(false)}
      isOpen={columnFilterMenuOpen}
      modifiers={{
        preventOverflow: { enabled: true },
        hide: { enabled: false },
        flip: { enabled: false }
      }}
      content={
        <FilterMenu
          formName={formName}
          addFilters={addFilters}
          compact={compact}
          currentFilter={currentFilter}
          currentParams={currentParams}
          dataType={dataType}
          filterOn={filterOn}
          removeSingleFilter={removeSingleFilter}
          schemaForField={schemaForField}
          setNewParams={setNewParams}
          togglePopover={() => setColumnFilterMenuOpen(false)}
        />
      }
    >
      <Icon
        style={{ marginLeft: 5 }}
        icon="filter"
        size={extraCompact ? 14 : undefined}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setColumnFilterMenuOpen(prev => !prev);
        }}
        className={classNames("tg-filter-menu-button", {
          "tg-active-filter": !!filterActiveForColumn
        })}
      />
    </Popover>
  );
};
