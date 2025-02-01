type Options = {
  emptyArray: boolean
  emptyString: boolean
  emptyObject: boolean
  isNull: boolean
  isUndefined: boolean
  isNaN: boolean
  isZero: boolean
  isFalse: boolean
  customEmpty?: (value: any) => boolean
}

function cleanEmptyFields<T extends Record<string, any>>(
  value: T,
  options: Partial<Options> = {},
): Partial<T> {
  const defaultOptions: Options = {
    emptyArray: true,
    emptyString: true,
    emptyObject: true,
    isNull: true,
    isUndefined: true,
    isNaN: true,
    isZero: false,
    isFalse: false,
  }

  const mergedOptions: Options = { ...defaultOptions, ...options }

  function isEmptyValue(val: any): boolean {
    return ((mergedOptions.emptyArray &&
      Array.isArray(val) &&
      val.length === 0) ||
      (mergedOptions.emptyString && val === '') ||
      (mergedOptions.emptyObject &&
        typeof val === 'object' &&
        val !== null &&
        Object.keys(val).length === 0) ||
      (mergedOptions.isNull && val === null) ||
      (mergedOptions.isUndefined && val === undefined) ||
      (mergedOptions.isNaN && Number.isNaN(val)) ||
      (mergedOptions.isZero && val === 0) ||
      (mergedOptions.isFalse && val === false) ||
      (mergedOptions.customEmpty && mergedOptions.customEmpty(val))) as any
  }

  function cleanRecursively(obj: any, seen = new WeakMap()): any {
    if (typeof obj !== 'object' || obj === null) return obj
    if (seen.has(obj)) return seen.get(obj) // Return the cleaned version if already seen

    const cleanedObj: any = Array.isArray(obj) ? [] : {}
    seen.set(obj, cleanedObj) // Set the mapping before recursing

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const cleanedItem = cleanRecursively(item, seen)
        if (!isEmptyValue(cleanedItem)) {
          cleanedObj.push(cleanedItem)
        }
      }
    } else {
      for (const [key, val] of Object.entries(obj)) {
        const cleanedVal = cleanRecursively(val, seen)
        if (!isEmptyValue(cleanedVal)) {
          cleanedObj[key] = cleanedVal
        }
      }
    }

    return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined
  }

  return cleanRecursively(value) as Partial<T>
}

export { cleanEmptyFields }
