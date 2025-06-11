type SharedFields = {
  _isClean?: boolean;
};

export type Entity = (
  | {
      id?: string | number;
    }
  | {
      code?: string;
    }
) &
  SharedFields;
