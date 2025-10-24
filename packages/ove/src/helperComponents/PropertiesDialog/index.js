import React from "react";
import { Tab, Tabs, Tag } from "@blueprintjs/core";
import { flatMap, isNumber, startCase } from "lodash-es";
import FeatureProperties from "./FeatureProperties";
import GeneralProperties from "./GeneralProperties";
import CutsiteProperties from "./CutsiteProperties";
import OrfProperties from "./OrfProperties";
import GenbankView from "./GenbankView";
import TranslationProperties from "./TranslationProperties";
import PrimerProperties from "./PrimerProperties";
import PartProperties from "./PartProperties";
import withEditorProps from "../../withEditorProps";
import "./style.css";
import { userDefinedHandlersAndOpts } from "../../Editor/userDefinedHandlersAndOpts";
import { pick } from "lodash-es";

const PropertiesContainer = Comp => props => {
  const { additionalFooterEls, additionalHeaderEls, overrideEl, ...rest } =
    props;
  return (
    <>
      {additionalHeaderEls}
      {overrideEl || <Comp {...rest} />}
      {additionalFooterEls}
    </>
  );
};
const allTabs = {
  general: PropertiesContainer(GeneralProperties),
  features: PropertiesContainer(FeatureProperties),
  parts: PropertiesContainer(PartProperties),
  primers: PropertiesContainer(PrimerProperties),
  translations: PropertiesContainer(TranslationProperties),
  cutsites: PropertiesContainer(CutsiteProperties),
  orfs: PropertiesContainer(OrfProperties),
  genbank: PropertiesContainer(GenbankView)
};

export const PropertiesDialog = props => {
  const {
    propertiesTool = {},
    propertiesViewTabUpdate,
    dimensions = {},
    height,
    editorName,
    onSave,
    showReadOnly,
    showAvailability,
    isProtein,
    annotationsToSupport = {},
    disableSetReadOnly,
    propertiesList = [
      "general",
      "features",
      "parts",
      "primers",
      "translations",
      "cutsites",
      "orfs",
      "genbank"
    ],
    closePanelButton
  } = { ...props, ...props.PropertiesProps };

  const { width, height: heightFromDim } = dimensions;

  let { tabId, selectedAnnotationId } = propertiesTool;
  if (
    propertiesList
      .map(nameOrOverride => nameOrOverride.name || nameOrOverride)
      .indexOf(tabId) === -1
  ) {
    tabId = propertiesList[0].name || propertiesList[0];
  }

  // Helper to get count for each annotation type
  const getAnnotationCount = name => {
    // Try to get from props, fallback to 0 if not found or not array
    const annotations = props[name] || props.sequenceData[name];
    let count;
    if (Array.isArray(annotations)) {
      count = annotations.length;
    } else if (annotations && typeof annotations === "object") {
      count = Object.keys(annotations).length;
    }
    if (isNumber(count)) {
      return (
        <Tag className="tg-smallTag" round style={{ marginLeft: 1 }}>
          {count}
        </Tag>
      );
    }
    return null;
  };

  const propertiesTabs = flatMap(propertiesList, nameOrOverride => {
    if (annotationsToSupport[nameOrOverride] === false) {
      return [];
    }

    const name = nameOrOverride.name || nameOrOverride;
    const Comp = nameOrOverride.Comp || allTabs[name];
    if (isProtein) {
      if (
        name === "translations" ||
        name === "orfs" ||
        name === "primers" ||
        name === "cutsites"
      ) {
        return null;
      }
    }
    const count = getAnnotationCount(name);
    let title = (() => {
      if (nameOrOverride.Comp) return name; //just use the user supplied name because this is a custom panel
      if (name === "orfs") return "ORFs";
      if (name === "cutsites") return "Cut Sites";
      return startCase(name);
    })();
    if (count) {
      title = (
        <div style={{ display: "flex", alignItems: "center" }}>
          {title}
          {count}
        </div>
      );
    }

    return (
      <Tab
        key={name}
        title={title}
        id={name}
        panel={
          <Comp
            {...{
              ...pick(props, userDefinedHandlersAndOpts),
              editorName,
              onSave,
              isProtein,
              showReadOnly,
              showAvailability,
              disableSetReadOnly,
              selectedAnnotationId,
              PropertiesProps: props.PropertiesProps,
              ...(nameOrOverride.name && nameOrOverride)
            }}
          />
        }
      />
    );
  });
  const heightToUse = Math.max(0, Number((heightFromDim || height) - 30));
  return (
    <div
      style={{
        position: "relative"
      }}
    >
      {closePanelButton}
      <div
        className="ve-propertiesPanel"
        style={{
          display: "flex",
          width,
          height: heightToUse || 300,
          zIndex: 10,
          padding: 10
          // paddingBottom: '31px',
        }}
      >
        {propertiesTabs.length ? (
          <Tabs
            style={{ width }}
            renderActiveTabPanelOnly
            selectedTabId={tabId}
            onChange={propertiesViewTabUpdate}
          >
            <Tabs.Expander />
            {propertiesTabs}
            <Tabs.Expander />
          </Tabs>
        ) : (
          <div style={{ margin: 20, fontSize: 20 }}>
            No Properties to display
          </div>
        )}
      </div>
    </div>
  );
};

export default withEditorProps(PropertiesDialog);
