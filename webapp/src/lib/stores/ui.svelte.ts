export function createUiStore() {
	let activeView = $state<'list' | 'map'>('list');
	let showFavoritesOnly = $state(false);

	return {
		get activeView() { return activeView; },
		set activeView(v) { activeView = v; },
		get showFavoritesOnly() { return showFavoritesOnly; },
		set showFavoritesOnly(v) { showFavoritesOnly = v; }
	};
}

export const uiStore = createUiStore();
