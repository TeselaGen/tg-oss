// Basic unit tests without jest-dom setup
import { describe, test, expect } from "bun:test";
import { defaultValidators } from "./defaultValidators";

describe("defaultValidators", () => {
  describe("number validator", () => {
    const numberValidator = defaultValidators.number;

    test("should validate valid numbers", () => {
      expect(numberValidator(123, {})).toBeUndefined();
      expect(numberValidator(0, {})).toBeUndefined();
      expect(numberValidator(-123, {})).toBeUndefined();
      expect(numberValidator(123.45, {})).toBeUndefined();
    });

    test("should reject non-numeric strings", () => {
      expect(numberValidator("hello", {})).toBe("Must be a number");
      expect(numberValidator("abc123", {})).toBe("Must be a number");
      expect(numberValidator("", {})).toBeUndefined(); // empty values are allowed when not required
    });

    test("should reject NaN by default", () => {
      expect(numberValidator(NaN, {})).toBe("Must be a number");
    });

    test("should allow NaN when allowNaN is true", () => {
      expect(numberValidator(NaN, { allowNaN: true })).toBeUndefined();
    });

    test("should still reject non-numeric strings even with allowNaN", () => {
      expect(numberValidator("hello", { allowNaN: true })).toBe("Must be a number");
      expect(numberValidator("not a number", { allowNaN: true })).toBe("Must be a number");
    });

    test("should handle required field validation", () => {
      expect(numberValidator("", { isRequired: true })).toBe("Must be a number");
      expect(numberValidator(null, { isRequired: true })).toBe("Must be a number");
      expect(numberValidator(undefined, { isRequired: true })).toBe("Must be a number");
    });

    test("should allow empty values for non-required fields", () => {
      expect(numberValidator("", {})).toBeUndefined();
      expect(numberValidator(null, {})).toBeUndefined();
      expect(numberValidator(undefined, {})).toBeUndefined();
    });

    test("should reject numeric strings (only actual numbers allowed)", () => {
      expect(numberValidator("123", {})).toBe("Must be a number");
      expect(numberValidator("123.45", {})).toBe("Must be a number");
      expect(numberValidator("-123", {})).toBe("Must be a number");
    });

    test("should combine allowNaN with required field validation", () => {
      // Required field with allowNaN should still reject empty values
      expect(numberValidator("", { isRequired: true, allowNaN: true })).toBe("Must be a number");
      expect(numberValidator(null, { isRequired: true, allowNaN: true })).toBe("Must be a number");
      
      // But should allow NaN
      expect(numberValidator(NaN, { isRequired: true, allowNaN: true })).toBeUndefined();
    });
  });

  describe("string validator", () => {
    const stringValidator = defaultValidators.string;

    test("should allow any string for non-required fields", () => {
      expect(stringValidator("hello", {})).toBe(false);
      expect(stringValidator("", {})).toBe(false);
    });

    test("should reject empty strings for required fields", () => {
      expect(stringValidator("", { isRequired: true })).toBe("Please enter a value here");
      expect(stringValidator(null, { isRequired: true })).toBe("Please enter a value here");
      expect(stringValidator(undefined, { isRequired: true })).toBe("Please enter a value here");
    });

    test("should accept non-empty strings for required fields", () => {
      expect(stringValidator("hello", { isRequired: true })).toBeUndefined();
      expect(stringValidator("test", { isRequired: true })).toBeUndefined();
    });
  });

  describe("dropdown validator", () => {
    const dropdownValidator = defaultValidators.dropdown;
    const field = { values: ["option1", "option2", "option3"] };

    test("should accept valid dropdown values", () => {
      expect(dropdownValidator("option1", field)).toBeUndefined();
      expect(dropdownValidator("option2", field)).toBeUndefined();
      expect(dropdownValidator("option3", field)).toBeUndefined();
    });

    test("should reject invalid dropdown values", () => {
      expect(dropdownValidator("invalid", field)).toBe("Please choose one of the accepted values");
      expect(dropdownValidator("option4", field)).toBe("Please choose one of the accepted values");
    });

    test("should handle required dropdown fields", () => {
      expect(dropdownValidator("", { ...field, isRequired: true })).toBe("Please choose one of the accepted values");
      expect(dropdownValidator(null, { ...field, isRequired: true })).toBe("Please choose one of the accepted values");
    });

    test("should allow empty values for non-required dropdown fields", () => {
      expect(dropdownValidator("", field)).toBeUndefined();
      expect(dropdownValidator(null, field)).toBeUndefined();
    });
  });
});