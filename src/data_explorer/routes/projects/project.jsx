import { useLoaderData } from 'react-router-dom'
import App from '../../App'
import { getTaxonomy } from '../../js/services/dataService'

export async function loader({ params }) {
	const preflight = await getTaxonomy(params.projectId)

	if (!preflight) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}	

	return { uid: params.projectId, preflight }
}

export default function Project() {
	const { uid, preflight } = useLoaderData()

	return (
		<App uid={uid} taxonomy={preflight} />
	)
}
