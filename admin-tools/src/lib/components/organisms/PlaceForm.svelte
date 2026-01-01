<script lang="ts">
	import type { Place } from '$lib/domain/Place';
	import FormField from '../molecules/FormField.svelte';
	import Button from '../atoms/Button.svelte';
	import Map from '../molecules/Map.svelte';
	import PlaceNameAutosuggest from '../molecules/PlaceNameAutosuggest.svelte';
	import { enhance } from '$app/forms';
	import { addToast } from '$lib/stores/toast';
	import type { LocationPrediction } from '$lib/services/GeocodeService';

	interface Props {
		place: Place;
		action: string; // The form action URL
	}

	let { place, action }: Props = $props();
	let formData = $state<{
		name: string;
		country: string;
		state: string;
		url: string;
		coordinates: { latitude: number; longitude: number };
		id: string;
		webcams: import('$lib/domain/Webcam').Webcam[];
	}>({
		name: '',
		country: '',
		state: '',
		url: '',
		coordinates: { latitude: 0, longitude: 0 },
		id: '',
		webcams: []
	});

	function handleLocationSelect(prediction: LocationPrediction) {
		formData.name = prediction.displayName;
		formData.coordinates.latitude = prediction.latitude;
		formData.coordinates.longitude = prediction.longitude;

		// Optional: try to guess country/state from display name if they are empty
		if (!formData.country || !formData.state) {
			const parts = prediction.displayName.split(',').map((p) => p.trim());
			if (parts.length >= 2) {
				if (!formData.country) formData.country = parts[parts.length - 1];
				if (!formData.state) formData.state = parts[parts.length - 2];
			}
		}
	}

	$effect(() => {
		// Sync local state if prop changes (e.g. after navigation or action refresh)
		formData.name = place.name;
		formData.country = place.country;
		formData.state = place.state;
		formData.url = place.url;
		formData.coordinates = { ...place.coordinates };
		formData.id = place.id;
		formData.webcams = [...(place.webcams || [])];
	});
</script>

<form
	method="POST"
	{action}
	class="space-y-6 bg-white p-6 shadow sm:rounded-lg"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				addToast('Place updated successfully', 'success');
			} else if (result.type === 'failure') {
				addToast('Failed to update place', 'error');
			}
			await update();
		};
	}}
>
	<div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
		<div class="sm:col-span-3">
			<PlaceNameAutosuggest
				id="name"
				label="Name"
				bind:value={formData.name}
				onSelect={handleLocationSelect}
				required
			/>
		</div>

		<div class="sm:col-span-3">
			<FormField
				id="country"
				name="country"
				label="Country"
				bind:value={formData.country}
				required
			/>
		</div>

		<div class="sm:col-span-3">
			<FormField id="state" name="state" label="State" bind:value={formData.state} required />
		</div>

		<div class="sm:col-span-3">
			<FormField id="url" name="url" label="Official URL" type="url" bind:value={formData.url} />
		</div>

		<div class="sm:col-span-3">
			<FormField
				id="latitude"
				name="latitude"
				label="Latitude"
				type="number"
				step="any"
				bind:value={formData.coordinates.latitude}
				required
			/>
		</div>

		<div class="sm:col-span-3">
			<FormField
				id="longitude"
				name="longitude"
				label="Longitude"
				type="number"
				step="any"
				bind:value={formData.coordinates.longitude}
				required
			/>
		</div>

		<div class="sm:col-span-6">
			<span class="mb-2 block text-sm font-medium text-gray-700">Preview Location</span>
			<Map
				bind:latitude={formData.coordinates.latitude}
				bind:longitude={formData.coordinates.longitude}
				height="200px"
			/>
		</div>
	</div>

	<div class="flex justify-end">
		<Button type="submit">Save Changes</Button>
	</div>
</form>
