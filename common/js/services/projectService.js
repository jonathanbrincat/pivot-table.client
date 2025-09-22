const PROTOCOL = '//'
const DOMAIN = 'localhost:4000'
const SERVICE = 'v1/projects'
export const API = `${PROTOCOL}${DOMAIN}/${SERVICE}`

export async function getProjects() {
  const response = await fetch(`${API}/`)
  if (response.ok) return response.json()

  throw response
}
