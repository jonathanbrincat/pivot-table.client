import { useLoaderData } from 'react-router-dom'
import DataExplorer from '../../root_component'
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
		<DataExplorer uid={uid} taxonomy={preflight} />
	)
}
