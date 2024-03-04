import isMobile from "is-mobile";
import React, { useState } from "react";
import { Tooltip, Button, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import DemoNav from "./DemoNav";

import "./style.css";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DataTable } from "@teselagen/ui";
import VersionSwitcher from "./VersionSwitcher";

import {
  HashRouter as Router,
  Route,
  Redirect,
  withRouter
} from "react-router-dom";

const DemoPage = ({ moduleName, demos, showComponentList }) => {
  const [isOpen, setIsOpen] = useState(showComponentList);
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem("darkTheme") === "true"
  );
  document.body.classList[darkTheme ? "add" : "remove"](Classes.DARK);
  return (
    <Router>
      <div
        style={{
          display: isMobile() ? "inherit" : "flex",
          maxWidth: "100%",
          minWidth: 0,
          width: "100%",
          height: "100%",
          minHeight: 0
        }}
      >
        <DemoNav setIsOpen={setIsOpen} isOpen={isOpen} demos={demos} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            minWidth: 0,
            width: "100%",
            height: "100%",
            minHeight: 0
          }}
        >
          <div
            className="demo-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 20px",
              height: 50,
              alignItems: "center"
            }}
          >
            <VersionSwitcher
              leftComponent={
                !isOpen && (
                  <Button
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    text={"Show Sidebar"}
                    style={{ height: "fit-content", marginRight: 10 }}
                    minimal
                    intent="primary"
                    icon="chevron-right"
                  ></Button>
                )
              }
              packageName={`${moduleName}`}
              testBadge={`[![@teselagen/${moduleName}](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/gwixeq/master&style=flat&logo=cypress)](https://cloud.cypress.io/projects/gwixeq/runs)`}
            />

            <a
              style={{ fontSize: 16 }}
              href={`https://github.com/TeselaGen/tg-oss/tree/master/packages/${moduleName}`}
            >
              @teselagen/{`${moduleName}`}
            </a>
            <Tooltip
              content={darkTheme ? "Light Theme" : "Dark Theme"}
              key="theme"
            >
              <Button
                icon={darkTheme ? "flash" : "moon"}
                className={classNames(Classes.MINIMAL)}
                onClick={
                  darkTheme
                    ? () => {
                        setDarkTheme(false);
                        localStorage.setItem("darkTheme", false);
                      }
                    : () => {
                        setDarkTheme(true);
                        localStorage.setItem("darkTheme", true);
                      }
                }
              />
            </Tooltip>
          </div>

          <Route
            exact
            path="/"
            render={() => <Redirect to={Object.keys(demos)[0]} />}
          />
          {Object.keys(demos).map(function (key, index) {
            const demo = demos[key];
            return (
              <React.Fragment key={key}>
                <Route
                  exact
                  path={`/${key}`}
                  url={demo.url}
                  component={DemoComponentWrapper(demo, key)}
                />
                {Object.keys(demo.childLinks || []).map((childKey, index2) => {
                  const childDemo = demo.childLinks[childKey];
                  return (
                    <Route
                      exact
                      key={key + childKey + index + index2}
                      path={`/${key}/${childKey}`}
                      url={childDemo.url}
                      component={DemoComponentWrapper(childDemo, childKey)}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Router>
  );
};

export default DemoPage;

const demoPropsSchema = [
  {
    displayName: "Name",
    path: "name",
    width: 200,
    render: v => <span style={{ color: "#5bc0de" }}>{v}</span>
  },
  {
    displayName: "Type",
    width: 200,
    path: "type",
    render: v => <span style={{ color: "#ff758d" }}>{v}</span>
  },
  {
    displayName: "Description",
    path: "description"
  }
];

const DemoComponentWrapper = ({
  demo: Demo,
  noDemoMargin,
  DemoComponent,
  props = []
}) => {
  return withRouter(({ history }) => {
    let component;
    if (DemoComponent) {
      component = <DemoComponent />;
    } else {
      component = (
        <>
          <Demo history={history}></Demo>
          {!!props.length && (
            <>
              <h6
                style={{
                  marginTop: 25,
                  marginBottom: 15
                }}
              >
                Properties
              </h6>

              <DataTable
                formName="demoProps"
                entities={props}
                isSimple
                schema={demoPropsSchema}
              />
            </>
          )}
        </>
      );
    }
    return (
      <div
        className="demo-area-container"
        style={{
          ...(!noDemoMargin && {
            overflow: "auto",
            padding: 40,
            minWidth: 0
          }),
          width: "100%",
          height: "100%"
        }}
      >
        {component}
      </div>
    );
  });
};
