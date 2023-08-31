import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import isMobile from "is-mobile";
import "./style.css";
import { Button, Icon, InputGroup } from "@blueprintjs/core";

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ demos }) => {
  const [isOpen, setIsOpen] = useState(!isMobile());
  const [search, setSearch] = useState("");

  let inner;
  if (!isOpen) {
    inner = (
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
        style={{ height: "fit-content" }}
        minimal
        intent="primary"
        icon="menu"
      ></Button>
    );
  } else {
    inner = (
      <React.Fragment>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            width: "100%"
          }}
        >
          <h4 style={{ marginTop: 10 }}>Components</h4>
          <Button
            style={{ height: "fit-content" }}
            onClick={() => {
              setIsOpen(false);
            }}
            minimal
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
        <br></br>
        <br></br>
      </React.Fragment>
    );
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
      {inner}
    </div>
  );
};
