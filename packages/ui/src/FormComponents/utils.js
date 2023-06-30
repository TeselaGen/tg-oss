export const REQUIRED_ERROR = "This field is required.";

export const fieldRequired = value =>
  !value || (Array.isArray(value) && !value.length)
    ? REQUIRED_ERROR
    : undefined;
