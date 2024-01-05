import { Outlet, useNavigation } from 'react-router-dom'

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
