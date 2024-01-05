const PROTOCOL = '//'
const DOMAIN = 'insights-bot-api-8be7caff.dev-bees.com'
const SERVICE = 'v1/explore_data'
export const API = `${PROTOCOL}${DOMAIN}/${SERVICE}`

export async function getTaxonomy(uid) {
  const response = await fetch(`${API}/question_ids/${uid}`)
  if (response.ok) return response.json()

  throw response
}

export async function getData(uid, dimensionIdCollection) {
  const response = await fetch(`${API}/data/${uid}?select=${dimensionIdCollection.join()}`)
  if (response.ok) return response.json()

  throw response
}
