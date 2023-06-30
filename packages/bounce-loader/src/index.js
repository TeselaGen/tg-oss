/* taken from http://tobiasahlin.com/spinkit/ */
import React from "react";
import classNames from "classnames";
import "./style.css";

export function BounceLoader({ style, className }) {
  return (
    <div
      data-testid="bounce-loader"
      className={classNames("tg-bounce-loader", className)}
      style={style}
    >
      <div className="rect1" />
      <div className="rect2" />
      <div className="rect3" />
      <div className="rect4" />
      <div className="rect5" />
    </div>
  );
}
