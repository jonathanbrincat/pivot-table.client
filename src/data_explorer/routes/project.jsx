import { useLoaderData } from 'react-router-dom'
import DataExplorer from '../root_component'
import { getTaxonomy } from '../js/services/dataService'

export async function loader({ params }) {
	const preflight = await getTaxonomy(params.projectId)

	// throwing an any error in react router will get caught and handled
	if (!preflight) {
		throw new Response("", {
			status: 404,
			statusText: "Not Found",
		});
	}	

	return { uid: params.projectId, preflight }
}

export default function Project() {
	const { uid, preflight } = useLoaderData()

	return (
		<div id="project">
			{/* <code>{ JSON.stringify(preflight) }</code> */}

			<DataExplorer uid={uid} taxonomy={preflight} />
		</div>
	)
}
