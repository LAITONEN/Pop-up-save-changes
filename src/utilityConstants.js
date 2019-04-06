export const DATA_TYPES = {
  JS: {
    ARRAY: 'array',
    DATA: 'data',
    FUNCTION: 'function',
    NUMBER: 'number',
    OBJECT: 'object',
    STRING: 'string',
    NULL: 'null',
    UNDEFINED: 'undefined',
  },
  TS: {
    ARRAY_OF: (dataType) => `${dataType}[]`,
  },
  CUSTOM: {
    DECIMAL: 'decimal',
    INTEGER: 'integer',
    NAN: 'nan',
  }
}

export const DELIMITERS = {
  OR: ' or '
}
