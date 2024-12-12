import React, { useCallback, useMemo } from "react";
import { DataTable, createCommandMenu } from "@teselagen/ui";
import { get } from "lodash-es";
import CutsiteFilter from "../../CutsiteFilter";
import { Button, ButtonGroup } from "@blueprintjs/core";
import { connectToEditor } from "../../withEditorProps";
import { compose } from "recompose";
import selectors from "../../selectors";
import _commands from "../../commands";
import { userDefinedHandlersAndOpts } from "../../Editor/userDefinedHandlersAndOpts";
import { pick } from "lodash-es";
import SingleEnzymeCutsiteInfo from "./SingleEnzymeCutsiteInfo";
import { withRestrictionEnzymes } from "../../CutsiteFilter/withRestrictionEnzymes";
import { cutsitesSubmenu } from "../../MenuBar/viewSubmenu";
import { getVisFilter } from "./GenericAnnotationProperties";

const schema = {
  fields: [
    { path: "name", type: "string" },
    { path: "numberOfCuts", type: "number" },
    { path: "groups", type: "string" }
  ]
};

const defaultValues = { order: ["numberOfCuts"] };

const CutsiteProperties = props => {
  const commands = _commands({ props });
  const {
    allRestrictionEnzymes,
    allCutsites,
    annotationVisibilityShow,
    createNewDigest,
    dispatch,
    editorName,
    filteredCutsites,
    selectedAnnotationId
  } = props;

  const SubComponent = useCallback(
    row => (
      <SingleEnzymeCutsiteInfo
        allRestrictionEnzymes={allRestrictionEnzymes}
        allCutsites={allCutsites}
        filteredCutsites={filteredCutsites}
        editorName={editorName}
        dispatch={dispatch}
        selectedAnnotationId={selectedAnnotationId}
        cutsiteGroup={row.original.cutsiteGroup}
        enzyme={row.original.enzyme}
      />
    ),
    [
      allCutsites,
      allRestrictionEnzymes,
      dispatch,
      editorName,
      filteredCutsites,
      selectedAnnotationId
    ]
  );

  const onChangeHook = useCallback(() => {
    annotationVisibilityShow("cutsites");
  }, [annotationVisibilityShow]);

  const { cutsitesByName, cutsitesById } = filteredCutsites;

  const cutsitesToUse = useMemo(
    () =>
      Object.values(cutsitesByName || {}).map(cutsiteGroup => {
        const name = cutsiteGroup[0].restrictionEnzyme.name;
        let groups = "";
        const exisitingEnzymeGroups = window.getExistingEnzymeGroups();

        Object.keys(exisitingEnzymeGroups).forEach(key => {
          if (exisitingEnzymeGroups[key].includes(name)) groups += key;
          groups += " ";
        });

        return {
          cutsiteGroup,
          id: name,
          name,
          numberOfCuts: cutsiteGroup.length,
          enzyme: cutsiteGroup[0].restrictionEnzyme,
          groups
        };
      }),
    [cutsitesByName]
  );

  const selectedIds = useMemo(
    () => get(cutsitesById[selectedAnnotationId], "restrictionEnzyme.name"),
    [cutsitesById, selectedAnnotationId]
  );

  return (
    <>
      <div
        style={{
          marginBottom: 10,
          paddingTop: 3,
          display: "flex",
          // flexWrap: 'wrap',
          width: "100%",
          // justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        {getVisFilter(
          createCommandMenu(cutsitesSubmenu, commands, {
            useTicks: true
          })
        )}
        <ButtonGroup>
          <Button
            intent="success"
            data-tip="Virtual Digest"
            icon="cut"
            style={{ marginLeft: 15, flexGrow: -1 }}
            onClick={() => {
              createNewDigest();
            }}
          />
        </ButtonGroup>
        <CutsiteFilter
          {...pick(props, userDefinedHandlersAndOpts)}
          style={{ marginLeft: "auto", marginRight: 3 }}
          editorName={editorName}
          manageEnzymesToLeft
          onChangeHook={onChangeHook}
        />
      </div>
      <DataTable
        selectedIds={selectedIds}
        compact
        noSelect
        noHeader
        noFooter
        withExpandAndCollapseAllButton
        noFullscreenButton
        noPadding
        defaults={defaultValues}
        formName="cutsiteProperties"
        noRouter
        withSearch={false}
        SubComponent={SubComponent}
        isInfinite
        schema={schema}
        entities={cutsitesToUse}
      />
    </>
  );
};

export default compose(
  connectToEditor((editorState, ownProps) => {
    const cutsites = selectors.filteredCutsitesSelector(
      editorState,
      ownProps.additionalEnzymes,
      ownProps.enzymeGroupsOverride
    );
    const allCutsites = selectors.cutsitesSelector(
      editorState,
      ownProps.additionalEnzymes
    );
    return {
      annotationVisibility: editorState.annotationVisibility || {},
      filteredCutsites: cutsites,
      allCutsites,
      cutsites: cutsites.cutsitesArray
    };
  }),
  withRestrictionEnzymes
)(CutsiteProperties);
