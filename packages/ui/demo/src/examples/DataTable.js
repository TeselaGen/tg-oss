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
import { times } from "lodash";
import React from "react";
import ReactMarkdown from "react-markdown";
import { withRouter } from "react-router-dom";
import { DataTable, PagingTool, withTableParams } from "../../../src";
import DemoWrapper from "../DemoWrapper";
import OptionsSection from "../OptionsSection";
import renderToggle from "../renderToggle";

const controlled_page_size = 33;
const chance = new Chance();
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
      render: () => {
        return <Checkbox />;
      }
    },
    { path: "isShared", type: "boolean", displayName: <div>
      <Icon icon="hand"></Icon> Is Shared?
    </div> },
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

    { path: "createdAt", type: "timestamp", displayName: "Date Created" },
    { path: "updatedAt", type: "timestamp", displayName: "Last Edited" },
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
    { path: "createdAt", type: "timestamp", displayName: "Date Created" },
    { path: "updatedAt", type: "timestamp", displayName: "Last Edited" },
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

export default class DataTableDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderUnconnectedTable: false,
      urlConnected: true,
      onlyOneFilter: false,
      inDialog: false,
      withSelectedEntities: false
      // ...JSON.parse(localStorage.tableWrapperState || "{}")
    };
    this.closeDialog = this.closeDialog.bind(this);
  }

  // componentDidUpdate() {
  //   localStorage.tableWrapperState = JSON.stringify(this.state);
  // }

  UNSAFE_componentWillMount() {
    //tnr: the following code allows the DataTable test to set defaults on the demo (which is used in the testing)
    this.setState(this.props);
  }

  closeDialog() {
    this.setState({
      inDialog: false
    });
  }

  render() {
    let ConnectedTable = withTableParams({
      //tnrtodo: this should be set up as an enhancer instead
      formName: "example 1", //this should be a unique name
      schema,
      defaults: {
        order: ["isShared"], //default sort specified here!
        pageSize: 5
      },
      urlConnected: this.state.urlConnected,
      onlyOneFilter: this.state.onlyOneFilter,
      withSelectedEntities: this.state.withSelectedEntities
    })(DataTableInstance);
    ConnectedTable = withRouter(ConnectedTable);

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
            {renderToggle({
              that: this,

              type: "renderUnconnectedTable",
              description:
                "Render the table without the withTableParams wrapper." +
                " It's just a simple disconnected react component. You'll" +
                " need to handle paging/sort/filters yourself. Try hitting" +
                " isInfinite to see something actually show up with it"
            })}
            {renderToggle({
              that: this,
              type: "inDialog",
              description: "Render the table in a dialog"
            })}
          </OptionsSection>
          <OptionsSection title="withTableParams Options">
            {renderToggle({
              that: this,

              type: "urlConnected",
              description:
                "Turn off urlConnected if you don't want the url to be updated by the table"
            })}
            {renderToggle({
              that: this,

              type: "onlyOneFilter",
              description:
                "Setting this true makes the table only keep 1 filter/search term in memory instead of allowing multiple"
            })}
            {renderToggle({
              that: this,

              type: "withSelectedEntities",
              description:
                "Setting this true makes the table pass the selectedEntities"
            })}
          </OptionsSection>
          {this.state.inDialog ? (
            <Dialog
              onClose={this.closeDialog}
              title="Table inside a dialog"
              isOpen={this.state.inDialog}
            >
              <div className={Classes.DIALOG_BODY}>
                <ConnectedTable />
              </div>
            </Dialog>
          ) : this.state.renderUnconnectedTable ? (
            <DataTableInstance
              {...{
                tableParams: {
                  formName: "example 1", //this should be a unique name
                  schema,
                  urlConnected: this.state.urlConnected,
                  onlyOneFilter: this.state.onlyOneFilter
                }
              }}
            />
          ) : (
            <ConnectedTable />
          )}
          <br />
        </div>
      </div>
    );
  }
}

const generateFakeRows = num => {
  return times(num).map((a, index) => generateFakeRow({ id: index }));
};
function generateFakeRow({ id, name }) {
  return {
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
  };
}

const defaultNumOfEntities = 60;

class DataTableInstance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      additionalFilters: false,
      isSimple: false,
      isCopyable: true,
      mustClickCheckboxToSelect: false,
      noSelect: false,
      withTitle: true,
      isViewable: false,
      isOpenable: false,
      minimalStyle: false,
      withSearch: true,
      withPaging: true,
      getRowClassName: false,
      noDeselectAll: false,
      expandAllByDefault: false,
      withExpandAndCollapseAllButton: false,
      selectAllByDefault: false,
      withFilter: true,
      withSort: true,
      withSubComponent: false,
      noHeader: false,
      noFooter: false,
      noPadding: false,
      noFullscreenButton: false,
      hideDisplayOptionsIcon: false,
      withDisplayOptions: true,
      isInfinite: false,
      isSingleSelect: false,
      maxHeight: false,
      noRowsFoundMessage: false,
      isLoading: false,
      disabled: false,
      compact: true,
      extraCompact: false,
      hidePageSizeWhenPossible: false,
      hideSelectedCount: false,
      showCount: false,
      doNotShowEmptyRows: false,
      withCheckboxes: true,
      numOfEntities: 60,
      selectedIds: undefined,
      alwaysRerender: false,
      entities: generateFakeRows(defaultNumOfEntities)
      // ...JSON.parse(localStorage.tableState || "{}")
    };
    this.changeNumEntities = this.changeNumEntities.bind(this);
    this.changeSelectedRecords = this.changeSelectedRecords.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  // componentDidUpdate() {
  //   localStorage.tableState = JSON.stringify(this.state);
  // }

  changeNumEntities(numOfEntities) {
    this.setState({
      numOfEntities,
      entities: generateFakeRows(numOfEntities)
    });
  }

  changeSelectedRecords(e) {
    const val = e.target.value;
    const selectedIds = (val.indexOf(",") > -1
      ? val.split(",").map(num => parseInt(num, 10))
      : [parseInt(val, 10)]
    ).filter(val => !isNaN(val));
    this.setState({
      selectedIds
    });
  }

  onRefresh() {
    alert("clicked refresh!");
  }

  render() {
    const { numOfEntities, entities, selectedIds } = this.state;
    const { tableParams, selectedEntities } = this.props;
    const { page, pageSize, isTableParamsConnected } = tableParams;
    let entitiesToPass = [];
    if (this.state.isInfinite || !isTableParamsConnected) {
      entitiesToPass = entities;
    } else {
      for (
        let i =
          (page - 1) *
          (this.state.controlledPaging ? controlled_page_size : pageSize);
        i <
        page * (this.state.controlledPaging ? controlled_page_size : pageSize);
        i++
      ) {
        entities[i] && entitiesToPass.push(entities[i]);
      }
    }
    const additionalFilters = this.state.additionalFilters && [
      {
        filterOn: "notDisplayed", //remember this needs to be the camel cased display name
        selectedFilter: "Contains",
        filterValue: "aj"
      }
    ];
    return (
      <div>
        <OptionsSection title="Table Level Options">
          {renderToggle({
            that: this,

            type: "additionalFilters",
            description:
              "Filters can be added by passing an additionalFilters prop. You can even filter on non-displayed fields"
          })}
          Set number of entities:{" "}
          <NumericInput
            onValueChange={this.changeNumEntities}
            value={numOfEntities}
            // onChange={this.changeNumEntities}
          />
          <br />
          Select records by ids (a single number or numbers separated by ","):{" "}
          <br />
          <input onChange={this.changeSelectedRecords} />
          <br />
          <br />
          {renderToggle({
            that: this,

            type: "isSimple",
            description: ` This sets:
        noHeader: true,
        noFooter: true,
        noFullscreenButton: true,
        noPadding: true,
        hidePageSizeWhenPossible: true,
        isInfinite: true,
        hideSelectedCount: true,
        withTitle: false,
        withSearch: false,
        withPaging: false,
        withExpandAndCollapseAllButton: false,
        expandAllByDefault: false,
        selectAllByDefault: false,
        withFilter: false,
        isCopyable: false,
        by default, but they are all
        individually overridable (which
          is why nothing changes when this is toggled here)
        `
          })}
          {renderToggle({
            that: this,
            type: "withTitle"
          })}
          {renderToggle({
            that: this,
            type: "noSelect"
          })}
          {renderToggle({
            that: this,
            type: "withSubComponent"
          })}
          {renderToggle({
            that: this,
            type: "withSearch"
          })}
          {renderToggle({
            that: this,
            type: "disableSetPageSize"
          })}
          {renderToggle({
            that: this,
            type: "keepSelectionOnPageChange"
          })}
          {renderToggle({
            that: this,
            type: "hideSetPageSize"
          })}
          {renderToggle({
            that: this,
            type: "hideTotalPages"
          })}
          {renderToggle({
            that: this,
            type: "forceNoNextPage"
          })}
          {renderToggle({
            that: this,
            type: "isViewable",
            description: "Make sure withCheckboxes is off when using this"
          })}
          {renderToggle({
            that: this,
            type: "onDoubleClick"
          })}
          {renderToggle({
            that: this,
            type: "isOpenable",
            description: "Make sure withCheckboxes is off when using this"
          })}
          {renderToggle({
            that: this,
            type: "minimalStyle",
            description: "Make the datatable blend into the background"
          })}
          {renderToggle({
            that: this,

            type: "hideDisplayOptionsIcon",
            description:
              "use this in conjunction with withDisplayOptions=true to have display options but not allow the user to see or edit them"
          })}
          {renderToggle({
            that: this,
            type: "withDisplayOptions"
          })}
          {renderToggle({
            that: this,
            type: "withPaging"
          })}
          {renderToggle({
            that: this,
            type: "getRowClassName"
          })}
          {renderToggle({
            that: this,
            type: "controlledPaging"
          })}
          {renderToggle({
            that: this,

            type: "noDeselectAll",
            description:
              "Prevent the table from being fully deselected. Useful when you want at least 1 entity selected"
          })}
          {renderToggle({
            that: this,
            type: "withExpandAndCollapseAllButton"
          })}
          {renderToggle({
            that: this,
            type: "expandAllByDefault"
          })}
          {renderToggle({
            that: this,
            type: "selectAllByDefault"
          })}
          {renderToggle({
            that: this,
            type: "withFilter"
          })}
          {renderToggle({
            that: this,
            type: "withSort"
          })}
          {renderToggle({
            that: this,
            type: "noHeader"
          })}
          {renderToggle({
            that: this,
            type: "noFooter"
          })}
          {renderToggle({
            that: this,
            type: "noFullscreenButton"
          })}
          {renderToggle({
            that: this,
            type: "noPadding"
          })}
          {renderToggle({
            that: this,
            type: "isInfinite"
          })}
          {renderToggle({
            that: this,
            type: "isLoading"
          })}
          {renderToggle({
            that: this,
            type: "disabled"
          })}
          {renderToggle({
            that: this,
            type: "hidePageSizeWhenPossible"
          })}
          {renderToggle({
            that: this,
            type: "doNotShowEmptyRows"
          })}
          {renderToggle({
            that: this,
            type: "withCheckboxes"
          })}
          {renderToggle({
            that: this,
            type: "isSingleSelect"
          })}
          {renderToggle({
            that: this,
            type: "noRowsFoundMessage"
          })}
          {renderToggle({
            that: this,
            type: "hideSelectedCount"
          })}
          {renderToggle({
            that: this,
            type: "showCount"
          })}
          {renderToggle({
            that: this,
            type: "compact",
            description:
              "The table is compact by default (and this is called Normal)"
          })}
          {renderToggle({
            that: this,
            type: "extraCompact"
          })}
          {renderToggle({
            that: this,
            type: "isCopyable"
          })}
          {renderToggle({
            that: this,
            type: "mustClickCheckboxToSelect"
          })}
          {renderToggle({
            that: this,

            type: "maxHeight",
            description:
              "By default every table has a max height of 800px. Setting this true changes it to 200px"
          })}
          {renderToggle({
            that: this,
            isButton: true,
            label: "Update Selection and Entities Multiple times",
            type: "updateSelectedAndChangeNumEnts",
            hook: () => {

              this.setState({
                selectedIds: ["lala", "23r2", "asdf"],
                isInfinite: true,
                entities: [
                  generateFakeRow({ id: "lala" }),
                  generateFakeRow({ id: "23r2" }),
                  generateFakeRow({ id: "asdf" }),
                  generateFakeRow({ id: "2g2g" }),
                  generateFakeRow({ id: "ahha" })
                ]
              });

              setTimeout(() => {
                this.setState({
                  selectedIds: ["zoioiooonk", "23r2", "asdf"],
                  isInfinite: true,
                  entities: [
                    generateFakeRow({ id: "zaza" }),
                    generateFakeRow({ id: "23r2" }),
                    generateFakeRow({ id: "asdf" }),
                    generateFakeRow({ id: "2g2g" }),
                    generateFakeRow({ id: "ahha" }),
                    generateFakeRow({ id: "zoioiooonk", name: "zoioiooonk" }),
                  ]
                });
              }, 1000);
            }
          })}
        </OptionsSection>
        <br />
        {selectedEntities && (
          <div>
            The following records are selected (pass withSelectedEntities: true
            to withTableParams):
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
            onRefresh={this.onRefresh}
            disableSetPageSize={this.state.disableSetPageSize}
            hideSetPageSize={this.state.hideSetPageSize}
            hideTotalPages={this.state.hideTotalPages}
            controlled_hasNextPage={!this.state.forceNoNextPage}
          />
        </DemoWrapper>
        <div style={{ marginTop: 30 }} />
        <DemoWrapper>
          <div className={"wrappingdiv"}>
            <DataTable
              {...tableParams}
              entities={entitiesToPass}
              entityCount={entities.length}
              onDoubleClick={
                this.state.onDoubleClick
                  ? function() {
                      window.toastr.info("double clicked");
                    }
                  : undefined
              }
              shouldShowSubComponent={r => r.id !== 1}
              topLeftItems={<Button>I'm in topLeftItems</Button>}
              SubComponent={this.state.withSubComponent ? SubComp : undefined}
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
              additionalFilters={additionalFilters}
              title={"Demo table"}
              contextMenu={
                function(/*{ selectedRecords, history }*/) {
                  return [
                    <MenuItem
                      key="menuItem1"
                      onClick={function() {
                        console.info("I got clicked!");
                      }}
                      text={"Menu text here"}
                    />,
                    <MenuItem
                      key="menuItem2"
                      onClick={function() {
                        console.info("I also got clicked!");
                      }}
                      text={"Some more"}
                    />
                  ];
                }
              }
              isViewable={this.state.isViewable}
              isOpenable={this.state.isOpenable}
              minimalStyle={this.state.minimalStyle}
              withTitle={this.state.withTitle}
              noSelect={this.state.noSelect}
              isSimple={this.state.isSimple}
              withSearch={this.state.withSearch}
              keepSelectionOnPageChange={this.state.keepSelectionOnPageChange}
              disableSetPageSize={this.state.disableSetPageSize}
              hideSetPageSize={this.state.hideSetPageSize}
              hideTotalPages={this.state.hideTotalPages}
              controlled_hasNextPage={!this.state.forceNoNextPage}
              withExpandAndCollapseAllButton={
                this.state.withExpandAndCollapseAllButton
              }
              expandAllByDefault={this.state.expandAllByDefault}
              selectAllByDefault={this.state.selectAllByDefault}
              withPaging={this.state.withPaging}
              {...(this.state.getRowClassName && {
                getRowClassName: rowInfo => {
                  console.info(`rowInfo:`, rowInfo);
                  return {
                    "custom-getRowClassName": true
                  };
                }
              })}
              {...(this.state.controlledPaging && {
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
              noDeselectAll={this.state.noDeselectAll}
              withFilter={this.state.withFilter}
              withSort={this.state.withSort}
              noFullscreenButton={this.state.noFullscreenButton}
              noPadding={this.state.noPadding}
              noHeader={this.state.noHeader}
              noFooter={this.state.noFooter}
              withDisplayOptions={this.state.withDisplayOptions}
              hideDisplayOptionsIcon={this.state.hideDisplayOptionsIcon}
              isInfinite={this.state.isInfinite}
              isLoading={this.state.isLoading}
              disabled={this.state.disabled}
              compact={this.state.compact}
              extraCompact={this.state.extraCompact}
              hidePageSizeWhenPossible={this.state.hidePageSizeWhenPossible}
              doNotShowEmptyRows={this.state.doNotShowEmptyRows}
              withCheckboxes={this.state.withCheckboxes}
              isSingleSelect={this.state.isSingleSelect}
              noRowsFoundMessage={
                this.state.noRowsFoundMessage &&
                "I guess we didn't find anything .. :("
              }
              hideSelectedCount={this.state.hideSelectedCount}
              showCount={this.state.showCount}
              isCopyable={this.state.isCopyable}
              mustClickCheckboxToSelect={this.state.mustClickCheckboxToSelect}
              {...(this.state.maxHeight
                ? {
                    maxHeight: "200px"
                  }
                : {})}
              onRefresh={this.onRefresh}
              // history={history}
              onSingleRowSelect={noop}
              onDeselect={noop}
              onMultiRowSelect={noop}
              selectedIds={selectedIds}
            />
          </div>
        </DemoWrapper>
        <br />
        <br />
      </div>
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

function SubComp(row) {
  return (
    <div style={{ margin: 10 }}>
      {" "}
      !!Row Index: {row.index}
      {/* <DataTable
        formName={"something"}
        entities={[]}
        schema={{
          fields: [
            {
              path: "something"
            }
          ]
        }}
      /> */}
    </div>
  );
}
