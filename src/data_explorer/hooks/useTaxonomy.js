import { useState, useEffect } from 'react'
import { getTaxonomy } from '../js/services/dataService'

export default function useTaxonomy(uid = '') {
  const [taxonomy, setTaxonomy] = useState({})

  useEffect(() => {
    async function init() {
      try {
        setTaxonomy(await getTaxonomy(uid))
      } catch (error) {
        console.log('Something went wrong retrieving the data taxonomy from the endpoint :: ', error)
      }
    }

    init()
  }, [uid])

  return [taxonomy, setTaxonomy]
}
