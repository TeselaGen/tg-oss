import { filterLocalEntitiesToHasura } from "./filterLocalEntitiesToHasura";

describe("filterLocalEntitiesToHasura", () => {
  const records = [
    {
      id: 123,
      name: "John Doe",
      age: 30,
      is_active: true,
      city: "London",

      tags: ["programming", "javascript"],
      email: "john@example.com",
      data: { category: "A", type: "X" },
      username: "john123"
    },
    {
      id: 456,
      name: "Jane Smith",
      age: 25,
      is_active: false,
      city: "Paris",
      tags: ["javascript", "python"],
      email: null,
      data: { category: "B", type: "Y" },
      username: "jane456"
    },
    {
      id: 789,
      name: "Alice Johnson",
      age: 35,
      is_active: true,
      city: "London",
      tags: ["programming", "python", "java"],
      email: "alice@example.com",
      data: { category: "A", type: "Z" },
      username: "alice789"
    },
    {
      id: 101,
      name: "Bob Williams",
      age: 20,
      is_active: false,
      city: "New York",
      tags: ["java"],
      email: "bob@example.com",
      data: { category: "C", type: "X" },
      username: "bob101"
    }
  ];

  it("should filter by _eq", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { id: { _eq: 123 } }
    });
    expect(result.entities).toEqual([records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[0]]);
    expect(result.entityCount).toBe(1);
  });

  it("should filter by _neq", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { id: { _neq: 123 } }
    });
    expect(result.entities).toEqual(records.slice(1));
    expect(result.entitiesAcrossPages).toEqual(records.slice(1));
    expect(result.entityCount).toBe(3);
  });

  it("should filter by _gt", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { age: { _gt: 30 } }
    });
    expect(result.entities).toEqual([records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[2]]);
    expect(result.entityCount).toBe(1);
  });

  it("should filter by _gte", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { age: { _gte: 30 } }
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _lt", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { age: { _lt: 25 } }
    });
    expect(result.entities).toEqual([records[3]]);
    expect(result.entitiesAcrossPages).toEqual([records[3]]);
    expect(result.entityCount).toBe(1);
  });

  it("should filter by _lte", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { age: { _lte: 25 } }
    });
    expect(result.entities).toEqual([records[1], records[3]]);
    expect(result.entitiesAcrossPages).toEqual([records[1], records[3]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _like", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { name: { _like: "%John%" } }
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _ilike", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { name: { _ilike: "%john%" } }
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _nlike", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { name: { _nlike: "%John%" } }
    });
    expect(result.entities).toEqual([records[1], records[3]]);
    expect(result.entitiesAcrossPages).toEqual([records[1], records[3]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _nilike", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { name: { _nilike: "%john%" } }
    });
    expect(result.entities).toEqual([records[1], records[3]]);
    expect(result.entitiesAcrossPages).toEqual([records[1], records[3]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _starts_with", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { name: { _starts_with: "John" } }
    });
    expect(result.entities).toEqual([records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[0]]);
    expect(result.entityCount).toBe(1);
  });

  it("should filter by _ends_with", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { name: { _ends_with: "Doe" } }
    });
    expect(result.entities).toEqual([records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[0]]);
    expect(result.entityCount).toBe(1);
  });

  it("should filter by _is_null", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { email: { _is_null: true } }
    });
    expect(result.entities).toEqual([records[1]]);
    expect(result.entitiesAcrossPages).toEqual([records[1]]);
    expect(result.entityCount).toBe(1);
  });

  it("should filter by _is_null false", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { email: { _is_null: false } }
    });
    expect(result.entities).toEqual([records[0], records[2], records[3]]);
    expect(result.entitiesAcrossPages).toEqual([
      records[0],
      records[2],
      records[3]
    ]);
    expect(result.entityCount).toBe(3);
  });

  it("should filter by _and", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        _and: [{ age: { _gt: 25 } }, { city: { _eq: "London" } }]
      }
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _or", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        _or: [{ city: { _eq: "London" } }, { city: { _eq: "Paris" } }]
      }
    });
    expect(result.entities).toEqual([records[0], records[1], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([
      records[0],
      records[1],
      records[2]
    ]);
    expect(result.entityCount).toBe(3);
  });

  it("should filter by _not", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        _not: { is_active: { _eq: true } }
      }
    });
    expect(result.entities).toEqual([records[1], records[3]]);
    expect(result.entitiesAcrossPages).toEqual([records[1], records[3]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by _contains", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        tags: { _contains: ["programming", "javascript"] }
      }
    });
    expect(result.entities).toEqual([records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[0]]);
    expect(result.entityCount).toBe(1);
  });

  it("should filter by _contained_in", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        tags: { _contained_in: ["programming", "javascript", "python", "java"] }
      }
    });
    expect(result.entities).toEqual(records);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should filter by _has_key", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { data: { _has_key: "category" } }
    });
    expect(result.entities).toEqual(records);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should filter by _has_keys_any", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        data: { _has_keys_any: ["category", "missingKey"] }
      }
    });
    expect(result.entities).toEqual(records);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should filter by _has_keys_all", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        data: { _has_keys_all: ["category", "type"] }
      }
    });
    expect(result.entities).toEqual(records);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should filter by _similar", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        username: { _similar: "(john|alice)%" }
      }
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by range _gte and _lte", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { age: { _gte: 25, _lte: 30 } }
    });
    expect(result.entities).toEqual([records[0], records[1]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[1]]);
    expect(result.entityCount).toBe(2);
  });

  it("should filter by range _gt and _lt", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { age: { _gt: 25, _lt: 35 } }
    });
    expect(result.entities).toEqual([records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[0]]);
    expect(result.entityCount).toBe(1);
  });
  it("should filter with nested filters in _and and _or properly ", () => {
    const result = filterLocalEntitiesToHasura(
      [
        {
          id: 1,
          type: {
            special: "01"
          }
        },
        {
          id: 2,
          type: {
            special: "02"
          }
        }
      ],
      {
        where: {
          _and: [
            {
              type: {
                special: {
                  _ilike: "%01%"
                }
              }
            }
          ],
          _or: []
        }
      }
    );
    expect(result.entities).toEqual([
      {
        id: 1,
        type: {
          special: "01"
        }
      }
    ]);
    expect(result.entitiesAcrossPages).toEqual([
      {
        id: 1,
        type: {
          special: "01"
        }
      }
    ]);
    expect(result.entityCount).toBe(1);
  });

  it("should handle empty where clause", () => {
    const result = filterLocalEntitiesToHasura(records, {});
    expect(result.entities).toEqual(records);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });
  it("should handle empty _and and _or clauses", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { _and: [], _or: [] }
    });
    expect(result.entities).toEqual(records);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should handle nested _and and _or", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: {
        _and: [
          { _or: [{ city: { _eq: "London" } }, { city: { _eq: "Paris" } }] },
          { age: { _gt: 20 } }
        ]
      }
    });
    expect(result.entities).toEqual([records[0], records[1], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([
      records[0],
      records[1],
      records[2]
    ]);
    expect(result.entityCount).toBe(3);
  });
  it("should order by age ascending and put null vals last by default", () => {
    const result = filterLocalEntitiesToHasura(
      [{ id: 111, name: "Null Age", age: null, city: "Unknown" }, ...records],
      {
        order_by: { age: "asc" }
      }
    );
    expect(result.entities).toEqual([
      records[3],
      records[1],
      records[0],
      records[2],
      { id: 111, name: "Null Age", age: null, city: "Unknown" }
    ]);
    expect(result.entitiesAcrossPages).toEqual([
      records[3],
      records[1],
      records[0],
      records[2],
      { id: 111, name: "Null Age", age: null, city: "Unknown" }
    ]);
    expect(result.entityCount).toBe(5);
  });
  it("should order by age desc and put null/undefined vals last by default", () => {
    const result = filterLocalEntitiesToHasura(
      [
        { id: 111, name: "Null Age", age: null, city: "Unknown" },
        { id: 1121, name: "Undefined Age", age: undefined, city: "Unknown" },
        ...records
      ],
      {
        order_by: { age: "desc" }
      }
    );
    expect(result.entities).toEqual([
      records[2],
      records[0],
      records[1],
      records[3],
      { id: 111, name: "Null Age", age: null, city: "Unknown" },
      { id: 1121, name: "Undefined Age", age: undefined, city: "Unknown" }
    ]);
    expect(result.entityCount).toBe(6);
  });

  it.only("should order by updatedAt descending, putting null/undefined vals last ", () => {
    const result = filterLocalEntitiesToHasura(
      [
        {
          name: "-10_signal",
          color: "#4ECDC4",
          isGenbankStandardType: true,
          __typename: "featureTypeOverride"
        },
        {
          name: "-35_signal",
          color: "#F7FFF7",
          isGenbankStandardType: true,
          __typename: "featureTypeOverride"
        },
        {
          name: "3'clip",
          color: "#FF6B6B",
          isGenbankStandardType: true,
          __typename: "featureTypeOverride"
        },
        {
          name: "3'UTR",
          color: "#FFE66D",
          isGenbankStandardType: true,
          __typename: "featureTypeOverride"
        },

        {
          __typename: "featureTypeOverride",
          id: "33a90fcb-fc26-406f-a6d5-41ac4ba8ea64",
          name: "lalala",
          description: null,
          color: "#81bb41",
          genbankEquivalentType: null,
          updatedAt: "2025-06-03T01:02:24.737499+00:00",
          isHidden: false,
          isCustomType: true
        }
      ],
      {
        order_by: [{ updatedAt: "desc" }]
      }
    );
    expect(result.entities).toEqual([
      {
        __typename: "featureTypeOverride",
        id: "33a90fcb-fc26-406f-a6d5-41ac4ba8ea64",
        name: "lalala",
        description: null,
        color: "#81bb41",
        genbankEquivalentType: null,
        updatedAt: "2025-06-03T01:02:24.737499+00:00",
        isHidden: false,
        isCustomType: true
      },
      {
        name: "-10_signal",
        color: "#4ECDC4",
        isGenbankStandardType: true,
        __typename: "featureTypeOverride"
      },
      {
        name: "-35_signal",
        color: "#F7FFF7",
        isGenbankStandardType: true,
        __typename: "featureTypeOverride"
      },
      {
        name: "3'clip",
        color: "#FF6B6B",
        isGenbankStandardType: true,
        __typename: "featureTypeOverride"
      },
      {
        name: "3'UTR",
        color: "#FFE66D",
        isGenbankStandardType: true,
        __typename: "featureTypeOverride"
      }
    ]);
  });
  it("should order by age descending, putting null/undefined vals last ", () => {
    const result = filterLocalEntitiesToHasura(
      [
        { id: 111, name: "Null Age", age: null, city: "Unknown" },
        { id: 1121, name: "Undefined Age", age: undefined, city: "Unknown" },
        ...records
      ],
      {
        order_by: { age: "desc" }
      }
    );
    expect(result.entities).toEqual([
      records[2],
      records[0],
      records[1],
      records[3],
      { id: 111, name: "Null Age", age: null, city: "Unknown" },
      { id: 1121, name: "Undefined Age", age: undefined, city: "Unknown" }
    ]);
  });

  it("should order by name ascending", () => {
    const result = filterLocalEntitiesToHasura(records, {
      order_by: { name: "asc" }
    });
    expect(result.entities).toEqual([
      records[2],
      records[3],
      records[1],
      records[0]
    ]);
    expect(result.entitiesAcrossPages).toEqual([
      records[2],
      records[3],
      records[1],
      records[0]
    ]);
    expect(result.entityCount).toBe(4);
  });

  it("should order by name descending", () => {
    const result = filterLocalEntitiesToHasura(records, {
      order_by: { name: "desc" }
    });
    expect(result.entities).toEqual([
      records[0],
      records[1],
      records[3],
      records[2]
    ]);
    expect(result.entitiesAcrossPages).toEqual([
      records[0],
      records[1],
      records[3],
      records[2]
    ]);
    expect(result.entityCount).toBe(4);
  });

  it("should filter and order", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { city: { _eq: "London" } },
      order_by: { age: "desc" }
    });
    expect(result.entities).toEqual([records[2], records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[2], records[0]]);
    expect(result.entityCount).toBe(2);
  });

  it("should handle empty order_by", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { city: { _eq: "London" } }
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should handle order_by with empty where", () => {
    const result = filterLocalEntitiesToHasura(records, {
      order_by: { age: "asc" }
    });
    expect(result.entities).toEqual([
      records[3],
      records[1],
      records[0],
      records[2]
    ]);
    expect(result.entitiesAcrossPages).toEqual([
      records[3],
      records[1],
      records[0],
      records[2]
    ]);
    expect(result.entityCount).toBe(4);
  });

  it("should apply limit", () => {
    const result = filterLocalEntitiesToHasura(records, { limit: 2 });
    expect(result.entities).toEqual([records[0], records[1]]);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should apply offset", () => {
    const result = filterLocalEntitiesToHasura(records, { offset: 2 });
    expect(result.entities).toEqual([records[2], records[3]]);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should apply limit and offset", () => {
    const result = filterLocalEntitiesToHasura(records, {
      limit: 1,
      offset: 2
    });
    expect(result.entities).toEqual([records[2]]);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should apply limit to filtered results", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { city: { _eq: "London" } },
      limit: 1
    });
    expect(result.entities).toEqual([records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should apply offset to filtered results", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { city: { _eq: "London" } },
      offset: 1
    });
    expect(result.entities).toEqual([records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });
  it("should order order well names properly, aka names a1, a11, a2, a3 should be sorted a1, a2, a3, a11", () => {
    const recordsWithNames = [
      { id: 1, name: "a1" },
      { id: 2, name: "a11" },
      { id: 3, name: "a2" },
      { id: 4, name: "a3" }
    ];
    const result = filterLocalEntitiesToHasura(recordsWithNames, {
      order_by: { name: "asc" }
    });
    expect(result.entities).toEqual([
      recordsWithNames[0], // a1
      recordsWithNames[2], // a2
      recordsWithNames[3], // a3
      recordsWithNames[1] // a11
    ]);
    expect(result.entityCount).toBe(4);
  });
  it("should order by multiple fields (age asc, name desc)", () => {
    // Make two of the ages the same for testing secondary sort
    const modifiedRecords = [
      records[1], // Jane Smith, age 25
      { ...records[0], age: 25 }, // John Doe, age 25
      records[2], // Alice Johnson, age 35
      records[3] // Bob Williams, age 20
    ];
    const result = filterLocalEntitiesToHasura(modifiedRecords, {
      order_by: [{ age: "asc" }, { name: "desc" }]
    });
    expect(result.entities).toEqual([
      modifiedRecords[3], // age 20, name "Bob Williams"
      modifiedRecords[1], // age 25, name "John Doe" (name desc)
      modifiedRecords[0], // age 25, name "Jane Smith"
      modifiedRecords[2] // age 35, name "Alice Johnson"
    ]);
    expect(result.entityCount).toBe(4);
  });
  it("should apply limit and offset to filtered and ordered results", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { city: { _eq: "London" } },
      order_by: { age: "desc" },
      limit: 1,
      offset: 1
    });
    expect(result.entities).toEqual([records[0]]);
    expect(result.entitiesAcrossPages).toEqual([records[2], records[0]]);
    expect(result.entityCount).toBe(2);
  });

  it("should handle offset greater than array length", () => {
    const result = filterLocalEntitiesToHasura(records, { offset: 10 });
    expect(result.entities).toEqual([]);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should handle limit greater than array length", () => {
    const result = filterLocalEntitiesToHasura(records, { limit: 10 });
    expect(result.entities).toEqual(records);
    expect(result.entitiesAcrossPages).toEqual(records);
    expect(result.entityCount).toBe(4);
  });

  it("should handle isInfinite option with filtering", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { city: { _eq: "London" } },
      isInfinite: true
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });

  it("should handle isInfinite option with filtering, limit, and offset", () => {
    const result = filterLocalEntitiesToHasura(records, {
      where: { city: { _eq: "London" } },
      limit: 1,
      offset: 1,
      isInfinite: true
    });
    expect(result.entities).toEqual([records[0], records[2]]);
    expect(result.entitiesAcrossPages).toEqual([records[0], records[2]]);
    expect(result.entityCount).toBe(2);
  });
});
