import { router } from './inertia';

export async function fetchToken() {
	return new Promise((resolve) => {
		router.reload({ only: [], onFinish: () => resolve(null) });
	});
}

export function isTokenValid() {
	return window.document.cookie.includes('XSRF-TOKEN');
}
