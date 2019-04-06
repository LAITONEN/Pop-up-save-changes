import React from 'react';
import u from 'updeep'
import _ from 'lodash'
import * as MUI from '@material-ui/core'

import { COLUMN, DISPLAY_RESULTS } from './CONSTANTS';
import { average, convert, homonymous, CONSTANT_KEY, typeOf, humanCase } from './utilities';

const { BY_DIALOG, BY_TYPE } = DISPLAY_RESULTS
const { CONSTANTS, NAMES, TYPES } = COLUMN
const { AVERAGE_TIME, TIME, TOTAL, PRIMARY_TEXT, SAVED, SECONDARY_TEXT, TYPE } = CONSTANTS
const { BODY, HEADER } = TYPES

// TO DO
// 1. format results data to fit the schema of this component
// 2. figure out how to get getTableBodyCells
// 3. arrange functions to be grouped by results.format and table cell type (header / body)

// results: { content: { title, desc }, time, type }
// columnTitles = used for 

class Table extends React.Component {

  state = {
    column: {
      title: {
        constants: [], // TITLE_CONSTANTS
        order: [], // Title Keys
        values: [], // Title Keys (picked based on table.format)
      }
    },
    rows: [],
  }

  componentDidMount = () => this.updateTable()

  updateState = (spacePath, value, callback) => {
    const newState = u.updateIn(spacePath, value, this.state)
    this.setState(newState, callback)
  }

  updateTable = () => {
    let rowsData = this.composeRowsData(this.props.results.data)
    // let newState = u.update(this.composeColumnObject(stateRowsUpdate), this.state)
    this.updateState('rows', rowsData)
  }

  /**
   * Compose data for each possible column of the table. Called once per component lifecycle after the mount.
   */
  composeRowsData = (results) => {
    let rowsData = results.reduce((res, v) => {
      const row = this.getRowValues(v)
      res.push(row)
      return res
    }, [])
    return rowsData
  }

  /**
   * @returns {object} row object with possible column titles as keys and values as values
   */
  getRowValues = (rowData, tableFormat) => ({
    [PRIMARY_TEXT]: rowData.content.primaryText,
    [SAVED]: _.startCase(String(rowData.saved)),
    [SECONDARY_TEXT]: rowData.content.secondaryText,
    [TIME]: rowData.time,
    [TOTAL]: 1,
    [TYPE]: humanCase(rowData.type),
  })

  groupRowValues = (res, row, index, grouppedRows) => ({
    ...res,
    TIME: res[TIME] + row[TIME],
    SAVED: res[SAVED] + (convert.to.boolean(row[SAVED]) ? 1 : 0)
  })

  setColumnTitles = (results) => {
    if (results.format === BY_TYPE) {
      const newState = u.updateIn('columns.title', COLUMN.ORDERS.BY_TYPE, this.state)
      this.setState(newState)
    }
    if (results.format === BY_DIALOG) {
      const newState = u.updateIn('columns.title', COLUMN.ORDERS.BY_DIALOG, this.state)
      this.setState(newState)
    }
  }


  groupDialogsByType = (dialogsData) => {
    const grouppedDialogs = _.groupBy(dialogsData, v => v[TYPE])
    return this.mergeArrayCellValues(grouppedDialogs)
  }

  mergeArrayCellValues = (grouppedDialogs) => {
    return Object.entries(grouppedDialogs).reduce((res, [type, dialogsGroup]) => {
      if (!Array.isArray(dialogsGroup)) throw Error(`Expected cellValues to be an array, but instead got ${dialogsGroup}.`)
      res = res.concat(this.mergeArrayElements(dialogsGroup))
      return res
    }, [])
  }

  // make a utility function that would comapre 2 strings by converting them to the same case first?
  mergeArrayElements = (array) => {
    const initialValue = {
      [AVERAGE_TIME]: null,
      [PRIMARY_TEXT]: undefined,
      [SAVED]: null,
      [SECONDARY_TEXT]: undefined,
      [TIME]: null,
      [TOTAL]: array.length,
      [TYPE]: homonymous(array, TYPE) ? array[0][TYPE] : undefined,
    }
    if (initialValue[TYPE] === undefined) throw Error(`Values of properties ${TYPE} of argument "array" elements should be homonymous.`)
    const mergedDialogs = array.reduce(this.groupRowValues, initialValue)
    const result = { ...mergedDialogs, [AVERAGE_TIME]: Math.floor(mergedDialogs[TIME] / mergedDialogs[TOTAL]) }
    return result
  }

  getTableCells = (row) => {
    const tableFormat = this.props.selectedValue
    const titles = COLUMN.ORDERS[tableFormat]
    // is it safe to declare the parameter of sub-function that is homonymous to parameter of super-function?
    const getTableHeaderCells = () => titles.map((title, i) => <MUI.TableCell key={i}>{title}</MUI.TableCell>)

    const getTableBodyCells = () => titles.map((title, i) => {
      const titleKey = CONSTANT_KEY(title)
      const value = row.values[titleKey]
      return <MUI.TableCell key={i} numeric={typeOf(value).is('number')}>{value}</MUI.TableCell>
    })

    switch (row.type) {
      case HEADER: return getTableHeaderCells()
      case BODY: return getTableBodyCells()
      default: throw Error(`Unknown value "${row.type}" of function's parameter-object's property "rowType".`)
    }
  }

  render() {
    if (this.state.rows.length === 0) return null
    const tableFormat = this.props.selectedValue
    const rows = tableFormat === DISPLAY_RESULTS.BY_DIALOG ? this.state.rows : this.groupDialogsByType(this.state.rows)
    console.log('rows', rows)
    return (
      <MUI.Paper>
        <MUI.Table>
          <MUI.TableHead>
            <MUI.TableRow>
              {this.getTableCells({ type: HEADER })}
            </MUI.TableRow>
          </MUI.TableHead>
          <MUI.TableBody>
            {rows.map((row, i, a) => {
              return (
                <MUI.TableRow key={i}>
                  {this.getTableCells({ type: BODY, values: row })}
                </MUI.TableRow>
              );
            })}
          </MUI.TableBody>
        </MUI.Table>
      </MUI.Paper>
    );
  }
}

export default Table;