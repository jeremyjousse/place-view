<script lang="ts">
	import { goto } from '$app/navigation';
	import { filterAdminPlaces, isPlaceMissingMeta, type AdminPlaceFilter } from '@place-view/core';
	import {
		FilterPills,
		MapView,
		PlaceListItem,
		SearchInput,
		type FilterPillOption
	} from '@place-view/ui';
	import { getAdminContext } from '#lib/admin/admin-context.svelte';
	import AdminShell from '#lib/components/admin/AdminShell.svelte';

	const { placesStore } = getAdminContext();
	let searchQuery = $state('');
	let filterMode = $state<AdminPlaceFilter>('all');

	const totalWebcams = $derived(
		placesStore.places.reduce((sum, p) => sum + (p.webcams?.length ?? 0), 0)
	);
	const noWebcamsCount = $derived(
		placesStore.places.filter((p) => !p.webcams || p.webcams.length === 0).length
	);
	const missingMetaCount = $derived(placesStore.places.filter(isPlaceMissingMeta).length);

	const filterOptions = $derived<FilterPillOption<AdminPlaceFilter>[]>([
		{ value: 'all', label: 'All', count: placesStore.places.length },
		{ value: 'no-webcams', label: 'No Webcams', count: noWebcamsCount },
		{ value: 'missing-meta', label: 'Missing Info', count: missingMetaCount }
	]);

	const filteredPlaces = $derived(filterAdminPlaces(placesStore.places, searchQuery, filterMode));
</script>

<AdminShell
	title="Admin Tools"
	subtitle={placesStore.filePath
		? `${placesStore.places.length} Places • ${totalWebcams} Webcams`
		: 'Desktop Only'}
	newHref="/admin/new/"
>
	<div class="space-y-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<SearchInput
				bind:value={searchQuery}
				placeholder="Search by name, ID, region, or country..."
				class="max-w-md"
			/>

			<FilterPills options={filterOptions} value={filterMode} onChange={(v) => (filterMode = v)} />
		</div>

		<div class="grid grid-cols-1 gap-6 lg:h-[calc(100vh-250px)] lg:grid-cols-12">
			<div class="order-2 overflow-y-auto pr-1 lg:order-1 lg:col-span-7">
				{#if filteredPlaces.length === 0}
					<div
						class="bg-surface border-border flex flex-col items-center justify-center rounded-3xl border py-16 text-center"
					>
						<p class="text-text-muted text-sm font-medium">
							No places match the current search or filter.
						</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each filteredPlaces as place (place.id)}
							<PlaceListItem {place} href="/admin/place/?id={encodeURIComponent(place.id)}" />
						{/each}
					</div>
				{/if}
			</div>

			<div class="order-1 h-72 lg:order-2 lg:col-span-5 lg:h-full">
				<MapView
					places={filteredPlaces}
					markerVariant="dot"
					actionLabel="Edit Place"
					heightClass="h-full"
					getPlaceHref={(p) => `/admin/place/?id=${encodeURIComponent(p.id)}`}
					onSelectPlace={(p) => void goto(`/admin/place/?id=${encodeURIComponent(p.id)}`)}
				/>
			</div>
		</div>
	</div>
</AdminShell>
