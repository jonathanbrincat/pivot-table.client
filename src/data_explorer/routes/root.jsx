import { useEffect } from "react"
import { Link, NavLink, Outlet, useNavigation, useSubmit, useLoaderData, Form, redirect } from 'react-router-dom'
import { getContacts, createContact } from '../js/services/contacts'
import { getProjects } from '../js/services/projectService'

export async function loader({ request }) {
	const url = new URL(request.url)
	const q = url.searchParams.get('q')

	const contacts = await getContacts(q)
	const projects = await getProjects()

	return { contacts, q, projects }
}

export default function Root() {
	const { contacts, q, projects } = useLoaderData()
	const navigation = useNavigation()
	const submit = useSubmit()

	const searching =
		navigation.location &&
		new URLSearchParams(navigation.location.search).has('q')

	// useEffect(() => {
	// 	document.getElementById("q").value = q
	// }, [q])

	return (
		<>
			<div id="sidebar">
				<h1><Link to={`/`}>SBX beta feature development</Link></h1>

				<div>
					{/* <Form id="search-form" role="search">
						<input
							id="q"
							className={searching ? "loading" : ""}
							aria-label="Search contacts"
							placeholder="Search"
							type="search"
							name="q"
							defaultValue={q}
							onChange={(event) => {
								const isFirstSearch = q == null // prevent stacking of history entries upon every key stroke
								submit(event.currentTarget.form, {
									replace: !isFirstSearch,
								});
							}}
						/>
						<div
							id="search-spinner"
							aria-hidden
							hidden={!searching}
						/>
						<div
							className="sr-only"
							aria-live="polite"
						></div>
					</Form> */}
				</div>

				<nav>
					{/* {contacts.length ? (
						<ul>
							{contacts.map((contact) => (
								<li key={contact.id}>
									<NavLink
										className={({ isActive, isPending }) =>
											isActive
												? "active"
												: isPending
													? "pending"
													: ""
										}
										to={`contacts/${contact.id}`}
									>
										{contact.first || contact.last ? (
											<>
												{contact.first} {contact.last}
											</>
										) : (
											<i>No Name</i>
										)}{" "}
										{contact.favorite && <span>★</span>}
									</NavLink>
								</li>
							))}
						</ul>
					) : (
						<p>
							<i>No contacts</i>
						</p>
					)} */}

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
				id="detail"
				className={
					navigation.state === "loading" ? "loading" : ""
				}
			>
				<Outlet />
			</div>
		</>
	);
}
