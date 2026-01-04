export function createSearchStore() {
	let query = $state('');

	return {
		get query() {
			return query;
		},
		set query(value: string) {
			query = value;
		}
	};
}

export const searchStore = createSearchStore();
