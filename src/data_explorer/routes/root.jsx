import { Link, NavLink, Outlet, useNavigation, useLoaderData } from 'react-router-dom'
import { getProjects } from '../js/services/projectService'

export async function loader() {
	const projects = await getProjects()
	return { projects }
}

export default function Root() {
	const { projects } = useLoaderData()
	const navigation = useNavigation()

	return (
		<>
			<div id="sidebar">
				<h1><Link to={`/`}>SBX beta feature development</Link></h1>

				<nav>
					{projects.length ? (
						<ul>
							{projects.map((project) => (
								<li key={project}>
									<NavLink
										className={({ isActive, isPending }) =>
											isActive
												? "active"
												: isPending
													? "pending"
													: ""
										}
										to={`projects/${project}`}
									>
										{project}
									</NavLink>
								</li>
							))}
						</ul>
					) : (
						<p>
							<i>No projects available</i>
						</p>
					)}
				</nav>
			</div>

			<div
				id="main"
				className={
					navigation.state === "loading" ? "loading" : ""
				}
			>
				<Outlet />
			</div>
		</>
	);
}
