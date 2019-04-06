export const DISPLAY_RESULTS = {
  BY_DIALOG: 'BY_DIALOG',
  BY_TYPE: 'BY_TYPE',

}

export const ELEMENTS = {
  BUTTONS: 'buttons',
  DIALOG: 'dialog',
  SNACKBAR: 'snackbar',
}

export const COLUMN = {
  CONSTANTS: {
    AVERAGE_TIME: 'AVERAGE_TIME',
    PRIMARY_TEXT: 'PRIMARY_TEXT',
    SAVED: 'SAVED',
    SECONDARY_TEXT: 'SECONDARY_TEXT',
    TIME: 'TIME',
    TOTAL: 'TOTAL',
    TYPE: 'TYPE'
  },
  NAMES: {
    AVERAGE_TIME: 'Average Time',
    PRIMARY_TEXT: 'Primary Text',
    SAVED: 'Saved',
    SECONDARY_TEXT: 'Secondary Text',
    TIME: 'Time',
    TOTAL: 'Total',
    TYPE: 'Type'
  },
  // use constants from COLUMN.NAMES instead of hardcoding?
  ORDERS: {
    BY_DIALOG: ['Type', 'Primary Text', 'Secondary Text', 'Saved', 'Time'],
    BY_TYPE: ['Type', 'Total', 'Saved', 'Average Time']
  },
  TYPES: {
    BODY: 'Body',
    HEADER: 'Header',
  }
}
