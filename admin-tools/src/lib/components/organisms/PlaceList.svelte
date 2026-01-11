<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script lang="ts">
	import type { Place } from '$lib/domain/Place';
	import { base } from '$app/paths';
	import SearchBar from '../molecules/SearchBar.svelte';
	import Map from '../molecules/Map.svelte';

	interface Props {
		places: Place[];
	}

	let { places }: Props = $props();

	let searchQuery = $state('');

	let filteredPlaces = $derived(
		places.filter((place) => place.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Center of France
	const FRANCE_CENTER = { lat: 46.2276, lon: 2.2137 };
</script>

<div class="flex flex-col gap-6">
	<div class="max-w-md">
		<SearchBar bind:value={searchQuery} placeholder="Search places by name..." />
	</div>

	<div class="flex flex-col gap-6 lg:h-[70vh] lg:flex-row">
		<!-- Map - Top on mobile, Right on desktop -->
		<div class="order-1 h-64 w-full lg:order-2 lg:h-full lg:w-1/2">
			<Map
				latitude={FRANCE_CENTER.lat}
				longitude={FRANCE_CENTER.lon}
				{places}
				zoom={6}
				height="100%"
				fitToPlaces={false}
			/>
		</div>

		<!-- List - Bottom on mobile, Left on desktop -->
		<div class="scrollbar-hide-hover order-2 w-full overflow-y-auto lg:order-1 lg:h-full lg:w-1/2">
			<div class="overflow-hidden bg-white shadow sm:rounded-lg">
				<ul role="list" class="divide-y divide-gray-200">
					{#each filteredPlaces as place (place.id)}
						<li>
							<a href="{base}/places/{place.id}" class="block hover:bg-gray-50">
								<div class="flex items-center px-4 py-4 sm:px-6">
									{#if place.webcams && place.webcams.length > 0}
										<img
											src={place.webcams[0].thumbnailImage}
											alt={place.webcams[0].name}
											class="mr-4 h-12 w-16 flex-shrink-0 rounded object-cover"
										/>
									{/if}
									<div class="flex min-w-0 flex-1 items-center">
										<div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
											<div>
												<h3 class="truncate text-sm font-medium text-indigo-600">
													{place.name}
												</h3>
												<p class="mt-2 flex items-center text-sm text-gray-500">
													<span class="truncate">{place.country}, {place.state}</span>
												</p>
											</div>
											<div class="hidden md:block">
												<div class="text-sm text-gray-900">
													Webcams: {place.webcams ? place.webcams.length : 0}
												</div>
											</div>
										</div>
									</div>
									<div class="ml-5 flex-shrink-0 text-gray-400">
										<svg
											class="h-5 w-5"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
										>
											<path
												fill-rule="evenodd"
												d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	/* Hide scrollbar by default, show on hover */
	.scrollbar-hide-hover {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.scrollbar-hide-hover::-webkit-scrollbar {
		display: none;
	}

	.scrollbar-hide-hover:hover {
		scrollbar-width: thin;
	}
	.scrollbar-hide-hover:hover::-webkit-scrollbar {
		display: block;
		width: 6px;
	}
	.scrollbar-hide-hover::-webkit-scrollbar-thumb {
		background-color: #d1d5db;
		border-radius: 3px;
	}
</style>
