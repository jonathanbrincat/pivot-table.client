import { useState, useEffect } from 'react'
import { getTaxonomy } from '../js/services/dataService'

export default function useTaxonomy(initialValue) {
  const [taxonomy, setTaxonomy] = useState(() => {
    return initialValue instanceof Function ? initialValue() : initialValue
  })

  useEffect(() => {
    async function init() {
      try {
        setTaxonomy(await getTaxonomy('34725_34727_colgate_oralcare_2'))
      } catch (error) {
        console.log('Something went wrong retrieving the data taxonomy from the endpoint :: ', error)
      }
    }

    init()
  }, [])

  return [taxonomy, setTaxonomy]
}
