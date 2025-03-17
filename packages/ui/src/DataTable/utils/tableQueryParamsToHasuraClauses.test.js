import { tableQueryParamsToHasuraClauses } from "./tableQueryParamsToHasuraClauses";

describe("tableQueryParamsToHasuraClauses", () => {
  const schema = {
    fields: [
      { path: "name", type: "string" },
      { path: "age", type: "number" },
      { path: "isActive", type: "boolean" },
      { path: "email", type: "string" }
    ]
  };

  it("should handle empty query params", () => {
    const result = tableQueryParamsToHasuraClauses({});
    expect(result).toEqual({
      where: {},
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle page and pageSize", () => {
    const result = tableQueryParamsToHasuraClauses({ page: 2, pageSize: 10 });
    expect(result).toEqual({
      where: {},
      order_by: {},
      limit: 10,
      offset: 10
    });
  });

  it("should handle searchTerm with string fields", () => {
    const result = tableQueryParamsToHasuraClauses({
      searchTerm: "test",
      schema
    });
    expect(result).toEqual({
      where: {
        _or: [{ name: { _ilike: "%test%" } }, { email: { _ilike: "%test%" } }]
      },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle searchTerm with number fields", () => {
    const result = tableQueryParamsToHasuraClauses({
      searchTerm: "30",
      schema
    });
    expect(result).toEqual({
      where: {
        _or: [
          { name: { _ilike: "%30%" } },
          { age: { _eq: 30 } },
          { email: { _ilike: "%30%" } }
        ]
      },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle searchTerm with boolean fields", () => {
    const result = tableQueryParamsToHasuraClauses({
      searchTerm: "true",
      schema
    });
    expect(result).toEqual({
      where: {
        _or: [
          { name: { _ilike: "%true%" } },
          { isActive: { _eq: true } },
          { email: { _ilike: "%true%" } }
        ]
      },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle searchTerm with multiple field types", () => {
    const result = tableQueryParamsToHasuraClauses({
      searchTerm: "test",
      schema
    });
    expect(result).toEqual({
      where: {
        _or: [{ name: { _ilike: "%test%" } }, { email: { _ilike: "%test%" } }]
      },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle textContains filter", () => {
    const result = tableQueryParamsToHasuraClauses({
      filters: [
        {
          selectedFilter: "textContains",
          filterOn: "name",
          filterValue: "test"
        }
      ]
    });
    expect(result).toEqual({
      where: { _and: [{ name: { _ilike: "%test%" } }] },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle textEquals filter", () => {
    const result = tableQueryParamsToHasuraClauses({
      filters: [
        { selectedFilter: "textEquals", filterOn: "name", filterValue: "test" }
      ]
    });
    expect(result).toEqual({
      where: { _and: [{ name: { _eq: "test" } }] },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle numberEquals filter", () => {
    const result = tableQueryParamsToHasuraClauses({
      filters: [
        { selectedFilter: "numberEquals", filterOn: "age", filterValue: "30" }
      ]
    });
    expect(result).toEqual({
      where: { _and: [{ age: { _eq: 30 } }] },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });

  it("should handle order", () => {
    const result = tableQueryParamsToHasuraClauses({ order: ["name", "-age"] });
    expect(result).toEqual({
      where: {},
      order_by: { name: "asc", age: "desc" },
      limit: 25,
      offset: 0
    });
  });

  it("should combine all params", () => {
    const result = tableQueryParamsToHasuraClauses({
      page: 2,
      pageSize: 10,
      searchTerm: "test",
      filters: [
        {
          selectedFilter: "numberGreaterThan",
          filterOn: "age",
          filterValue: "30"
        }
      ],
      order: ["name"],
      schema
    });
    expect(result).toEqual({
      where: {
        _and: [
          {
            _or: [
              { name: { _ilike: "%test%" } },
              { email: { _ilike: "%test%" } }
            ]
          },
          { age: { _gt: 30 } }
        ]
      },
      order_by: { name: "asc" },
      limit: 10,
      offset: 10
    });
  });

  it("should combine searchTerm and filters", () => {
    const result = tableQueryParamsToHasuraClauses({
      searchTerm: "test",
      filters: [
        {
          selectedFilter: "numberGreaterThan",
          filterOn: "age",
          filterValue: "30"
        }
      ],
      schema
    });
    expect(result).toEqual({
      where: {
        _and: [
          {
            _or: [
              { name: { _ilike: "%test%" } },
              { email: { _ilike: "%test%" } }
            ]
          },
          { age: { _gt: 30 } }
        ]
      },
      order_by: {},
      limit: 25,
      offset: 0
    });
  });
});
