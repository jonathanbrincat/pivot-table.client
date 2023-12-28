const PROTOCOL = '//'
// const DOMAIN = 'insights-bot-api-8be7caff.dev-bees.com'
const DOMAIN = 'localhost:4000'
const SERVICE = 'v1/explore_data'
export const API = `${PROTOCOL}${DOMAIN}/${SERVICE}`

/*
preflight
https://insights-bot-api-8be7caff.dev-bees.com/v1/explore_data/questions/34725_34727_colgate_oralcare_2

data
https://insights-bot-api-8be7caff.dev-bees.com/v1/explore_data/data/34725_34727_colgate_oralcare_2
*/

export async function getTaxonomy(uid) {
  console.log(`${API}/questions/${uid}`)
  const response = await fetch(`${API}/questions/${uid}`)
  if (response.ok) return response.json()

  throw response
}

export async function getData(uid) {
  const response = await fetch(`${API}/data/${uid}`)
  if (response.ok) return response.json()

  throw response
}
