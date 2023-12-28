export function isEmptyObject(obj) {
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) return false
  }

  return true
}

export function isArrayEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false

  return arr1.every((value, i) => (
    (Array.isArray(value) && Array.isArray(arr2[i]))
      ? isArrayEqual(value, arr2[i])
      : value === arr2[i]
  ))
}

export function arrayIncludesArray(target, query) {
  return target.some((item) => isArrayEqual(item, query))
}

export function mergeDedupeArray(arr1, arr2) {
  return [
    ...new Set([...arr1, ...arr2])
  ]
}
