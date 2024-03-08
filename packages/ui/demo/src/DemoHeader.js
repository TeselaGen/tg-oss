import React, { Component } from "react";
import { Tooltip, Button, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import "./style.css";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { VersionSwitcher } from "@teselagen/shared-demo";

class DemoHeader extends Component {
  constructor(props) {
    super(props);
    const darkTheme = localStorage.getItem("darkTheme");
    document.body.classList.toggle(Classes.DARK, darkTheme === "true");
    this.state = {
      darkTheme: !!darkTheme
    };
  }

  componentDidUpdate() {
    const { darkTheme } = this.state;
    localStorage.setItem("darkTheme", darkTheme);
    document.body.classList.toggle(Classes.DARK, !!darkTheme);
  }

  toggleTheme = () => {
    this.setState({
      darkTheme: !this.state.darkTheme
    });
  };

  render() {
    const { darkTheme } = this.state;
    return (
      <div
        className="demo-header"
        style={{
          position: "fixed",
          display: "flex",
          justifyContent: "space-between",
          padding: "5px 20px",
          height: 50,
          zIndex: 20,
          alignItems: "center"
        }}
      >
        <VersionSwitcher
          packageName="ui"
          testBadge={`[![@teselagen/ui](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/gwixeq/master&style=flat&logo=cypress)](https://cloud.cypress.io/projects/gwixeq/runs)`}
        />

        <a
          style={{ fontSize: 16 }}
          href="https://github.com/TeselaGen/tg-oss/tree/master/packages/ui"
        >
          @teselagen/ui
        </a>
        <Tooltip content={darkTheme ? "Light Theme" : "Dark Theme"} key="theme">
          <Button
            icon={darkTheme ? "flash" : "moon"}
            className={classNames(Classes.MINIMAL)}
            onClick={() => this.toggleTheme()}
          />
        </Tooltip>
      </div>
    );
  }
}

export default DemoHeader;
