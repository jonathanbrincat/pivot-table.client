import { useState, useEffect } from 'react'
import { getData } from '../js/services/dataService'

export default function useData(uid = '') {
  const [data, setData] = useState([])

  useEffect(() => {
    async function init() {
      try {
        setData(await getData(uid))
      } catch (error) {
        console.log('Something went wrong retrieving the data from the endpoint :: ', error)
      }
    }

    init()
  }, [uid])

  return [data, setData]
}
