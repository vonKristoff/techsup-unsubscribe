const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;
import * as v from 'valibot';
import { form } from '$app/server';

export const unsubscribe = form(
	v.object({
		email: v.pipe(v.string(), v.nonEmpty(), v.email())
	}),
	async ({ email }) => {
		// JS example with fetch
		const params = new URLSearchParams({
			user_field_names: 'true',
			filter__Email__equal: email
		});

		const URL = `${API_ENDPOINT}?user_field_names=true&${params}`;

		try {
			let response = await fetch(URL, {
				method: 'GET',
				headers: {
					Authorization: `Token ${API_TOKEN}`,
					'Content-Type': 'application/json'
				}
			});
			if (!response.ok) throw new Error('Network response was not ok');

			const data = await response.json();
			const unsubscriptions = data.results.filter((row) => row.Active);

			if (unsubscriptions.length) {
				await Promise.all(
					unsubscriptions.map(async (row) => {
						const res = await fetch(`${API_ENDPOINT}${row.id}/?user_field_names=true`, {
							method: 'PATCH',
							headers: {
								Authorization: `Token ${API_TOKEN}`,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ ...row, Active: false })
						});
						// const result = await res.json();
						// console.log('status:', res.status, 'response:', result);
					})
				);
			} else {
				return { success: false, message: 'That email address was not found.' };
			}

			return { success: true };
		} catch (error) {
			console.error('Error:', error);
			return error;
		}
	}
);
