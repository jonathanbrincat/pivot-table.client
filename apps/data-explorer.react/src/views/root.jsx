import { Outlet, useNavigation } from 'react-router-dom'

export default function Root() {
	const navigation = useNavigation()

	return (
		<div
			id="root"
			className={
				navigation.state === 'react-router--loading' ? 'react-router--loading' : '' // JB: not sure this hasn't been changed; can't remember original thinking behind it but it looks like a loader/v-cloak; doesn't seem to do anything anymore, that's if it ever worked in the first place
			}
		>
			<Outlet />
		</div>
	)
}
