import React from "react";
import { InputField, TextareaField } from "@teselagen/ui";
import { reduxForm } from "redux-form";
import withEditorProps from "../../withEditorProps";
import { compose } from "recompose";
import {
  EditAvailabilityItem,
  EditCircularityItem,
  EditReadOnlyItem
} from "../../StatusBar";

class GeneralProperties extends React.Component {
  updateSeqDesc = val => {
    return this.props.sequenceDescriptionUpdate(val);
  };
  render() {
    const {
      readOnly,
      showReadOnly = true,
      isProtein,
      disableSetReadOnly,
      sequenceData,
      onSave,
      showAvailability,
      beforeReadOnlyChange,
      editorName,
      disableBpEditing,
      sequenceNameUpdate
    } = this.props;
    const {
      description,
      name,
      isOligo,
      isRna,
      sequence = "",
      proteinSequence = ""
    } = sequenceData || {};
    return (
      <React.Fragment>
        <div className="ve-flex-row">
          <div className="ve-column-left bp3-label">Name</div>{" "}
          <div className="ve-column-right">
            <InputField
              disabled={readOnly}
              onFieldSubmit={val => {
                sequenceNameUpdate(val);
              }}
              name="name"
              enableReinitialize
              defaultValue={name}
            />{" "}
          </div>
        </div>

        {!isProtein && !isOligo && !isRna && (
          <div className="ve-flex-row circularLinearSelect">
            <div className="ve-column-left bp3-label">Circular/Linear</div>{" "}
            <div className="ve-column-right">
              {" "}
              <EditCircularityItem editorName={editorName} showCircularity />
            </div>
          </div>
        )}

        {showAvailability && (
          <div className="ve-flex-row">
            <div className="ve-column-left bp3-label">
              Material Availability
            </div>{" "}
            <div className="ve-column-right">
              {" "}
              <EditAvailabilityItem editorName={editorName} showAvailability />
            </div>
          </div>
        )}
        <div className="ve-flex-row">
          <div className="ve-column-left bp3-label">Length</div>{" "}
          <div className="ve-column-right">
            {" "}
            {isProtein ? proteinSequence.length : sequence.length}
          </div>
        </div>
        {showReadOnly && (
          <div className="ve-flex-row">
            <div className="ve-column-left bp3-label">Is Editable</div>{" "}
            <div className="ve-column-right">
              {" "}
              <EditReadOnlyItem
                beforeReadOnlyChange={beforeReadOnlyChange}
                editorName={editorName}
                onSave={onSave}
                disableBpEditing={disableBpEditing}
                disableSetReadOnly={disableSetReadOnly}
                showReadOnly={showReadOnly}
              />
            </div>
          </div>
        )}
        <div>Description</div>
        <TextareaField
          clickToEdit
          name="description"
          onFieldSubmit={this.updateSeqDesc}
          defaultValue={description}
          disabled={readOnly}
        />
      </React.Fragment>
    );
  }
}

export default compose(
  withEditorProps,
  reduxForm({
    form: "GeneralProperties"
  })
)(GeneralProperties);
