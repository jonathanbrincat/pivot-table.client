import { Outlet, useNavigation } from 'react-router-dom'
import { getProjects } from '../js/services/projectService'

export async function loader() {
	const projects = await getProjects()
	return { projects }
}

export default function Root() {
	const navigation = useNavigation()

	return (
		<div
			id="root"
			className={
				navigation.state === 'react-router--loading' ? 'react-router--loading' : ''
			}
		>
			<Outlet />
		</div>
	)
}
