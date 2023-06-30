import React, { Component } from "react";
import { Button, Classes, Icon } from "@blueprintjs/core";
import classNames from "classnames";
import "./style.css";

export default class CollapsibleCard extends Component {
  state = {
    open: true
  };

  constructor(props) {
    super(props);
    this.state = {
      open: !props.initialClosed
    };
  }

  renderOpenCard() {
    return this.props.children;
  }

  toggleCardInfo = () => {
    if (this.props.toggle) this.props.toggle();
    else {
      this.setState({
        open: !this.state.open
      });
    }
  };

  getIsOpen = () => {
    if (this.props.isOpen !== undefined) {
      return this.props.isOpen;
    } else {
      return this.state.open;
    }
  };

  render() {
    const open = this.getIsOpen();
    const {
      title,
      icon,
      openTitleElements,
      noCard = false,
      className,
      style
    } = this.props;

    // blueprintjs card will match our table color. which looks really bad when a table is in a card.
    return (
      <div
        className={classNames({ "tg-card": !noCard, open }, className)}
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 15,
          paddingRight: 15,
          ...style
        }}
      >
        <div className="tg-card-header" style={{ marginBottom: 8 }}>
          <div className="tg-card-header-title">
            {icon && <Icon icon={icon} />}
            <h6
              style={{
                marginBottom: 0,
                marginRight: 10,
                marginLeft: 10
              }}
            >
              {title}
            </h6>
            <div>{open && openTitleElements}</div>
          </div>
          <div>
            <Button
              icon={open ? "minimize" : "maximize"}
              className={classNames(
                Classes.MINIMAL,
                "info-btn",
                "tg-collapse-toggle"
              )}
              onClick={this.toggleCardInfo}
            />
          </div>
        </div>
        {open && this.renderOpenCard()}
      </div>
    );
  }
}
