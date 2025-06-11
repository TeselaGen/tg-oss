type OrderByClause<T = { id: string }> = {
  path?: string;
  direction?: "asc" | "desc";
  type?: string;
  sortFn?:
    | ((record: T) => unknown)
    | string
    | Array<((record: T) => unknown) | string>;
  getValueToFilterOn?: (record: T) => unknown;
};

export type OrderBy =
  | OrderByClause
  | OrderByClause[]
  | Record<string, "asc" | "desc">;
