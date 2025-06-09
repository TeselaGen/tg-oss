/* eslint-disable @typescript-eslint/no-empty-function */

import {
  editorDragStarted,
  handleSelectionEndGrabbed
} from "../src/withEditorInteractions/clickAndDragUtils"; // Adjust path if needed

describe("handleSelectionEndGrabbed", () => {
  it("handleSelectionEndGrabbed will still update selection layer even if there isn't one yet", async () => {
    let newCaretValue;
    editorDragStarted({
      caretPositionOnDragStart: 10,
      selectionStartOrEndGrabbed: "end"
    });
    handleSelectionEndGrabbed({
      selectionLayer: { start: 10, end: 20 },
      nearestCaretPos: 10,
      sequenceLength: 30,
      doNotWrapOrigin: true,
      caretPositionUpdate: newCaret => {
        newCaretValue = newCaret;
      }
    });
    expect(newCaretValue).toBe(10);
  });

  it("handleSelectionEndGrabbed removes selection and updates caret when doNotWrapOrigin=true and nearestCaretPos===selectionLayerStart", async () => {
    let newCaretValue;
    editorDragStarted({
      caretPositionOnDragStart: 10,
      selectionStartOrEndGrabStart: "end"
    });
    handleSelectionEndGrabbed({
      selectionLayer: { start: 10, end: 20 },
      nearestCaretPos: 10,
      sequenceLength: 30,
      doNotWrapOrigin: true,
      caretPositionUpdate: newCaret => {
        newCaretValue = newCaret;
      }
    });
    expect(newCaretValue).toBe(10);
  });

  it("handleSelectionEndGrabbed selects till end when selection is exactly at the end", async () => {
    let newSelectionValue;
    editorDragStarted({
      caretPositionOnDragStart: 10,
      selectionStartOrEndGrabbed: "end"
    });
    handleSelectionEndGrabbed({
      selectionLayer: { start: 10, end: 20 },
      nearestCaretPos: 30,
      sequenceLength: 30,
      doNotWrapOrigin: false,
      selectionLayerUpdate: newSelection => {
        newSelectionValue = newSelection;
      }
    });
    expect(newSelectionValue.start).toBe(10);
    expect(newSelectionValue.end).toBe(29);
  });

  it("handleSelectionEndGrabbed selects till end when selection is way past the end", async () => {
    let newSelectionValue;
    editorDragStarted({
      caretPositionOnDragStart: 10,
      selectionStartOrEndGrabbed: "end"
    });
    handleSelectionEndGrabbed({
      selectionLayer: { start: 10, end: 20 },
      nearestCaretPos: 350,
      sequenceLength: 30,
      doNotWrapOrigin: false,
      selectionLayerUpdate: newSelection => {
        newSelectionValue = newSelection;
      }
    });
    expect(newSelectionValue.start).toBe(10);
    expect(newSelectionValue.end).toBe(29);
  });

  it("handleSelectionEndGrabbed selects till end when selection is just past the end", async () => {
    let newSelectionValue;
    editorDragStarted({
      caretPositionOnDragStart: 10,
      selectionStartOrEndGrabbed: "end"
    });
    handleSelectionEndGrabbed({
      selectionLayer: { start: 10, end: 20 },
      nearestCaretPos: 31,
      sequenceLength: 30,
      doNotWrapOrigin: false,
      selectionLayerUpdate: newSelection => {
        newSelectionValue = newSelection;
      }
    });
    expect(newSelectionValue.start).toBe(10);
    expect(newSelectionValue.end).toBe(29);
  });
});
