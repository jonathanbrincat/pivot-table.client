import { useState } from 'react'
import config from '../js/taxonomyConfig'

// Creates a taxonomy that we can use to compose our UI and know what contains what and what belongs to what
function parser(data) {
  data = (Array.isArray(data) && data) || []

  // Walk the nodes and create the taxonomy
  const groupByCluster = data.reduce((acc, cur) => {
    cur.forEach((item, i) => {
      acc[i] ??= new Set()
      acc[i].add(item)
    })

    return acc
  }, [])

  // Assign the collection of entries to it's parent key
  const reallocation = groupByCluster.map((item) => {
    const collection = Array.from(item)

    return [
      collection.shift(), collection.sort()
    ]
  })

  // Apply excludes list
  const output = reallocation
                  .filter(([dimension]) => !config.exclude.includes(dimension))
                  .sort()

  return {
    dimensions: output,
    questions: output.filter(([dimension]) => !config.include.includes(dimension)),
    key_variables: output.filter(([dimension]) => config.include.includes(dimension)),
  }
}

export default function useTaxonomy(initialValue) {
  const [taxonomy, setTaxonomy] = useState(() => {
    return parser(
      initialValue instanceof Function ? initialValue() : initialValue
    )
  })

  const setTaxonomyProxy = (data) => {
    setTaxonomy(parser(data))
  }

  return [taxonomy, setTaxonomyProxy]
}
