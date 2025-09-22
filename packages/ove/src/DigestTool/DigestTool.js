import React, { useMemo, useState } from "react";
import { DataTable, useStableReference } from "@teselagen-biotech/ui";
import {
  getCutsiteType,
  getVirtualDigest
} from "@teselagen-biotech/sequence-utils";
import CutsiteFilter from "../CutsiteFilter";
import Ladder from "./Ladder";
import {
  Tabs,
  Tab,
  Button,
  InputGroup,
  Intent,
  Checkbox
} from "@blueprintjs/core";
import withEditorInteractions from "../withEditorInteractions";
import { userDefinedHandlersAndOpts } from "../Editor/userDefinedHandlersAndOpts";
import { pick } from "lodash-es";

const MAX_DIGEST_CUTSITES = 50;
const MAX_PARTIAL_DIGEST_CUTSITES = 10;
const onSingleSelectRow = ({ onFragmentSelect }) => {
  onFragmentSelect();
};

export const DigestTool = props => {
  const [selectedTab, setSelectedTab] = useState("virtualDigest");
  const {
    editorName,
    dimensions = {},
    digestTool: { selectedFragment, computePartialDigest },
    onDigestSave,
    updateComputePartialDigest,
    boxHeight,
    digestLaneRightClicked,
    ladders,
    sequenceData,
    sequenceLength,
    selectionLayerUpdate: _selectionLayerUpdate,
    updateSelectedFragment
  } = props;

  const isCircular = sequenceData.circular;
  const cutsites = sequenceData.cutsites;
  const computePartialDigestDisabled =
    cutsites.length > MAX_PARTIAL_DIGEST_CUTSITES;
  const computeDigestDisabled = cutsites.length > MAX_DIGEST_CUTSITES;
  // The selection layer update function is memoized to prevent re-renders
  // It changes triggered by the DataTables below
  const selectionLayerUpdate = useStableReference(_selectionLayerUpdate);

  // This useMemo might not be necessary once if we figure out
  // why the DataTables below triggers a re-render outside of them.
  const lanes = useMemo(() => {
    const { fragments } = getVirtualDigest({
      cutsites,
      sequenceLength,
      isCircular,
      computePartialDigest,
      computePartialDigestDisabled,
      computeDigestDisabled
    });
    const _lanes = [
      fragments.map(f => ({
        ...f,
        onFragmentSelect: () => {
          selectionLayerUpdate.current({
            start: f.start,
            end: f.end,
            name: f.name
          });
          updateSelectedFragment(f.Intentid);
        }
      }))
    ];
    return _lanes;
  }, [
    computeDigestDisabled,
    computePartialDigest,
    computePartialDigestDisabled,
    cutsites,
    isCircular,
    selectionLayerUpdate,
    sequenceLength,
    updateSelectedFragment
  ]);

  // Same comment as above
  const digestInfoLanes = useMemo(
    () =>
      lanes[0].map(({ id, cut1, cut2, start, end, size, ...rest }) => {
        return {
          ...rest,
          id,
          start,
          end,
          length: size,
          leftCutter: cut1.restrictionEnzyme.name,
          rightCutter: cut2.restrictionEnzyme.name,
          leftOverhang: getCutsiteType(cut1.restrictionEnzyme),
          rightOverhang: getCutsiteType(cut2.restrictionEnzyme)
        };
      }),
    [lanes]
  );

  return (
    <div
      style={{
        height: typeof dimensions.height === "string" ? 100 : dimensions.height,
        overflowY: "auto",
        padding: 10
      }}
    >
      {onDigestSave && (
        <div style={{ display: "flex", marginBottom: 10 }}>
          <InputGroup placeholder="My Digest" />
          <Button
            intent={Intent.PRIMARY}
            onClick={() => {
              onDigestSave({});
            }}
            style={{ marginLeft: 5 }}
          >
            {" "}
            Save
          </Button>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Checkbox
          onChange={() => {
            updateComputePartialDigest(!computePartialDigest);
          }}
          checked={computePartialDigest}
          label={
            <span>
              Show Partial Digests{" "}
              {computePartialDigestDisabled ? (
                <span style={{ fontSize: 10 }}>
                  {" "}
                  -- Disabled (only supports {MAX_PARTIAL_DIGEST_CUTSITES} or
                  fewer cut sites){" "}
                </span>
              ) : null}
            </span>
          }
          disabled={computePartialDigestDisabled}
        />
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://docs.teselagen.com/en/articles/5489322-restriction-digest-in-the-vector-editor"
        >
          Read the docs
        </a>
      </div>
      Choose your enzymes:
      <CutsiteFilter
        {...pick(props, userDefinedHandlersAndOpts)}
        editorName={editorName}
      />
      <br />
      {computeDigestDisabled && (
        <div
          style={{
            color: "red",
            marginBottom: "6px",
            fontSize: "15px"
          }}
        >
          {`>${MAX_DIGEST_CUTSITES} cut sites detected. Filter out additional
            restriction enzymes to visualize digest results`}
        </div>
      )}
      <Tabs
        selectedTabId={selectedTab}
        onChange={id => {
          setSelectedTab(id);
        }}
      >
        <Tab
          title="Virtual Digest"
          id="virtualDigest"
          panel={
            <Ladder
              boxHeight={boxHeight}
              lanes={lanes}
              digestLaneRightClicked={digestLaneRightClicked}
              selectedFragment={selectedFragment}
              ladders={ladders}
            />
          }
        />
        <Tab
          title="Digest Info"
          id="table"
          panel={
            <DataTable
              noRouter
              isSimple
              maxHeight={400}
              // noFooter
              withSearch={false}
              onSingleRowSelect={onSingleSelectRow}
              formName="digestInfoTable"
              entities={digestInfoLanes}
              schema={schema}
            />
          }
        />
      </Tabs>
      <br />
    </div>
  );
};

const schema = {
  fields: [
    { width: 60, path: "start", displayName: "Start", type: "string" },
    { width: 60, path: "end", displayName: "End", type: "string" },
    { width: 70, path: "length", displayName: "Length", type: "string" },
    { path: "leftCutter", displayName: "Left Cutter", type: "string" },
    { path: "leftOverhang", displayName: "Left Overhang", type: "string" },
    { path: "rightCutter", displayName: "Right Cutter", type: "string" },
    { path: "rightOverhang", displayName: "Right Overhang", type: "string" }
  ]
};

export default withEditorInteractions(DigestTool);
