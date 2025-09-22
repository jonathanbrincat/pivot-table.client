const PROTOCOL = 'http://'
const DOMAIN = 'localhost:4000'
const SERVICE = 'v1/explore_data'
export const API = `${PROTOCOL}${DOMAIN}/${SERVICE}`

export async function getTaxonomy(uid) {
  const response = await fetch(`${API}/question_ids/${uid}`)
  if (response.ok) return response.json()

  throw response
}

export async function getData(uid, dimensionIdCollection) {
  // const response = await fetch(`${API}/data_ids/${uid}?select=${dimensionIdCollection.join()}`)
  const response = await fetch(`${API}/data/${uid}`)
  if (response.ok) return response.json()

  throw response
}
