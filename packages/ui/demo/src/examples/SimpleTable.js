import { Button } from "@blueprintjs/core";
import React from "react";
import DataTable from "../../../src/DataTable";
import DemoWrapper from "../DemoWrapper";
import OptionsSection from "../OptionsSection";
import { useToggle } from "../useToggle";

const schema = {
  fields: [
    { path: "url", type: "markdown" },
    { path: "name", description: "I am the description for the name column" },
    {
      path: "id",
      type: "action",
      render: () => {
        return <Button minimal icon="circle" />;
      }
    },
    {
      path: "bool and i have a very long title header",
      description: "I am the description for the long bool column",
      type: "boolean"
    },
    "type",
    "weather",
    "other",
    "something",
    "nothing"
  ]
};

const entities = [
  {
    url: "[Duck Duck Go](https://duckduckgo.com)",
    name: "Thomas",
    id: "1",
    type: "new",
    weather: "cloudy",
    bool: false
  },
  {
    url: "https://froogle.com",
    name: "Taoh",
    id: "2",
    type: "old",
    weather: "cloudy",
    bool: true
  },
  {
    url: "https://google.com",
    name: "Chris",
    id: "3",
    type: "new",
    weather: "rainy",
    bool: false
  },
  {
    url: `*I'm some markdown*
#### ayy`,
    name: "Sam",
    id: "4",
    type: "old",
    weather: "cloudy",
    bool: true
  },
  {
    url: "**more markdown**",
    name: "Adam with a really loooooonnnngggg last name",
    id: "5",
    type: "new",
    weather: "cloudy",
    bool: false
  },
  {
    url: "# https://google.com",
    name: "Kyle",
    id: "6",
    type: "old",
    weather: "cloudy",
    bool: true
  },
  {
    url: "https://google.com",
    name: "Tiff",
    id: "7",
    type: "new",
    weather: "cloudy",
    bool: false
  }
];

for (let i = 8; i <= 567; i++) {
  entities.push({
    url: `https://example.com/${i}`,
    name: `Entity ${i}`,
    id: `${i}`,
    type: i % 2 === 0 ? "new" : "old",
    weather: i % 3 === 0 ? "rainy" : "cloudy",
    bool: i % 2 === 0
  });
}

export default function SimpleTable(p) {
  const [isEntityDisabled, isEntityDisabledComp] = useToggle({
    type: "isEntityDisabled"
  });
  const [withCheckboxes, withCheckboxesComp] = useToggle({
    type: "withCheckboxes"
  });
  const [orderByFirstColumn, orderByFirstColumnComp] = useToggle({
    type: "orderByFirstColumn"
  });
  return (
    <div>
      <OptionsSection>
        {isEntityDisabledComp}
        {withCheckboxesComp}
        {orderByFirstColumnComp}
      </OptionsSection>
      <DemoWrapper>
        <DataTable
          formName="simpleTable"
          isSimple
          withCheckboxes={withCheckboxes}
          orderByFirstColumn={orderByFirstColumn}
          entities={entities}
          schema={schema}
          isEntityDisabled={
            isEntityDisabled
              ? ent => ent.name === "Chris" || ent.name === "Sam"
              : undefined
          }
          {...p}
        >
          <div>hey, I am the child</div>
        </DataTable>
      </DemoWrapper>
    </div>
  );
}
