import { simplifyHasuraWhere } from "./simplifyHasuraWhere";

describe("simplifyHasuraWhere", () => {
  it("should handle empty where clause", () => {
    expect(simplifyHasuraWhere({})).toEqual({});
  });

  it("should simplify simple _eq where clauses", () => {
    const input = { id: 123, name: "John Doe" };
    const expected = { id: { _eq: 123 }, name: { _eq: "John Doe" } };
    expect(simplifyHasuraWhere(input)).toEqual(expected);
  });

  it("should handle existing _eq where clauses without simplification", () => {
    const input = { id: { _eq: 123 }, name: { _eq: "John Doe" } };
    const expected = { id: { _eq: 123 }, name: { _eq: "John Doe" } };
    expect(simplifyHasuraWhere(input)).toEqual(expected);
  });

  it("should handle other Hasura operators", () => {
    const input = { age: { _gt: 30 }, isActive: { _eq: true } };
    const expected = { age: { _gt: 30 }, isActive: { _eq: true } };
    expect(simplifyHasuraWhere(input)).toEqual(expected);
  });

  it("should handle dot-nested where clauses", () => {
    const input = { "address.city": { _eq: "New York" }, "address.zip": 10001 };
    const expected = {
      address: { city: { _eq: "New York" }, zip: { _eq: 10001 } }
    };
    expect(simplifyHasuraWhere(input)).toEqual(expected);
  });

  it("should handle deeply nested dot-nested where clauses", () => {
    const input = { "nested.prop.value": { _eq: "test" } };
    const expected = { nested: { prop: { value: { _eq: "test" } } } };
    expect(simplifyHasuraWhere(input)).toEqual(expected);
  });

  it("should handle a mix of simple, nested, and operator clauses", () => {
    const input = {
      id: 123,
      name: "John Doe",
      "address.city": { _eq: "New York" },
      age: { _gt: 30 },
      "nested.prop.value": { _eq: "test" }
    };
    const expected = {
      id: { _eq: 123 },
      name: { _eq: "John Doe" },
      address: { city: { _eq: "New York" } },
      age: { _gt: 30 },
      nested: { prop: { value: { _eq: "test" } } }
    };
    expect(simplifyHasuraWhere(input)).toEqual(expected);
  });

  it("should handle already nested objects with operators", () => {
    const input = {
      address: {
        city: { _eq: "London" },
        country: "UK"
      }
    };
    const expected = {
      address: {
        city: { _eq: "London" },
        country: { _eq: "UK" }
      }
    };
    expect(simplifyHasuraWhere(input)).toEqual(expected);
  });
});
