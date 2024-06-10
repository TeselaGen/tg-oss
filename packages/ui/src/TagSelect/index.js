import { Button, InputGroup, Popover } from "@blueprintjs/core";
import React from "react";

import Tag from "../Tag";
import "./style.css";
import { useState } from "react";
import { itemListPredicate } from "../TgSelect";

export default ({ value = {}, options = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = itemListPredicate(searchTerm, options, false);

  return (
    <Popover
      isOpen={open}
      onInteraction={setOpen}
      content={
        <div className="tag-select-popover">
          <InputGroup
            rightElement={
              // clear button
              searchTerm ? (
                <Button
                  icon="cross"
                  minimal
                  onClick={() => setSearchTerm("")}
                />
              ) : null
            }
            type="text"
            placeholder="Search..."
            autoFocus
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="tag-select-popover-inner">
            {filteredOptions.map(option => {
              return (
                <Tag
                  key={option.name}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  clickable
                  style={{ maxWidth: 150 }}
                  {...convertTagVals(option)}
                  doNotFillWidth
                ></Tag>
              );
            })}
          </div>
        </div>
      }
    >
      <Tag style={{ maxWidth: 150 }} clickable {...convertTagVals(value)}></Tag>
    </Popover>
  );
};

function convertTagVals(tagVals) {
  return {
    ...tagVals,

    name: tagVals.name || tagVals.label
  };
}
