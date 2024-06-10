import React from "react";
import TagSelect from "../../../src/TagSelect";

const staticOptions = [
  {
    label: "option 1",
    value: "option 1",
    color: "#FF69B4"
  },
  {
    label: "option 121412",
    value: "option 2",
    color: "#800080"
  },
  {
    label: "option  w w 3",
    value: "option 3",
    color: "white"
  },
  {
    label: "optionwag 4",
    value: "option 4",
    color: "#FFFF00"
  },
  {
    label: " 5",
    value: "option 5",
    color: "#FFA500"
  },
  // add 10 more options here
  {
    label: "option 6",
    value: "option 6",
    color: "#FF69B4"
  },
  {
    label: "option 7 asdf alsdfj a a  a",
    value: "option 7",
    color: "#800080"
  },
  {
    label: "option 8",
    value: "option 8",
    color: "#008080"
  },
  {
    label: "option 9",
    value: "option 9",
    color: "#FFFF00"
  },
  {
    label: "option 10",
    value: "option 10",
    color: "#FFA500"
  },
  {
    label: "option 11",
    value: "option 11",
    color: "#FF69B4"
  },
  {
    label: "option 12",
    value: "option 12",
    color: "#800080"
  },
  {
    label: "option 13",
    value: "option 13",
    color: "#008080"
  },
  {
    label: "option 14",
    value: "option 14",
    color: "#FFFF00"
  },
  {
    label: "option 15",
    value: "option 15",
    color: "#FFA500"
  }
];

export default () => {
  const [value, setValue] = React.useState(staticOptions[0]);
  return (
    <div>
      <TagSelect
        options={staticOptions}
        value={value}
        onChange={setValue}
      ></TagSelect>
    </div>
  );
};
