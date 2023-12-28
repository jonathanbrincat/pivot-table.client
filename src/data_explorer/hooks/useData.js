import { useState, useEffect } from 'react'
import { getData } from '../js/services/dataService'

export default function useData(initialValue) {
  const [data, setData] = useState(() => {
    return initialValue instanceof Function ? initialValue() : initialValue
  })

  useEffect(() => {
    async function init() {
      try {
        setData(await getData('34725_34727_colgate_oralcare_2'))
      } catch (error) {
        console.log('Something went wrong retrieving the data from the endpoint :: ', error)
      }
    }

    init()
  }, [])

  return [data, setData]
}
