import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./style.css";
import { Button, Icon, InputGroup } from "@blueprintjs/core";

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ demos, isOpen, setIsOpen }) => {
  const [search, setSearch] = useState("");

  if (!isOpen) {
    return null;
  }
  return (
    <div
      className="demo-nav-container"
      style={{
        width: isOpen ? 350 : 50,
        paddingLeft: isOpen ? 20 : undefined,
        paddingRight: isOpen ? 20 : undefined
      }}
    >
      <div
        style={{
          display: "flex",
          padding: 4,
          paddingTop: 11,
          paddingBottom: 11,
          // justifyContent: "flex-end",
          // alignItems: "baseline",
          width: "100%"
        }}
      >
        <Button
          style={{ height: "fit-content" }}
          onClick={() => {
            setIsOpen(false);
          }}
          minimal
          text={"Hide Sidebar"}
          intent="primary"
          icon="chevron-left"
        ></Button>
      </div>
      <InputGroup
        rightElement={
          search && (
            <Button
              minimal
              style={{ marginRight: 10 }}
              icon="small-cross"
              onClick={() => {
                setSearch("");
              }}
            ></Button>
          )
        }
        onChange={e => {
          setSearch(e.target.value);
        }}
        style={{ marginBottom: 5 /* maxWidth: 200 */ }}
        placeholder="Filter..."
        leftElement={<Icon style={{ marginTop: 6 }} icon="search"></Icon>}
      ></InputGroup>
      {Object.keys(demos)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(function (name, index) {
          if (search && !name.toLowerCase().includes(search.toLowerCase()))
            return null;
          const childLinks = demos[name].childLinks || {};
          return (
            <React.Fragment key={index}>
              <NavLink
                exact
                to={`/${name}`}
                activeClassName="demo-nav-link-active"
                className="demo-nav-link"
              >
                {name}
              </NavLink>
              {Object.keys(childLinks).map(childKey => {
                return (
                  <NavLink
                    exact
                    key={childKey}
                    to={`/${name}/${childKey}`}
                    activeClassName="demo-nav-link-active"
                    className="demo-nav-link nested"
                  >
                    {childKey}
                  </NavLink>
                );
              })}
            </React.Fragment>
          );
        })}
      <br></br>
      <br></br>
      Teselagen Open Source UI Library Demo
      <a
        href="https://teselagen.github.io/tg-oss/ui/"
        style={{ fontSize: 16 }}
        rel="noreferrer"
        target="_blank"
      >
        tg-oss/ui demo page
      </a>
      <br></br>
      Teselagen Open Vector Editor - OVE - (Vector/Plasmid Editor) Demo
      <a
        href="https://teselagen.github.io/tg-oss/ove/"
        style={{ fontSize: 16 }}
        rel="noreferrer"
        target="_blank"
      >
        tg-oss/ove demo page
      </a>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};
