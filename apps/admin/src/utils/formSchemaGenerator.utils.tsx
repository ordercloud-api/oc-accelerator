import { isNull } from 'lodash'
import _ from 'lodash'
import { get, isArray, isEmpty, isEqual, isObject, set } from 'lodash'

function getMissingValues(obj1: any, obj2: any, parentPath?: string) {
  const obj1PropertiesDeep = getKeysDeep(obj1, parentPath)
  const obj2PropertiesDeep = getKeysDeep(obj2, parentPath)
  return obj2PropertiesDeep.filter((p) => !obj1PropertiesDeep.includes(p))
}

function getKeysDeep(val: any, parentPath?: string): string[] {
  let properties: string[] = []
  if (val) {
    Object.entries(val).forEach(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const keyName = parentPath ? `${parentPath}.${key}` : key
        const nestedProps = getKeysDeep(value, keyName)
        properties = [...properties, ...nestedProps]
      }
      const keyName = parentPath ? `${parentPath}.${key}` : key
      properties.push(keyName)
    })
  }
  return properties
} 

function isEmptyOrNull(val: any) {
  if (typeof val === 'number') return false
  if (typeof val === 'boolean') return isNull(val)
  return isNull(val) || isEmpty(val)
}

function getObjectDiffKeys(obj1: any, obj2: any) {
  return Object.keys(obj2).reduce<string[]>((result, key) => {
    const inner1 = obj1[key]
    const inner2 = obj2[key]
    const emptyNullValues = isEmptyOrNull(inner1) && isEmptyOrNull(inner2)
    if (!isEqual(inner1, inner2) && !emptyNullValues) {
      if (isObject(inner2) && !isArray(inner2)) {
        const innerDiffKeys = getObjectDiffKeys(obj1[key] || {}, obj2[key] || {}).map(
          (innerKey) => `${key}.${innerKey}`
        )
        result = result.concat(innerDiffKeys)
      } else {
        result.push(key)
      }
    }
    return result
  }, [])
}

export function getObjectDiff(obj1: any, obj2: any) {
  const diff = {}
  const diffKeys = getObjectDiffKeys(obj1, obj2)
  const missingKeys = getMissingValues(obj2, obj1)
  diffKeys.forEach((diffKey) => {
    const value = get(obj2, diffKey, null)
    set(diff, diffKey, value)
  })
  missingKeys.forEach((missingKey) => set(diff, missingKey, null))
  return diff
}
