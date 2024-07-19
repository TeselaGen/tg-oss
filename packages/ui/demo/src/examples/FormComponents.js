/* eslint-disable no-console */

import React from "react";
import { Provider } from "react-redux";
import { reduxForm } from "redux-form";
import { Icon, Button, MenuItem } from "@blueprintjs/core";
import store from "../store";
import Uploader from "../../../src/FormComponents/Uploader";
import {
  RadioGroupField,
  NumericInputField,
  FileUploadField,
  InputField,
  SelectField,
  BPSelect,
  DateRangeInputField,
  DateInputField,
  CheckboxField,
  SwitchField,
  TextareaField,
  EditableTextField,
  ReactSelectField,
  ReactColorField,
  SuggestField,
  InfoHelper,
  showConfirmationDialog
} from "../../../src";
import { useToggle } from "../useToggle";
import OptionsSection from "../OptionsSection";
import DemoWrapper from "../DemoWrapper";

// const getOptions = function(input, callback) {
//   setTimeout(function() {
//     callback(null, {
//       options: [{ value: "one", label: "One" }, { value: "two", label: "Two" }],
//       // CAREFUL! Only set this to true when there are no more options,
//       // or more specific queries will not be sent to the server.
//       complete: true
//     });
//   }, 500);
// };

function FormComponentsDemo({ handleSubmit }) {
  const [disableFileUploadField, disableFileUploadFieldComp] = useToggle({
    type: "disableFileUploadField"
  });
  const [giveDefaultSelectValue, giveDefaultSelectValueComp] = useToggle({
    type: "giveDefaultSelectValue"
  });
  const [inlineLabels, inlineLabelsComp] = useToggle({
    type: "inlineLabels"
  });
  const [reactSelectFieldcreatable, reactSelectFieldcreatableComp] = useToggle({
    type: "reactSelectFieldcreatable",
    label: "creatable"
  });
  const [reactSelectFielddisallowClear, reactSelectFielddisallowClearComp] =
    useToggle({
      type: "reactSelectFielddisallowClear",
      label: "disallowClear"
    });
  // const [disabled, disabledToggleComp] = useToggle({
  //   type: "disabled"
  // });

  return (
    <Provider store={store}>
      <div className="form-components">
        <h3 className="form-component-title">
          Blueprint Redux Form Components
        </h3>
        <InputField
          clickToEdit
          name={"inputFieldWithClickToEdit"}
          inlineLabel={inlineLabels}
          onFieldSubmit={onFieldSubmit}
          label="InputField with clickToEdit=true"
          placeholder="Enter note..."
        />
        <OptionsSection>
          {inlineLabelsComp}
          {reactSelectFieldcreatableComp}
          {reactSelectFielddisallowClearComp}
        </OptionsSection>
        <DemoWrapper>
          <Uploader
            threeDotMenuItems={
              <MenuItem
                text={
                  <div style={{ display: "flex", alignContent: "center" }}>
                    Download Example File &nbsp;&nbsp;
                    <InfoHelper content="I'm some helper text"></InfoHelper>
                  </div>
                }
              ></MenuItem>
            }
            action={"docs.google.com/upload"}
            accept=".gb"
            fileList={[
              {
                uid: 1, //you must set a unique id for this to work properly
                name: "yarn_asfwiefoaegnasgnasfiahusdf_asfwiefoaegnasgnasfiahusdf_asfwiefoaegnasgnasfiahusdf.lock",
                status: "error"
              }
            ]}
          />
          <h6>Importer with minimal=true</h6>
          <div style={{ display: "flex" }}>
            <Button>Hey there</Button>
            &nbsp;
            <Uploader
              threeDotMenuItems={<MenuItem text="Download Example File" />}
              secondaryLabel="<Uploader/> I'm a secondaryLabel"
              accept=".json"
              action={"docs.google.com/upload"}
              minimal
              fileList={[
                {
                  uid: 1, //you must set a unique id for this to work properly
                  name: "yarn.lock",
                  status: "error"
                }
              ]}
            />
            &nbsp;
          </div>
          <h6>FileUploadField with minimal=true</h6>
          <FileUploadField
            threeDotMenuItems={<MenuItem text="Download Example File" />}
            className={"minimal-file-upload-field"}
            secondaryLabel="I'm a secondaryLabel"
            innerText="Upload"
            minimal
            fileList={[
              {
                uid: 1, //you must set a unique id for this to work properly
                name: "yarn.lock",
                status: "error"
              }
            ]}
            label="Upload component"
            tooltipInfo="hello hello I'm tooltipInfo"
            onFieldSubmit={function (fileList) {
              console.info(
                "do something with the finished file list:",
                fileList
              );
            }}
            action={"//jsonplaceholder.typicode.com/posts/"}
            name={"<FileUploadField/> uploadfield"}
            inlineLabel={inlineLabels}
          />
          <h6>FileUploadField with file limit</h6>
          <FileUploadField
            label="File limit and type"
            onFieldSubmit={function (fileList) {
              console.info(
                "do something with the finished file list:",
                fileList
              );
            }}
            className={"fileUploadLimitAndType"}
            accept={[".json"]}
            action={"//jsonplaceholder.typicode.com/posts/"}
            name={"<FileUploadField/> uploadfield"}
            fileLimit={1}
            inlineLabel={inlineLabels}
          />
          <RadioGroupField
            name={"radioGroup"}
            inlineLabel={inlineLabels}
            label={"<RadioGroupField/> Radio Group Input"}
            secondaryLabel="I'm a secondaryLabel"
            tooltipInfo="hello hello I'm tooltipInfo"
            defaultValue={"true"}
            onFieldSubmit={onFieldSubmit}
            options={[
              {
                label: "Option 1",
                value: true
              },
              {
                label: "Option 2",
                value: false
              }
            ]}
          />
          <div style={{ display: "flex" }}>
            <NumericInputField
              generateDefaultValue={{}} //just here to see the css
              secondaryLabel="(optional)"
              name={"numericInput"}
              tooltipInfo="hello hello I'm tooltipInfo"
              inlineLabel={inlineLabels}
              label="<NumericInputField/> Numeric Input"
              placeholder="0"
              onFieldSubmit={onFieldSubmit}
            />
          </div>
          {disableFileUploadFieldComp}
          <FileUploadField
            threeDotMenuItems={<MenuItem text="Download Example File" />}
            disabled={disableFileUploadField}
            className={"fileUploadZoink"}
            label="<FileUploadField/> Upload component 123"
            tooltipInfo="hello hello I'm tooltipInfo"
            onFieldSubmit={function (fileList) {
              console.info(
                "do something with the finished file list:",
                fileList
              );
            }}
            name={"uploadfield"}
            inlineLabel={inlineLabels}
          />
          <InputField
            name={"inputFieldWithDefaultValue"}
            inlineLabel={inlineLabels}
            label="<InputField defaultValue/>  With Default"
            defaultValue={"Default Value Here!"}
            placeholder="Enter input..."
            onFieldSubmit={onFieldSubmit}
            containerStyle={{ background: "black", height: 200 }}
          />
          <div style={{ display: "flex" }}>
            <InputField
              name={"inputFieldWithTooltipError"}
              inlineLabel={inlineLabels}
              tooltipError
              tooltipProps={{
                position: "top"
              }}
              onFieldSubmit={onFieldSubmit}
              label="<InputField/> "
              placeholder="Enter input..."
            />
            &nbsp;
            <ReactColorField
              name="reactColorField"
              inlineLabel={inlineLabels}
              label="ReactColorField"
              onFieldSubmit={onFieldSubmit}
            />
          </div>
          <SelectField
            tooltipInfo="hello hello I'm tooltipInfo"
            onFieldSubmit={onFieldSubmit}
            options={["hey", "you", "guys"]}
            name={"selectField"}
            inlineLabel={inlineLabels}
            label="<SelectField/>"
          />
          <InputField
            name={"inlineinputFieldWithTooltipError"}
            inlineLabel={inlineLabels}
            tooltipError
            tooltipProps={{
              position: "top"
            }}
            onFieldSubmit={onFieldSubmit}
            label="Input with toolTip error with inlineLabel = true"
            placeholder="Enter input..."
          />
          <SelectField
            onFieldSubmit={onFieldSubmit}
            options={["hey", "you", "guys"]}
            name={"inlineselectField"}
            inlineLabel={inlineLabels}
            label="<SelectField/> with inlineLabel = true"
          />
          {"<BPSelect onChange value /> component (not redux form connected):"}
          <BPSelect
            onChange={onFieldSubmit}
            value="hey"
            options={["hey", "you", "guys"]}
            name={"inlineselectField"}
            inlineLabel={inlineLabels}
            label="Select Simple with inlineLabel = true"
          />
          {
            "<BPSelect onChange value /> component with className bp3-minimal passed (not redux form connected):"
          }
          <BPSelect
            onChange={onFieldSubmit}
            minimal
            value="hey"
            options={["hey", "you", "guys"]}
            name={"inlineselectField"}
            inlineLabel={inlineLabels}
            label="minimal <BPSelect/> with inlineLabel = true"
          />
          <SelectField
            onFieldSubmit={onFieldSubmit}
            options={[1, 2, 4]}
            name={"selectFieldWithNumbers"}
            inlineLabel={inlineLabels}
            label="<SelectField/> with number values passed in simplified options obj"
          />
          <SelectField
            onFieldSubmit={onFieldSubmit}
            options={["hey", "you", "guys"]}
            name={"selectFieldWithDefaultValue"}
            inlineLabel={inlineLabels}
            defaultValue={"you"}
            disabled
            label="<SelectField/> with defaultValue"
          />
          <br></br>
          {giveDefaultSelectValueComp}
          <SelectField
            onFieldSubmit={onFieldSubmit}
            options={["hey", "you", "guys"]}
            name={"selectFieldWithPlaceholderAndInitiallyUnsetDefault"}
            inlineLabel={inlineLabels}
            defaultValue={giveDefaultSelectValue}
            placeholder="Choose one of the following..."
            label="<SelectField/> with initially unset defaultValue and a placeholder"
          />
          <SelectField
            options={["hey", "you", "guys"]}
            name={"selectFieldWithPlaceholder"}
            inlineLabel={inlineLabels}
            onFieldSubmit={onFieldSubmit}
            placeholder={"Please choose..."}
            label="<SelectField/> Simple With Placeholder"
          />
          <SelectField
            options={["hey", "you", "guys"]}
            name={"selectFieldWithUntouchedErrors"}
            inlineLabel={inlineLabels}
            onFieldSubmit={onFieldSubmit}
            showErrorIfUntouched
            placeholder={"Please choose..."}
            label="<SelectField/> With Untouched Errors"
          />
          <SelectField
            onFieldSubmit={onFieldSubmit}
            options={[
              {
                label: "hey",
                value: { tree: "trunk" }
              },
              {
                label: "there",
                value: "12312asd"
              },
              { label: "you", value: { tree: "graph" } },
              { label: "guys", value: { tree: "chart" } }
            ]}
            name={"selectFieldWithLabelAndValue"}
            inlineLabel={inlineLabels}
            label="<SelectField/> with name and value, supporting json values"
          />
          <DateInputField
            name={"dateInputField"}
            inlineLabel={inlineLabels}
            label="Date Input <DateInputField/>"
            onFieldSubmit={onFieldSubmit}
            defaultValue={new Date()}
          />
          <DateRangeInputField
            name={"dateRangeInputField"}
            inlineLabel={inlineLabels}
            label="Date Range Input <DateRangeInputField/>"
            onFieldSubmit={onFieldSubmit}
            minDate={new Date()}
            maxDate={
              new Date(new Date().setFullYear(new Date().getFullYear() + 1000))
            }
          />
          <CheckboxField
            onFieldSubmit={onFieldSubmit}
            defaultValue
            tooltipInfo={"I am some info!"}
            name={"CheckboxField"}
            inlineLabel={inlineLabels}
            label="<CheckboxField/>"
          />
          <CheckboxField
            onFieldSubmit={onFieldSubmit}
            defaultValue
            name={"CheckboxField 2"}
            inlineLabel={inlineLabels}
            label={
              <span>
                CheckboxField Label and Icon <Icon icon="tick" />
              </span>
            }
          />
          <SwitchField
            onFieldSubmit={onFieldSubmit}
            defaultValue
            tooltipInfo="pass a beforeOnChange prop to do work before allowing a change (also works for checkboxes)"
            name={"SwitchFieldwconf"}
            beforeOnChange={async val => {
              if (!val) {
                const keepGoing = await showConfirmationDialog({
                  text: "Are you sure???",
                  intent: "danger" //applied to the right most confirm button
                });
                return { stopEarly: !keepGoing };
              }
              return;
            }}
            inlineLabel={inlineLabels}
            label="W/ Confirmation"
          />
          <SwitchField
            onFieldSubmit={onFieldSubmit}
            defaultValue
            tooltipInfo="zooonk i'm some helper info!"
            name={"SwitchField"}
            inlineLabel={inlineLabels}
            label="I'm a <SwitchField/>"
          />
          <SwitchField
            onFieldSubmit={onFieldSubmit}
            defaultValue
            name={"SwitchField2"}
            inlineLabel={inlineLabels}
            label="I'm a <SwitchField/> "
          />
          <TextareaField
            isRequired
            name={"textAreaField"}
            inlineLabel={inlineLabels}
            onFieldSubmit={onFieldSubmit}
            label="TextareaField"
            placeholder="Enter notes..."
          />

          <TextareaField
            clickToEdit
            name={"textAreaFieldWithClickToEdit"}
            inlineLabel={inlineLabels}
            onFieldSubmit={onFieldSubmit}
            label="TextareaField with clickToEdit=true"
            placeholder="Enter notes..."
          />
          <TextareaField
            clickToEdit
            disabled
            name={"textAreaFieldWithClickToEditAndDisabled"}
            inlineLabel={inlineLabels}
            onFieldSubmit={onFieldSubmit}
            label="<TextareaField/> with clickToEdit=true and disabled"
            placeholder="Enter notes..."
          />
          <EditableTextField
            name={"editableTextField"}
            inlineLabel={inlineLabels}
            onFieldSubmit={onFieldSubmit}
            label="<EditableTextField/>"
            placeholder="Enter new text..."
          />
          <SuggestField
            name="suggestField"
            inlineLabel={inlineLabels}
            label="SuggestField Collaborators"
            options={[
              "Rodrigo Pavez aoiwjefoiawjfiojawe faowijefoiajwefoijawf woaiefjawoie",
              "Ximena Morales",
              "Kyle Craft",
              "Sam Denicola",
              "Tom Ogasawara Og Og Og"
            ]}
          />

          <ReactSelectField
            name="reactSelectField"
            resetOnSelect
            disallowClear={reactSelectFielddisallowClear}
            inlineLabel={inlineLabels}
            label="ReactSelectField Collaborators"
            placeholder="This has a long placeholder, wow, I hope it fits"
            onFieldSubmit={onFieldSubmit}
            noResultsText="I'm custom not found text!"
            creatable={reactSelectFieldcreatable}
            options={[
              {
                label: (
                  <div style={{ display: "flex" }}>
                    Rodrigo Pavez aoiwjefoiawjfiojawe faowijefoiajwefoijawf
                    woaiefjawoieRodrigo Pavez aoiwjefoiawjfiojawe
                    faowijefoiajwefoijawf woaiefjawoieRodrigo Pavez
                    aoiwjefoiawjfiojawe faowijefoiajwefoijawf
                    woaiefjawoieRodrigo Pavez aoiwjefoiawjfiojawe
                    faowijefoiajwefoijawf woaiefjawoieRodrigo Pavez
                    aoiwjefoiawjfiojawe faowijefoiajwefoijawf
                    woaiefjawoieRodrigo Pavez aoiwjefoiawjfiojawe
                    faowijefoiajwefoijawf woaiefjawoie{" "}
                    <div>I'm a reallllly long label.. doh</div>
                  </div>
                ),
                value: { name: "Rodrigo Pavez", id: "123" }
              },
              { label: "Ximena Morales", value: "Ximena Morales" },
              { label: "Kyle Craft", value: "Kyle Craft" },
              { label: "Sam Denicola", value: "Sam Denicola" },
              { label: "Tom Ogasawara Og Og Og", value: "Tom Ogasawara" }
            ]}
          />
          <ReactSelectField
            name="reactSelectFieldCustomLabel"
            inlineLabel={inlineLabels}
            label="ReactSelectField Custom Label"
            onFieldSubmit={onFieldSubmit}
            creatable={reactSelectFieldcreatable}
            options={["hah", "yah", "nope", "yep"].map((type, i) => {
              return {
                value: type,
                label: (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: 10
                    }}
                  >
                    <Icon icon="chat" />
                    <div
                      style={{
                        // background: featureColors[type], add back in if we want colors. import from vesequtils
                        height: 15,
                        width: 15,
                        marginRight: 5
                      }}
                    />
                    {type}
                  </div>
                )
              };
            })}
          />
          <ReactSelectField
            name="reactSelectFieldMulti"
            inlineLabel={inlineLabels}
            label="<ReactSelectField/> Collaborators Multi"
            onFieldSubmit={onFieldSubmit}
            resetOnSelect
            creatable={reactSelectFieldcreatable}
            multi
            defaultValue={["Ximena Morales", "Sam Denicola"]}
            options={[
              {
                label: "Rodrigo Pavez",
                value: { name: "Rodrigo Pavez", id: "123" }
              },
              {
                label: "Ximena Morales",
                value: "Ximena Morales",
                disabled: true
              },
              { label: "Kyle Craft", value: "Kyle Craft" },
              { label: "Sam Denicola", value: "Sam Denicola" },
              { label: "Tom Ogasawara", value: "Tom Ogasawara" }
            ]}
          />
          <ReactSelectField
            name="reactSelectFieldDisabled"
            inlineLabel={inlineLabels}
            label="ReactSelectField Disabled"
            onFieldSubmit={onFieldSubmit}
            multi
            disabled
            defaultValue={["Ximena Morales"]}
            options={[
              {
                label: "Rodrigo Pavez",
                value: { name: "Rodrigo Pavez", id: "123" }
              },
              {
                label: "Ximena Morales",
                value: "Ximena Morales"
              },
              { label: "Kyle Craft", value: "Kyle Craft" },
              { label: "Sam Denicola", value: "Sam Denicola" },
              { label: "Tom Ogasawara", value: "Tom Ogasawara" }
            ]}
          />
          <ReactColorField
            name="reactColorField"
            inlineLabel={inlineLabels}
            label="ReactColorField"
            onFieldSubmit={onFieldSubmit}
          />
          <Button
            intent="success"
            text="Submit Form"
            onClick={handleSubmit(function (formData) {
              console.info("submitted data:", formData);
            })}
          />
        </DemoWrapper>
      </div>
    </Provider>
  );
}
const validate = values => {
  const errors = {};
  if (!values.inputField) {
    errors.inputField = "required";
  }
  if (!values.untouchedSelect) {
    errors.untouchedSelect = "required";
  }
  if (!values.inputFieldWithTooltipError) {
    errors.inputFieldWithTooltipError = "required";
  }
  if (!values.reactSelectField) {
    errors.reactSelectField = "required";
  }
  if (values.dateInputField > new Date().setDate(new Date().getDate() + 10)) {
    errors.dateInputField = "date too big";
  }
  return errors;
};

export default reduxForm({
  form: "demoForm",
  validate,
  initialValues: {
    radioGroup: false
  }
})(FormComponentsDemo);

function onFieldSubmit(val) {
  console.info("on field submit", val);
}

window.__showGenerateDefaultDot = () => {
  return true;
};
