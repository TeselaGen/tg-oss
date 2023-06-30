import React from "react";
import classNames from "classnames";
import "./style.css";

export default function DNALoader({ style, className }) {
  return (
    <div className={classNames("dna-loader", className)} style={style}>
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
      <div className="nucleobase" />
    </div>
  );
}
