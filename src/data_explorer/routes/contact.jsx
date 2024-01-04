import { Form, useLoaderData } from 'react-router-dom'
import { getContact, updateContact } from '../js/services/contacts'

export async function loader({ params }) {
	const contact = await getContact(params.contactId)

	// throwing an any error in react router will get caught and handled
	if (!contact) {
		throw new Response("", {
			status: 404,
			statusText: "Not Found",
		});
	}

	return { contact }
}

export async function action({ request, params }) {
	let formData = await request.formData();
	return updateContact(params.contactId, {
		favorite: formData.get("favorite") === "true",
	});
}

export default function Contact() {
	const { contact} = useLoaderData()

	return (
		<div id="contact">
			<div>
				<img
					key={contact.avatar}
					src={contact.avatar || null}
				/>
			</div>

			<div>
				<h1>
					{contact.first || contact.last ? (
						<>
							{contact.first} {contact.last}
						</>
					) : (
						<i>No Name</i>
					)}{" "}
				</h1>

				<div>
					<Form action="edit">
						<button type="submit">Edit</button>
					</Form>

					{/* <Form
						method="post"
						action="destroy"
						onSubmit={(event) => {
							if (
								!confirm(
									"Please confirm you want to delete this record."
								)
							) {
								event.preventDefault();
							}
						}}
					>
						<button type="submit">Delete</button>
					</Form> */}
				</div>
			</div>
		</div>
	)
}
