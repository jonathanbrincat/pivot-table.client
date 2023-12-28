export const API = 'http://localhost:5000'

export async function getDimensions() {
  const response = await fetch(`${API}/get_dimensions`)
  if (response.ok) return response.json()

  throw response
}

export async function getFilters() {
  const response = await fetch(`${API}/get_filters`)
  if (response.ok) return response.json()

  throw response
}

export async function getData(params) {  
  const response = await fetch(`${API}/get_data?${new URLSearchParams(params)}`)
  if (response.ok) return response.json()

  throw response
}

export async function getAllData() {
  const response = await fetch(`${API}/get_all_data`)
  if (response.ok) return response.json()

  throw response
}
