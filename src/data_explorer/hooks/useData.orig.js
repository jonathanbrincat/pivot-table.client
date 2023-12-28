import { useState, useEffect } from 'react'
import { getAllData } from '../js/services/dataService.orig'

export default function useData(initialValue) {
  const [data, setData] = useState(() => {
    return initialValue instanceof Function ? initialValue() : initialValue
  })

  useEffect(() => {
    async function init() {
      try {
        setData(await getAllData())
      } catch (error) {
        console.log('Something went wrong retrieving the data from the endpoint :: ', error)
      }
    }

    init()
  }, [])

  return [data, setData]
}
