/* eslint-disable no-prototype-builtins */
import { last } from 'lodash'
import Case from 'case'
import { formOverrides } from '../config/formOverrides'
import _ from 'lodash'
import { tableOverrides } from '../config/tableOverrides'

export function flattenNestedProperties(obj: any) {
  const flatObj = {} as any

  for (const key in obj) {
    if (obj[key].hasOwnProperty('allOf') || obj[key].type === 'object') {
      const nestedObj = obj[key].hasOwnProperty('allOf')
        ? obj[key]['allOf'][0]['properties']
        : obj[key]['properties']
      for (const innerKey in nestedObj) {
        flatObj[key + '.' + innerKey] = nestedObj[innerKey]
        flatObj[key + '.' + innerKey].accessor = key
      }
    } else {
      flatObj[key] = obj[key]
    }
  }

  return flatObj
}

//Hoist nested allOf schema definitions
export function shallowNestedProperties(obj: any) {
  const shallowObj = {} as any
  for (const key in obj) {
    if (obj[key]?.hasOwnProperty('allOf')) {
      shallowObj[key] = obj[key]['allOf'][0]
      if (obj[key].readOnly) {
        shallowObj[key]['readOnly'] = true
      }
      //account for deeply nested references
      shallowObj[key].properties = shallowNestedProperties(shallowObj[key].properties)
    } else {
      shallowObj[key] = obj[key]
    }
  }
  return shallowObj
}

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function getLabelOverride(path: string, resourceName: string) {
  if(!formOverrides[resourceName]) return 
  // return if array item
  const pathItems = path.split('.')
  const [lastItem] = pathItems.slice(-1)
  if(isNumeric(lastItem)) return 

  const arrItemsRemoved = pathItems.filter(i => !isNumeric(i)).join('.')
  const resourcePath = arrItemsRemoved.replace('body.', "")

  return formOverrides[resourceName][resourcePath]
}

export function getHeaderNameOverride(column: string, resourceName: string) {  
  if(!tableOverrides[resourceName]) return 
  return tableOverrides[resourceName][column]
}

export function getPropertyLabel(property: string) {
  const split = property.split('.').length ? last(property.split('.')) : property
  if(!split) return 
  
  let addS = true
  let idIndex = split.indexOf('IDs') // prevent spacing in IDs
  if (idIndex < 0) {
    addS = false
    idIndex = split.indexOf('ID') // prevent spacing in ID
  }
  let result
  if (idIndex > -1) {
    result = `${Case.title(split.slice(0, idIndex))} ID${addS ? 's' : ''}`
  } else {
    result = Case.title(split)
  }

  if (result === 'Xp') {
    result = 'Extended Properties'
  }
  return result
}

export function getType(properties: any, value?: any) {
  const type = properties?.type || typeof value
  switch (type) {
    case 'string':
      return properties?.format === 'date-time'
        ? 'date-time'
        : properties?.enum
          ? 'enum'
          : 'string'
    case 'object':
      return Array.isArray(value) ? 'array' : 'object'
    default:
      return type
  }
}