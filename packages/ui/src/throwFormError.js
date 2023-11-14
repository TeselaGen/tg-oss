import { SubmissionError } from "redux-form";

export const throwFormError = error => {
  if (error.message) {
    console.error("error:", error);
  }
  const errorToUse = error.message
    ? { _error: error.message }
    : typeof error === "string"
    ? { _error: error }
    : error;
  if (!errorToUse._error) {
    errorToUse._error = "Error Submitting Form";
  }
  throw new SubmissionError(errorToUse);
};
