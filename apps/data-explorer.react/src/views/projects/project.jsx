import { useLoaderData } from 'react-router-dom'
import App from '../../App'

export async function loader({ params }) {
	// JB: former getTaxonomy() preload (SB specific requirement for UI) and handler redundant

	return { uid: params.projectId }
}

export default function Project() {
	const { uid } = useLoaderData()

	return (
		<App uid={uid} />
	)
}
