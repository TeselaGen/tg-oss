import { Icon } from "@blueprintjs/core";
import React from "react";
import TgSelect from "../../../src/TgSelect";
import DemoWrapper from "../DemoWrapper";
import OptionsSection from "../OptionsSection";
import renderToggle from "../renderToggle";

const staticOptions = [
  {
    label: "option 1",
    value: "option 1"
  },
  {
    label: "option 2",
    value: "option 2"
  },
  {
    label: "option 3",
    value: "option 3"
  }
];

export default class TgSelectDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    // const {} = this.props;

    const {
      multi,
      isTagSelect,
      val,
      creatable,
      disallowClear,
      hasError,
      withStaticOptions
    } = this.state;

    return (
      <div>
        <OptionsSection>
          {renderToggle({
            that: this,
            type: "multi"
            // type: "reactSelectFieldcreatable"
          })}
          {renderToggle({
            that: this,
            type: "disallowClear"
            // type: "reactSelectFieldcreatable"
          })}
          {renderToggle({
            that: this,
            type: "hasError"
            // type: "reactSelectFieldcreatable"
          })}
          {renderToggle({
            that: this,
            type: "creatable"
            // type: "reactSelectFieldcreatable"
          })}
          {renderToggle({
            that: this,
            type: "withStaticOptions"
            // type: "reactSelectFieldcreatable"
          })}
          {renderToggle({
            that: this,
            type: "isTagSelect",
            label: "isTagSelect   *Note: isTagSelect requires multi to be true"
            // type: "reactSelectFieldcreatable"
          })}
        </OptionsSection>
        <DemoWrapper style={{ maxWidth: 300 }}>
          <TgSelect
            onChange={val => {
              this.setState({ val });
            }}
            isTagSelect={isTagSelect}
            multi={multi || isTagSelect}
            intent={hasError ? "danger" : ""}
            creatable={creatable}
            disallowClear={disallowClear}
            value={val}
            autoFocus
            options={
              withStaticOptions
                ? staticOptions
                : [
                    {
                      color: "red",
                      label: (
                        <span>
                          hey <div>I'm some texttt</div>{" "}
                          <Icon icon="circle"></Icon>
                        </span>
                      ),
                      value: "123y4"
                    },
                    { color: "green", label: "haeaya", value: "1f1" },
                    { color: "green", label: "hey", value: "as1234" },
                    {
                      color: "yellow",
                      label: <div>There</div>,
                      value: "14556"
                    },
                    { color: "blue", label: "my: neighbor", value: "14:11545" },
                    { color: "orange", label: "my: friend", value: "14:98798" },
                    {
                      color: "white",
                      label: "my: accomplice",
                      value: "14:001212"
                    }
                  ]
            }
          />
        </DemoWrapper>
      </div>
    );
  }
}
