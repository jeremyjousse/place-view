import { browser } from '$app/environment';

export function createFavoritesStore() {
	let favorites = $state<string[]>([]);

	if (browser) {
		const stored = localStorage.getItem('favorites');
		if (stored) {
			try {
				favorites = JSON.parse(stored);
			} catch (e) {
				console.error('Failed to parse favorites from localStorage', e);
			}
		}
	}

	function save() {
		if (browser) {
			localStorage.setItem('favorites', JSON.stringify(favorites));
		}
	}

	return {
		get ids() {
			return favorites;
		},
		toggle(id: string) {
			if (favorites.includes(id)) {
				favorites = favorites.filter((f) => f !== id);
			} else {
				favorites = [...favorites, id];
			}
			save();
		},
		isFavorite(id: string) {
			return favorites.includes(id);
		}
	};
}

export const favoritesStore = createFavoritesStore();
