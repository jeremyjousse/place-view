<script lang="ts">
	import {
		slugify,
		validatePlace,
		type LocationPrediction,
		type Place,
		type ValidationErrors
	} from '@place-view/core';
	import { Loader2, Save } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import Badge from '../atoms/Badge.svelte';
	import Button from '../atoms/Button.svelte';
	import FormField from '../atoms/FormField.svelte';
	import Input from '../atoms/Input.svelte';
	import Textarea from '../atoms/Textarea.svelte';
	import LocationAutosuggest from '../molecules/LocationAutosuggest.svelte';
	import LocationPickerMap from './LocationPickerMap.svelte';

	export interface PlaceFormValues {
		id: string;
		name: string;
		country: string;
		state: string;
		url: string;
		description: string;
		latitude: number;
		longitude: number;
	}

	interface Props {
		place: Place;
		mode: 'create' | 'edit';
		saving?: boolean;
		onSearchLocations?: (query: string) => Promise<LocationPrediction[]>;
		onSubmit: (values: PlaceFormValues) => Promise<void>;
	}

	let {
		place,
		mode,
		saving = false,
		onSearchLocations = async () => [],
		onSubmit
	}: Props = $props();

	let name = $state('');
	let id = $state('');
	let idManuallyEdited = $state(false);
	let country = $state('');
	let stateRegion = $state('');
	let url = $state('');
	let description = $state('');
	let latitude = $state(46.2276);
	let longitude = $state(2.2137);
	let fieldErrors = $state<ValidationErrors>({});
	let submitError = $state<string | null>(null);
	let lastSyncKey = '';

	// Sync form fields only when place identity or mode changes, preserving unsaved edits during webcam updates.
	$effect(() => {
		const nextKey = `${place.id}:${mode}`;
		if (nextKey === lastSyncKey) return;
		lastSyncKey = nextKey;

		untrack(() => {
			name = place.name;
			id = place.id;
			idManuallyEdited = mode === 'edit';
			country = place.country;
			stateRegion = place.state;
			url = place.url;
			description = place.description ?? '';
			latitude = place.coordinates.latitude;
			longitude = place.coordinates.longitude;
			fieldErrors = {};
			submitError = null;
		});
	});

	$effect(() => {
		if (mode === 'create' && !idManuallyEdited) {
			id = slugify(name);
		}
	});

	const isDirty = $derived(
		name !== place.name ||
			(mode === 'create' && id !== place.id) ||
			country !== place.country ||
			stateRegion !== place.state ||
			url !== place.url ||
			description !== (place.description ?? '') ||
			latitude !== place.coordinates.latitude ||
			longitude !== place.coordinates.longitude
	);

	function handleLocationSelect(prediction: LocationPrediction) {
		const shortName = prediction.displayName.split(',')[0]?.trim() || prediction.displayName;
		name = shortName;
		latitude = Number(prediction.latitude.toFixed(6));
		longitude = Number(prediction.longitude.toFixed(6));

		if (prediction.country) country = prediction.country;
		if (prediction.state) stateRegion = prediction.state;

		if (!country || !stateRegion) {
			const parts = prediction.displayName.split(',').map((p) => p.trim());
			if (parts.length >= 2) {
				if (!country) country = parts[parts.length - 1];
				if (!stateRegion) stateRegion = parts[parts.length - 2];
			}
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		fieldErrors = {};
		submitError = null;

		const candidate: Place = {
			id: id.trim() || slugify(name),
			name,
			country,
			state: stateRegion,
			url,
			...(description.trim() ? { description: description.trim() } : {}),
			coordinates: {
				latitude: Number(latitude),
				longitude: Number(longitude)
			},
			webcams: place.webcams ?? []
		};

		const validation = validatePlace(candidate);
		if (!validation.success) {
			fieldErrors = validation.errors;
			return;
		}

		try {
			await onSubmit({
				id: validation.data.id,
				name: validation.data.name,
				country: validation.data.country,
				state: validation.data.state,
				url: validation.data.url,
				description: validation.data.description ?? '',
				latitude: validation.data.coordinates.latitude,
				longitude: validation.data.coordinates.longitude
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Failed to save place.';
		}
	}
</script>

<form
	onsubmit={handleSubmit}
	class="bg-surface border-border space-y-6 rounded-3xl border p-6 shadow-2xl lg:p-8"
>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-lg font-black tracking-tight">Place Details</h2>
			<p class="text-text-muted text-xs">
				{mode === 'create'
					? 'Search a location or click the map to set coordinates.'
					: 'Update metadata or adjust the location pin on the map.'}
			</p>
		</div>

		{#if mode === 'edit' && isDirty}
			<Badge variant="primary">Unsaved Changes</Badge>
		{/if}
	</div>

	{#if submitError}
		<div
			class="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
			role="alert"
		>
			{submitError}
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
		<LocationAutosuggest
			id="place-name"
			label="Place Name"
			bind:value={name}
			error={fieldErrors.name}
			onSearch={onSearchLocations}
			onSelect={handleLocationSelect}
			required
		/>

		<FormField id="place-id" label="Slug ID" error={fieldErrors.id} required={mode === 'create'}>
			<Input
				id="place-id"
				bind:value={id}
				mono
				invalid={Boolean(fieldErrors.id)}
				oninput={() => {
					idManuallyEdited = true;
				}}
				readonly={mode === 'edit'}
				required
				placeholder="auto-generated-from-name"
			/>
		</FormField>

		<FormField id="place-country" label="Country" error={fieldErrors.country} required>
			<Input
				id="place-country"
				bind:value={country}
				invalid={Boolean(fieldErrors.country)}
				required
				placeholder="France"
			/>
		</FormField>

		<FormField id="place-state" label="State / Region" error={fieldErrors.state} required>
			<Input
				id="place-state"
				bind:value={stateRegion}
				invalid={Boolean(fieldErrors.state)}
				required
				placeholder="Haute-Savoie"
			/>
		</FormField>

		<FormField
			id="place-url"
			label="Official Website URL"
			error={fieldErrors.url}
			class="sm:col-span-2"
		>
			<Input
				id="place-url"
				type="url"
				bind:value={url}
				invalid={Boolean(fieldErrors.url)}
				placeholder="https://example.com"
			/>
		</FormField>

		<FormField id="place-description" label="Description (Optional)" class="sm:col-span-2">
			<Textarea
				id="place-description"
				rows={2}
				bind:value={description}
				placeholder="Short overview shown in place details..."
			/>
		</FormField>

		<FormField id="place-lat" label="Latitude" error={fieldErrors.latitude} required>
			<Input
				id="place-lat"
				type="number"
				step="any"
				mono
				bind:value={latitude}
				invalid={Boolean(fieldErrors.latitude)}
				required
			/>
		</FormField>

		<FormField id="place-lon" label="Longitude" error={fieldErrors.longitude} required>
			<Input
				id="place-lon"
				type="number"
				step="any"
				mono
				bind:value={longitude}
				invalid={Boolean(fieldErrors.longitude)}
				required
			/>
		</FormField>

		<div class="space-y-2 sm:col-span-2">
			<span class="text-text-muted block text-[11px] font-black tracking-widest uppercase">
				Location Picker
			</span>
			<LocationPickerMap
				bind:latitude
				bind:longitude
				zoom={mode === 'create' ? 6 : 12}
				heightClass="h-72"
			/>
		</div>
	</div>

	<div class="border-border/60 flex items-center justify-end gap-3 border-t pt-5">
		<Button type="submit" variant="primary" disabled={saving} class="gap-2">
			{#if saving}
				<Loader2 size={16} class="animate-spin" />
				Saving...
			{:else}
				<Save size={16} />
				{mode === 'create' ? 'Create Place' : 'Save Changes'}
			{/if}
		</Button>
	</div>
</form>
