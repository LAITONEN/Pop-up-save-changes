import React from 'react';
import _ from 'lodash';

import { Decimal, Integer, SpacePath } from './regexp'
import { DATA_TYPES, DELIMITERS } from './utilityConstants'

const { CUSTOM, JS, TS } = DATA_TYPES
const { ARRAY, STRING } = JS
const { ARRAY_OF } = TS
const { NAN } = CUSTOM
const { OR } = DELIMITERS

// what if I pass an argument other than a number?
export const average = (...arrayOfNumbers) => {
  debugger;
  return arrayOfNumbers.filter(num => num !== null).reduce((res, num) => (res + num) / 2, 0)
}

export const camelCase = (value) => {
  const suitableDataTypes = [ARRAY_OF(STRING), STRING]
  const isSuitable = (dataType) => suitableDataTypes.includes(dataType)
  if (!isSuitable(getType(value))) {
    throw TypeError(`Incorrect data type of "value" argument supplied to camelCase(value): 
                        expected a ${suitableDataTypes.join(OR)}, but got ${getType(value)}.`)
  }
  else if (Array.isArray(value)) {
    const array = value
    if (!homogeneous(array, STRING)) {
      throw TypeError(`Incorrect data type of elements of "value" array-argument supplied to CONSTANT_KEY(value): 
                              expected a ${ARRAY_OF(STRING)}, but got ${value}.`)
    }
    return array.map(v => _.camelCase(v))
  }
  else return _.camelCase(value)
}

/**
 * Not reliable if object contains functions.
 * @param object object to clone; if not object is being passed - return the input
 */
export const cloneDeep = (object) => typeOf(object).is(['object', 'array']) ? JSON.parse(JSON.stringify(object)) : object

export const convert = {
  to: {
    array: (value) => {
      if (Array.isArray(value)) return value
      else if (typeof value !== 'object') return [value]
      else {
        throw TypeError(`Invalid value supplied to "convert.to.array(value)". Expected ${ARRAY} or ${STRING}, but got ${getType(value)}.`)
      }
    },
    boolean: (string) => string.toLowerCase() === 'true'
  }
}

// add _CASE ?
export const CONSTANT_KEY = (value) => {
  const suitableDataTypes = [ARRAY_OF(STRING), STRING]
  const isSuitable = (dataType) => suitableDataTypes.includes(dataType)
  if (!isSuitable(getType(value))) {
    throw TypeError(`Incorrect data type of "value" argument supplied to CONSTANT_KEY(value): 
                        expected a ${suitableDataTypes.join(OR)}, but got ${getType(value)}.`)
  }
  else if (Array.isArray(value)) {
    const array = value
    if (!homogeneous(array, STRING)) {
      throw TypeError(`Incorrect data type of elements of "value" array-argument supplied to CONSTANT_KEY(value): 
                              expected a ${ARRAY_OF(STRING)}, but got ${value}.`)
    }
    return array.map(v => TO_CONSTANT_KEY(v))
  }
  else return TO_CONSTANT_KEY(value)
}

const TO_CONSTANT_KEY = (string) => _.snakeCase(string).toUpperCase()

/**
 * Returns the amount of array elements, that are not: false, null, undefined or 0.
 */
export const countTruthy = (array) => array.filter(v => v).length

/**
 * @param {object} settings.ts - true - return typescript array type, i.e. "string[]"; false - return javascript array type: "array"
 */
export const getType = (input, settings = { ts: false }) => {
  if (input !== input) return NAN
  const inputType = getProperType(input)
  if (settings.ts && inputType === 'array') return getTypescriptArrayType(input)
  return inputType
}

const getTypescriptArrayType = (array) => `${getProperType(array[0])}[]`

/** Gets type of a variable even if it was declared in a different frame. */
const getProperType = (input) => Object.prototype.toString.apply(input).slice(8, -1).toLowerCase()

// assume that repetendIndex might be a spacePath
/**
 * Compare array elements or their certain properties to figure out whether they are shallowly equal to each other.
 * @returns true / false
 * @param lookUpKey [optional] if array consits of objects, this value represents the key of object property to compare
 * if key is not supplied, the entire elements of an array are compared
 */
export const homonymous = (array, lookUpKey = 0) => {
  if (!typeOf(lookUpKey).is(STRING)) {
    throw Error(`Invalid type of "lookUpKey" supplied. Expected a "${STRING}", but got ${getType(lookUpKey)}`)
  }
  const repetend = lookUpKey ? array[0][lookUpKey] : array[0]
  const testArray = lookUpKey ? array.map(v => v[lookUpKey]) : array
  return testArray.every((v, i, a) => v === repetend)
}

/**
 * @param dataType i.e. 'string', 'object', 'array', 'number', 'integer', 'decimal', 'boolean', 'data', 'function', 'undefined', 'null', 'symbol',
 */
export const homogeneous = (array, dataType = typeof array[0]) => {
  const objectName = _.capitalize(dataType)
  const primitive = (v) => typeof v !== 'object'
  return array.every(v => {
    if (primitive(v)) return typeof v === dataType
    else if (dataType === 'integer') return Integer.test(v)
    else if (dataType === 'decimal') return Decimal.test(v)
    else if (dataType === 'null') return v === null
    else return v instanceof window[objectName]
  })
}

export const HTML = {
  bold: (children) => <b>{children}</b>
}

export const humanCase = (value) => {
  const suitableDataTypes = [ARRAY_OF(STRING), STRING]
  const isSuitable = (dataType) => suitableDataTypes.includes(dataType)
  const convert = (v) => _.startCase(_.lowerCase(v))
  if (!isSuitable(getType(value))) {
    throw TypeError(`Incorrect data type of "value" argument supplied to camelCase(value): 
                        expected a ${suitableDataTypes.join(OR)}, but got ${getType(value)}.`)
  }
  else if (Array.isArray(value)) {
    const array = value
    if (!homogeneous(array, STRING)) {
      throw TypeError(`Incorrect data type of elements of "value" array-argument supplied to CONSTANT_KEY(value): 
                              expected a ${ARRAY_OF(STRING)}, but got ${value}.`)
    }
    return array.map(v => convert(v))
  }
  else return convert(value)
}

/**
 * @param objectPath string path pointing to specific object property 'object.path.to.property'
 * @returns "objectPath" or "undefined" if any of the properties of objectPath do not exist
 */
export const ifExists = (objectPath) => {
  const validFormat = SpacePath.test(objectPath)
  if (!validFormat) throw Error('Argument objectPath can only be a "space path" - a string of object properties separated by ".".')
  const func = () => eval(objectPath)
  try { return func(); }
  catch (e) { return undefined; }
}

export const isEmpty = (collection) => {
  if (Array.isArray(collection)) return collection.length === 0
  else if (collection instanceof Object) return Object.keys(collection).length === 0
}

export const removeElementAt = (array, index) => {
  return cloneDeep(array).slice(0, index).concat(cloneDeep(array).slice(index))
}

export const shuffleArray = (array) => {
  const result = cloneDeep(array)
  let currentIndex = result.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = result[currentIndex];
    result[currentIndex] = result[randomIndex];
    result[randomIndex] = temporaryValue;
  }
  return result;
}

/**
 * @param object 
 * @param spacePaths array of spacePaths or a spacePath string: if array - each element signifies path of keys to exist in "object"
 * @param settings - object with props:
 * @param settings.strict - true: should only contain keys from spacePaths, false: could contain other keys as well
 */

export const spacePathsExist = (object, spacePaths, settings = { strict: true }) => {
  const input = { object, spacePaths: convert.to.array(spacePaths), settings }
  return input.spacePaths.every((spacePath, index) => {
    spacePathExists(input.object, spacePath, settings)
  })
}

/**
 * @param object 
 * @param spacePaths array of spacePaths or a spacePath string: if array - each element signifies path of keys to exist in "object"
 * @param settings - object with props:
 * @param settings.strict - true: should only contain keys from spacePaths, false: could contain other keys as well
 */
export const spacePathExists = (object, spacePath, settings = { strict: true }) => {
  let keys = spacePath.split('.')
  // very generic name
  let testerObject = cloneDeep(object)

  return keys.every(key => {
    // implement is.not?
    if (testerObject === undefined) return false
    let matched
    if (settings.strict) matched = Object.keys(testerObject)[0] === key
    else if (!settings.strict) matched = Object.keys(testerObject).includes(key)
    testerObject = cloneDeep(testerObject[key])
    return matched
  })
}

export const typeOf = (variable) => ({
  /**
   * @param type array of lowercase types: ['object', 'array']; or a lowercase type string: 'string'
   */
  is: (type) => {
    const settings = { ts: false }
    const types = convert.to.array(type)
    const isSuitableType = () => types.includes(getType(variable, { ts: false }))

    let result
    if (type.includes('[]')) settings.ts = true

    if (getType(variable, settings) === 'array') result = variable.every(v => isSuitableType(v))
    else result = isSuitableType(variable)
    return result
  }
})

export const upperCase = (variable) => {
  if (Array.isArray(variable) && variable.every(v => typeof v === 'string')) return
}