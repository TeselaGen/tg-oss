import React, { useCallback, useState } from "react";
import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  Icon,
  MenuItem,
  NumericInput
} from "@blueprintjs/core";
import { Chance } from "chance";
import { times } from "lodash-es";
import ReactMarkdown from "react-markdown";
import { DataTable, PagingTool, withTableParams } from "../../../src";
import DemoWrapper from "../DemoWrapper";
import OptionsSection from "../OptionsSection";
import { useToggle } from "../useToggle";

const controlled_page_size = 33;
const defaultNumOfEntities = 60;
const chance = new Chance();

const generateFakeRows = num => {
  return times(num).map((a, index) =>
    generateFakeRow({ id: index.toString() })
  );
};

const generateFakeRow = ({ id, name }) => ({
  id: id,
  notDisplayedField: chance.name(),
  name: name || chance.name(),
  color: chance.color(),
  hungerLevel: chance.integer(),
  isShared: chance.pickone([true, false]),
  user: {
    age: chance.d100(),
    lastName: chance.name(),
    status: {
      name: chance.pickone(["pending", "added", "confirmed"])
    }
  },
  type: {
    special: "row " + (id + 1)
  },
  addedBy: chance.name(),
  updatedAt: chance.date(),
  createdAt: chance.date()
});

const schema = {
  model: "material",
  fields: [
    {
      path: "notDisplayedField",
      isHidden: true,
      type: "string",
      displayName: "Not Displayed"
    },
    { path: "hungerLevel", type: "number" },
    { path: "type.special", type: "lookup", displayName: "Special Type" },

    {
      path: "checkboxData",
      type: "boolean",
      displayName: "Checkbox Field",
      // checkbox field should have a name or id
      render: () => <Checkbox name="checkboxField" />
    },
    {
      path: "isShared",
      type: "boolean",
      displayName: (
        <div>
          <Icon icon="hand" /> Is Shared?
        </div>
      )
    },
    {
      path: "name",
      type: "string",
      displayName: "Name",
      openable: true,
      render: (value /* record, index */) => {
        return (
          <span
            style={{
              color: value.length > 8 ? "green" : "red"
            }}
          >
            {value}
          </span>
        );
      },
      renderTitleInner: (
        <span>
          <Icon icon="search-around" /> Name
        </span>
      )
    },
    {
      type: "lookup",
      displayName: "User Status",
      path: "user.status.name"
    },
    {
      path: "color",
      type: "color",
      displayName: "Color"
    },
    { path: "createdAt", type: "timestamp", displayName: "Date Created" },
    { path: "updatedAt", type: "timestamp", displayName: "Last Edited" },
    {
      type: "lookup",
      displayName: "User Status",
      path: "user.status.name",
      render: s => {
        return (
          <span>
            <button>{s}</button>
            <button>yep {s} </button>
          </span>
        );
      }
    },
    {
      type: "lookup",
      displayName: "User Status",
      path: "user.status.name"
    },
    {
      sortDisabled: true,
      path: "user.lastName",
      type: "string",
      displayName: "Added By"
    },
    {
      type: "number",
      path: "user.age",
      displayName: "User Age"
    }
  ]
};

const noop = () => {
  return;
};

const SubComp = row => (
  <div style={{ margin: 10 }}> !!Row Index: {row.index}</div>
);

const DataTableDemo = () => {
  const [renderUnconnectedTable, renderUnconnectedTableSwitch] = useToggle({
    type: "renderUnconnectedTable",
    description:
      "Render the table without the withTableParams wrapper." +
      " It's just a simple disconnected react component. You'll" +
      " need to handle paging/sort/filters yourself. Try hitting" +
      " isInfinite to see something actually show up with it"
  });
  const [urlConnected, urlConnectedSwitch] = useToggle({
    type: "urlConnected",
    description:
      "Turn off urlConnected if you don't want the url to be updated by the table"
  });
  const [onlyOneFilter, onlyOneFilterSwitch] = useToggle({
    type: "onlyOneFilter",
    description:
      "Setting this true makes the table only keep 1 filter/search term in memory instead of allowing multiple"
  });
  const [inDialog, setInDialog] = useState(false);
  const [, inDialogSwitch] = useToggle({
    type: "inDialog",
    description: "Render the table in a dialog",
    controlledValue: inDialog,
    setControlledValue: setInDialog
  });
  const [withSelectedEntities, withSelectedEntitiesSwitch] = useToggle({
    type: "withSelectedEntities",
    description: "Setting this true makes the table pass the selectedEntities"
  });

  const [_additionalFilters, _additionalFiltersSwitch] = useToggle({
    type: "additionalFilters",
    description:
      "Filters can be added by passing an additionalFilters prop. You can even filter on non-displayed fields"
  });
  const [compact, compactSwitch] = useToggle({
    type: "compact",
    defaultValue: true
  });
  const [controlledPaging, controlledPagingSwitch] = useToggle({
    type: "controlledPaging"
  });
  const [disabled, disabledSwitch] = useToggle({ type: "disabled" });
  const [disableSetPageSize, disableSetPageSizeSwitch] = useToggle({
    type: "disableSetPageSize"
  });
  const [doNotShowEmptyRows, doNotShowEmptyRowsSwitch] = useToggle({
    type: "doNotShowEmptyRows"
  });

  const [expandAllByDefault, expandAllByDefaultSwitch] = useToggle({
    type: "expandAllByDefault"
  });
  const [extraCompact, extraCompactSwitch] = useToggle({
    type: "extraCompact"
  });
  const [forceNoNextPage, forceNoNextPageSwitch] = useToggle({
    type: "forceNoNextPage"
  });
  const [getRowClassName, getRowClassNameSwitch] = useToggle({
    type: "getRowClassName"
  });
  const [hideDisplayOptionsIcon, hideDisplayOptionsIconSwitch] = useToggle({
    type: "hideDisplayOptionsIcon",
    description:
      "use this in conjunction with withDisplayOptions=true to have display options but not allow the user to see or edit them"
  });
  const [hidePageSizeWhenPossible, hidePageSizeWhenPossibleSwitch] = useToggle({
    type: "hidePageSizeWhenPossible"
  });
  const [hideSelectedCount, hideSelectedCountSwitch] = useToggle({
    type: "hideSelectedCount"
  });
  const [hideSetPageSize, hideSetPageSizeSwitch] = useToggle({
    type: "hideSetPageSize"
  });
  const [hideTotalPages, hideTotalPagesSwitch] = useToggle({
    type: "hideTotalPages"
  });
  const [isCopyable, isCopyableSwitch] = useToggle({
    type: "isCopyable",
    defaultValue: true
  });

  const [isInfinite, setIsInfinite] = useState(false);
  const [, isInfiniteSwitch] = useToggle({
    type: "isInfinite",
    controlledValue: isInfinite,
    setControlledValue: setIsInfinite
  });
  const [isLoading, isLoadingSwitch] = useToggle({
    type: "isLoading"
  });
  const [isEntityDisabled, isEntityDisabledSwitch] = useToggle({
    type: "isEntityDisabled"
  });
  const [isOpenable, isOpenableSwitch] = useToggle({
    type: "isOpenable"
  });
  const [isSimple, isSimpleSwitch] = useToggle({
    type: "isSimple",
    description: ` This sets:
        expandAllByDefault: false,
        hidePageSizeWhenPossible: true,
        hideSelectedCount: true,
        isCopyable: false,
        isInfinite: true,
        noFooter: true,
        noFullscreenButton: true,
        noHeader: true,
        noPadding: true,
        selectAllByDefault: false,
        withExpandAndCollapseAllButton: false,
        withFilter: false,
        withPaging: false,
        withSearch: false,
        withTitle: false,
        by default, but they are all
        individually overridable (which
          is why nothing changes when this is toggled here)
        `
  });
  const [isSingleSelect, isSingleSelectSwitch] = useToggle({
    type: "isSingleSelect"
  });
  const [isViewable, isViewableSwitch] = useToggle({
    type: "isViewable",
    description: "Make sure withCheckboxes is off when using this"
  });
  const [isMultiViewable, isMultiViewableSwitch] = useToggle({
    type: "isMultiViewable",
    description: "This one works fine with withCheckboxes"
  });

  const [keepSelectionOnPageChange, keepSelectionOnPageChangeSwitch] =
    useToggle({
      type: "keepSelectionOnPageChange"
    });
  const [maxHeight, maxHeightSwitch] = useToggle({
    type: "maxHeight",

    description:
      "By default every table has a max height of 800px. Setting this true changes it to 200px"
  });
  const [minimalStyle, minimalStyleSwitch] = useToggle({
    type: "minimalStyle",

    description: "Make the datatable blend into the background"
  });
  const [mustClickCheckboxToSelect, mustClickCheckboxToSelectSwitch] =
    useToggle({
      type: "mustClickCheckboxToSelect"
    });
  const [noDeselectAll, noDeselectAllSwitch] = useToggle({
    type: "noDeselectAll",
    description:
      "Prevent the table from being fully deselected. Useful when you want at least 1 entity selected"
  });
  const [noFooter, noFooterSwitch] = useToggle({
    type: "noFooter"
  });
  const [noFullscreenButton, noFullscreenButtonSwitch] = useToggle({
    type: "noFullscreenButton"
  });
  const [noHeader, noHeaderSwitch] = useToggle({
    type: "noHeader"
  });
  const [noPadding, noPaddingSwitch] = useToggle({
    type: "noPadding"
  });
  const [noSelect, noSelectSwitch] = useToggle({
    type: "noSelect"
  });
  const [noRowsFoundMessage, noRowsFoundMessageSwitch] = useToggle({
    type: "noRowsFoundMessage"
  });
  const [numOfEntities, setNumOfEntities] = useState(defaultNumOfEntities);
  const [onDoubleClick, onDoubleClickSwitch] = useToggle({
    type: "onDoubleClick"
  });
  const [selectAllByDefault, selectAllByDefaultSwitch] = useToggle({
    type: "selectAllByDefault"
  });
  const [selectedIds, setSelectedIds] = useState(undefined);
  const [showCount, showCountSwitch] = useToggle({
    type: "showCount"
  });
  const [withCheckboxes, withCheckboxesSwitch] = useToggle({
    type: "withCheckboxes",
    defaultValue: true
  });
  const [withDisplayOptions, withDisplayOptionsSwitch] = useToggle({
    type: "withDisplayOptions",
    defaultValue: true
  });
  const [withExpandAndCollapseAllButton, withExpandAndCollapseAllButtonSwitch] =
    useToggle({
      type: "withExpandAndCollapseAllButton"
    });
  const [withFilter, withFilterSwitch] = useToggle({
    type: "withFilter",
    defaultValue: true
  });
  const [withPaging, withPagingSwitch] = useToggle({
    type: "withPaging",
    defaultValue: true
  });
  const [withSearch, withSearchSwitch] = useToggle({
    type: "withSearch",
    defaultValue: true
  });
  const [withSort, withSortSwitch] = useToggle({
    type: "withSort",
    defaultValue: true
  });
  const [withSubComponent, withSubComponentSwitch] = useToggle({
    type: "withSubComponent"
  });
  const [withTitle, withTitleSwitch] = useToggle({
    type: "withTitle",
    defaultValue: true
  });

  const [entities, setEntities] = useState(
    generateFakeRows(defaultNumOfEntities)
  );
  const [recordIdToIsVisibleMap, setRecordIdToIsVisibleMap] = useState(
    entities.reduce((acc, val) => {
      acc[val.id] = true;
      return acc;
    }, {})
  );
  const changeNumEntities = numOfEntities => {
    setNumOfEntities(numOfEntities);
    setEntities(generateFakeRows(numOfEntities));
  };

  const [, updateSelectedAndChangeNumEntsButton] = useToggle({
    type: "updateSelectedAndChangeNumEnts",
    label: "Update Selection and Entities Multiple times",
    isButton: true,
    hook: () => {
      setSelectedIds(["lala", "23r2", "asdf"]);
      setIsInfinite(true);
      setEntities([
        generateFakeRow({ id: "lala" }),
        generateFakeRow({ id: "23r2" }),
        generateFakeRow({ id: "asdf" }),
        generateFakeRow({ id: "2g2g" }),
        generateFakeRow({ id: "ahha" })
      ]);

      setTimeout(() => {
        setSelectedIds(["zoioiooonk", "23r2", "asdf"]);
        setIsInfinite(true);
        setEntities([
          generateFakeRow({ id: "zaza" }),
          generateFakeRow({ id: "23r2" }),
          generateFakeRow({ id: "asdf" }),
          generateFakeRow({ id: "2g2g" }),
          generateFakeRow({ id: "ahha" }),
          generateFakeRow({ id: "zoioiooonk", name: "zoioiooonk" })
        ]);
      }, 1000);
    }
  });

  const changeSelectedRecords = e => {
    const val = e.target.value;
    const selectedIds = (
      val.indexOf(",") > -1
        ? val.split(",").map(num => parseInt(num, 10))
        : [parseInt(val, 10)]
    ).filter(val => !isNaN(val));
    setSelectedIds(selectedIds);
  };

  const closeDialog = () => {
    setInDialog(false);
  };

  const onRefresh = () => {
    alert("clicked refresh!");
  };

  const DataTableInstance = useCallback(
    props => {
      const { tableParams, selectedEntities } = props;
      const { page, pageSize, isTableParamsConnected } = tableParams;
      let entitiesToPass = [];
      if (isInfinite || !isTableParamsConnected) {
        entitiesToPass = entities;
      } else {
        for (
          let i =
            (page - 1) * (controlledPaging ? controlled_page_size : pageSize);
          i < page * (controlledPaging ? controlled_page_size : pageSize);
          i++
        ) {
          entities[i] && entitiesToPass.push(entities[i]);
        }
      }
      const additionalFilters = _additionalFilters && [
        {
          filterOn: "notDisplayed", //remember this needs to be the camel cased display name
          selectedFilter: "Contains",
          filterValue: "aj"
        }
      ];
      return (
        <>
          {selectedEntities && (
            <div>
              The following records are selected (pass withSelectedEntities:
              true to withTableParams):
              <div
                style={{
                  height: 40,
                  maxHeight: 40,
                  maxWidth: 800,
                  overflow: "auto"
                }}
              >
                {selectedEntities
                  .map(record => `${record.id}: ${record.name}`)
                  .join(", ")}
              </div>
            </div>
          )}
          <DemoWrapper>
            PagingTool used outside of the datatable:
            <PagingTool
              {...tableParams}
              entities={entitiesToPass}
              entityCount={entities.length}
              onRefresh={onRefresh}
              disableSetPageSize={disableSetPageSize}
              hideSetPageSize={hideSetPageSize}
              hideTotalPages={hideTotalPages}
              controlled_hasNextPage={!forceNoNextPage}
            />
          </DemoWrapper>
          <div style={{ marginTop: 30 }} />
          <DemoWrapper>
            <div className={"wrappingdiv"}>
              <DataTable
                {...tableParams}
                additionalFilters={additionalFilters}
                cellRenderer={{
                  isShared: value => {
                    return (
                      <span
                        style={{
                          color: value ? "green" : "red"
                        }}
                      >
                        {value ? "True" : "False"} <button>click me</button>
                      </span>
                    );
                  }
                }}
                compact={compact}
                contextMenu={
                  function (/*{ selectedRecords, history }*/) {
                    return [
                      <MenuItem
                        key="menuItem1"
                        onClick={function () {
                          console.info("I got clicked!");
                        }}
                        text={"Menu text here"}
                      />,
                      <MenuItem
                        key="menuItem2"
                        onClick={function () {
                          console.info("I also got clicked!");
                        }}
                        text={"Some more"}
                      />
                    ];
                  }
                }
                controlled_hasNextPage={!forceNoNextPage}
                disabled={disabled}
                disableSetPageSize={disableSetPageSize}
                doNotShowEmptyRows={doNotShowEmptyRows}
                entities={entitiesToPass}
                entityCount={entities.length}
                expandAllByDefault={expandAllByDefault}
                extraCompact={extraCompact}
                {...(getRowClassName && {
                  getRowClassName: () => {
                    return {
                      "custom-getRowClassName": true
                    };
                  }
                })}
                {...(controlledPaging && {
                  controlled_setPage: () => {
                    console.info(`controlled_setPage hit`);
                  },
                  controlled_setPageSize: () => {
                    console.info(`controlled_setPageSize hit`);
                  },
                  controlled_page: 6,
                  controlled_pageSize: controlled_page_size,
                  controlled_total: 440,
                  controlled_onRefresh: () => {
                    console.info(`controlled_onRefresh hit`);
                  }
                })}
                hideSetPageSize={hideSetPageSize}
                hideTotalPages={hideTotalPages}
                hideDisplayOptionsIcon={hideDisplayOptionsIcon}
                hidePageSizeWhenPossible={hidePageSizeWhenPossible}
                hideSelectedCount={hideSelectedCount}
                isCopyable={isCopyable}
                isInfinite={isInfinite}
                isLoading={isLoading}
                isEntityDisabled={
                  isEntityDisabled
                    ? r =>
                        !r.isShared
                          ? "This entity is disabled cause it isn't shared"
                          : false
                    : undefined
                }
                isOpenable={isOpenable}
                isSimple={isSimple}
                isSingleSelect={isSingleSelect}
                isViewable={isViewable}
                {...(isMultiViewable && {
                  recordIdToIsVisibleMap,
                  setRecordIdToIsVisibleMap
                })}
                keepSelectionOnPageChange={keepSelectionOnPageChange}
                {...(maxHeight ? { maxHeight: "200px" } : {})}
                minimalStyle={minimalStyle}
                mustClickCheckboxToSelect={mustClickCheckboxToSelect}
                noDeselectAll={noDeselectAll}
                noFooter={noFooter}
                noFullscreenButton={noFullscreenButton}
                noHeader={noHeader}
                noPadding={noPadding}
                noRowsFoundMessage={
                  noRowsFoundMessage || "I guess we didn't find anything .. :("
                }
                noSelect={noSelect}
                onDeselect={noop}
                onDoubleClick={
                  onDoubleClick
                    ? function () {
                        window.toastr.info("double clicked");
                      }
                    : undefined
                }
                onMultiRowSelect={noop}
                onRefresh={onRefresh}
                onSingleRowSelect={noop}
                selectAllByDefault={selectAllByDefault}
                selectedIds={selectedIds}
                shouldShowSubComponent={r => r.id !== 1}
                showCount={showCount}
                SubComponent={withSubComponent ? SubComp : undefined}
                title={"Demo table"}
                topLeftItems={<Button>I'm in topLeftItems</Button>}
                withCheckboxes={withCheckboxes}
                withDisplayOptions={withDisplayOptions}
                withExpandAndCollapseAllButton={withExpandAndCollapseAllButton}
                withFilter={withFilter}
                withPaging={withPaging}
                withSearch={withSearch}
                withSort={withSort}
                withTitle={withTitle}
              />
            </div>
          </DemoWrapper>
          <br />
          <br />
        </>
      );
    },
    [
      _additionalFilters,
      compact,
      controlledPaging,
      disableSetPageSize,
      disabled,
      doNotShowEmptyRows,
      entities,
      expandAllByDefault,
      extraCompact,
      forceNoNextPage,
      getRowClassName,
      hideDisplayOptionsIcon,
      hidePageSizeWhenPossible,
      hideSelectedCount,
      hideSetPageSize,
      hideTotalPages,
      isCopyable,
      isInfinite,
      isLoading,
      isOpenable,
      isSimple,
      isSingleSelect,
      isViewable,
      isMultiViewable,
      keepSelectionOnPageChange,
      maxHeight,
      minimalStyle,
      mustClickCheckboxToSelect,
      noDeselectAll,
      noFooter,
      noFullscreenButton,
      noHeader,
      noPadding,
      noRowsFoundMessage,
      noSelect,
      onDoubleClick,
      selectAllByDefault,
      selectedIds,
      showCount,
      withCheckboxes,
      withDisplayOptions,
      withExpandAndCollapseAllButton,
      withFilter,
      withPaging,
      withSearch,
      withSort,
      withSubComponent,
      withTitle,
      recordIdToIsVisibleMap,
      isEntityDisabled
    ]
  );

  const ConnectedTable = withTableParams({
    //tnrtodo: this should be set up as an enhancer instead
    formName: "example 1", // this should be a unique name
    schema,
    defaults: {
      order: ["isShared"], // default sort specified here!
      pageSize: 5
    },
    urlConnected,
    onlyOneFilter,
    withSelectedEntities
  })(DataTableInstance);

  return (
    <div>
      <div>
        <OptionsSection noTitle>
          <details>
            <summary>
              Passing props from an unrelated query into a DataTable via
              withTableParams(){" "}
            </summary>
            <ReactMarkdown
              children={`
\`\`\`
withQuery(["stage", "id name"], {
  isPlural: true,
  props: p => {
    //pass additional data to the data table
    return { tableParams: { stages: p.data.stages } };
  }
}),
withTableParams({
  urlConnected: true,
  schema,
  formName: "DesignLibrary",
  withDisplayOptions: true
}),
//we're actually querying for designs
withQuery(
  [
    "design",
\`\`\`
                  `}
            />
          </details>
        </OptionsSection>
        <OptionsSection title="Demo specific Options">
          {renderUnconnectedTableSwitch}
          {inDialogSwitch}
        </OptionsSection>
        <OptionsSection title="withTableParams Options">
          {urlConnectedSwitch}
          {onlyOneFilterSwitch}
          {withSelectedEntitiesSwitch}
        </OptionsSection>
        <OptionsSection title="Table Level Options">
          {_additionalFiltersSwitch}
          Set number of entities:{" "}
          <NumericInput
            name="numOfEntities"
            onValueChange={changeNumEntities}
            value={numOfEntities}
            // onChange={this.changeNumEntities}
          />
          <br />
          Select records by ids (a single number or numbers separated by ","):{" "}
          <br />
          <input onChange={changeSelectedRecords} name="selectedRecords" />
          <br />
          <br />
          {isSimpleSwitch}
          {withTitleSwitch}
          {noSelectSwitch}
          {withSubComponentSwitch}
          {withSearchSwitch}
          {disableSetPageSizeSwitch}
          {keepSelectionOnPageChangeSwitch}
          {hideSetPageSizeSwitch}
          {hideTotalPagesSwitch}
          {forceNoNextPageSwitch}
          {isViewableSwitch}
          {isMultiViewableSwitch}
          {onDoubleClickSwitch}
          {isOpenableSwitch}
          {minimalStyleSwitch}
          {hideDisplayOptionsIconSwitch}
          {withDisplayOptionsSwitch}
          {withPagingSwitch}
          {getRowClassNameSwitch}
          {controlledPagingSwitch}
          {noDeselectAllSwitch}
          {withExpandAndCollapseAllButtonSwitch}
          {expandAllByDefaultSwitch}
          {selectAllByDefaultSwitch}
          {withFilterSwitch}
          {withSortSwitch}
          {noHeaderSwitch}
          {noFooterSwitch}
          {noFullscreenButtonSwitch}
          {noPaddingSwitch}
          {isInfiniteSwitch}
          {isLoadingSwitch}
          {isEntityDisabledSwitch}
          {disabledSwitch}
          {hidePageSizeWhenPossibleSwitch}
          {doNotShowEmptyRowsSwitch}
          {withCheckboxesSwitch}
          {isSingleSelectSwitch}
          {noRowsFoundMessageSwitch}
          {hideSelectedCountSwitch}
          {showCountSwitch}
          {compactSwitch}
          {extraCompactSwitch}
          {isCopyableSwitch}
          {mustClickCheckboxToSelectSwitch}
          {maxHeightSwitch}
          {updateSelectedAndChangeNumEntsButton}
        </OptionsSection>
        <br />
        {inDialog ? (
          <Dialog
            onClose={closeDialog}
            title="Table inside a dialog"
            isOpen={inDialog}
          >
            <div className={Classes.DIALOG_BODY}>
              <ConnectedTable />
            </div>
          </Dialog>
        ) : renderUnconnectedTable ? (
          <DataTableInstance
            tableParams={{
              formName: "example 1", //this should be a unique name
              schema,
              urlConnected: urlConnected,
              onlyOneFilter: onlyOneFilter
            }}
          />
        ) : (
          <ConnectedTable />
        )}
        <br />
      </div>
    </div>
  );
};

export default DataTableDemo;
