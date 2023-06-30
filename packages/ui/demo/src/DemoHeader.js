import React, { Component } from "react";
import { Icon, Tooltip, Button, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import "./style.css";
import VersionSwitcher from "./VersionSwitcher";

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
          zIndex:20,
          alignItems: "center"
        }}
      >
        <VersionSwitcher />

        <a
          style={{ fontSize: 16, color: "white" }}
          href="https://github.com/TeselaGen/teselagen-react-components"
        >
          TeselaGen React Components <Icon icon="link" />
        </a>
        <Tooltip content={darkTheme ? "Light Theme" : "Dark Theme"} key="theme">
          <Button
            icon={darkTheme ? "flash" : "moon"}
            className={classNames(Classes.MINIMAL, "tg-dark-theme-button")}
            onClick={() => this.toggleTheme()}
          />
        </Tooltip>
      </div>
    );
  }
}

export default DemoHeader;
