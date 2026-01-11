<script lang="ts">
	import PlaceForm from '$lib/components/organisms/PlaceForm.svelte';
	import type { Place } from '$lib/domain/Place';

	const defaultPlace: Place = {
		id: '',
		name: '',
		country: 'France',
		state: '',
		url: '',
		coordinates: { latitude: 46.2276, longitude: 2.2137 }, // Center of France
		webcams: []
	};
</script>

<svelte:head>
	<title>Place view - Admin Tools - Create New Place</title>
</svelte:head>

<div class="container mx-auto space-y-8 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Create New Place</h1>
		<a href="/" class="text-indigo-600 hover:text-indigo-900">Back to List</a>
	</div>

	<section>
		<PlaceForm place={defaultPlace} action="?/createPlace" />
	</section>
</div>
