// helper function for setting row/col-span in pivotTableRenderer
export function spanSize(arr, i, j) {
  let x

  if (i !== 0) {
    let asc, end
    let noDraw = true

    for (
      x = 0, end = j, asc = end >= 0;
      asc ? x <= end : x >= end;
      asc ? x++ : x--
    ) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false
      }
    }
    if (noDraw) {
      return -1
    }
  }

  let len = 0

  while (i + len < arr.length) {
    let asc1, end1
    let stop = false

    for (
      x = 0, end1 = j, asc1 = end1 >= 0;
      asc1 ? x <= end1 : x >= end1;
      asc1 ? x++ : x--
    ) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true
      }
    }
    if (stop) {
      break
    }
    len++
  }

  return len
}

export function redColorScaleGenerator(values: [number]): (x: number) => {backgroundColor: string} {
  // console.log('redColorScaleGenerator() :: ', values)

  // Guard against empty or invalid arrays
  if (!Array.isArray(values) || values.length === 0) {
    return () => ({ backgroundColor: 'transparent' })
  }

  // const min = Math.min.apply(Math, values)
  // const max = Math.max.apply(Math, values)
  const min = Math.min(...values)
  const max = Math.max(...values)
  // console.log('min =', min, ' max = ', max)

  // Guard against invalid min/max
  if (isNaN(min) || isNaN(max) || min === max) {
    return () => ({ backgroundColor: 'transparent' })
  }

  return (x: number) => {
    // console.log(x, ' Closure context: min =', min, ' max =', max, ' values =', values)

    // Guard against invalid input
    if (typeof x !== 'number' || isNaN(x)) {
      return { backgroundColor: 'transparent' }
    }

    // JB :: there are no limit/guards employed to prevent values falling out of range; this will cause the function to fail silently
    // eslint-disable-next-line no-magic-numbers
    const nonRed = 255 - Math.round((255 * (x - min)) / (max - min))

    return { backgroundColor: `rgb(255,${nonRed},${nonRed})` }
  }
}
