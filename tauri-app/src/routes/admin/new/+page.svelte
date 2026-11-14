<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Place } from '@place-view/core';
	import { PlaceForm, type PlaceFormValues } from '@place-view/ui';
	import { getAdminContext } from '#lib/admin/admin-context.svelte';
	import AdminShell from '#lib/components/admin/AdminShell.svelte';

	const { placesStore, notify, searchLocations } = getAdminContext();

	const defaultPlace: Place = {
		id: '',
		name: '',
		country: 'France',
		state: '',
		url: '',
		description: '',
		coordinates: { latitude: 46.2276, longitude: 2.2137 },
		webcams: []
	};

	async function handleCreate(values: PlaceFormValues) {
		const created = await placesStore.createPlace({
			id: values.id,
			name: values.name,
			country: values.country,
			state: values.state,
			url: values.url,
			...(values.description ? { description: values.description } : {}),
			coordinates: {
				latitude: values.latitude,
				longitude: values.longitude
			},
			webcams: []
		});

		notify(`Created "${created.name}"`, 'success');
		await goto(`/admin/place/?id=${encodeURIComponent(created.id)}`);
	}
</script>

<AdminShell
	title="Create New Place"
	backHref="/admin/"
	backLabel="Back to Places"
	contentClass="mx-auto max-w-4xl px-6 py-8 lg:px-12"
>
	<PlaceForm
		place={defaultPlace}
		mode="create"
		saving={placesStore.isSaving}
		onSearchLocations={searchLocations}
		onSubmit={handleCreate}
	/>
</AdminShell>
