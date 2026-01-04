<script lang="ts">
	import { Shield, MapPin, Heart, Share2, ArrowLeft } from 'lucide-svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import type { Place } from '$lib/common/domain/Place';

	let { data }: { data: { place: Place } } = $props();
	const place = $derived(data.place);
	const isFavorite = $derived(favoritesStore.isFavorite(place.id));

	let selectedWebcamIndex = $state(0);
	const selectedWebcam = $derived(place.webcams[selectedWebcamIndex]);

	let scrollContainer: HTMLDivElement | undefined = $state();

	function toggleFavorite() {
		favoritesStore.toggle(place.id);
	}
</script>

<div class="mx-auto max-w-7xl py-8">
	<div class="mb-8 flex items-center justify-between">
		<a
			href="/"
			class="text-text-muted hover:text-text flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
		>
			<ArrowLeft size={16} />
			Back to Explorer
		</a>

		<div class="flex items-center gap-3">
			<button
				class="bg-surface border-border hover:border-primary/50 text-text rounded-2xl border p-3 transition-all"
				onclick={toggleFavorite}
			>
				<Heart
					size={20}
					fill={isFavorite ? '#C5FF29' : 'none'}
					stroke={isFavorite ? '#C5FF29' : 'currentColor'}
				/>
			</button>
			<button
				class="bg-surface border-border hover:border-primary/50 text-text text-text-muted rounded-2xl border p-3 transition-all"
			>
				<Share2 size={20} />
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
		<!-- Left Column: Media & Gallery -->
		<div class="space-y-8 lg:col-span-2">
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<h1 class="text-4xl font-black tracking-tighter lg:text-5xl">{place.name}</h1>
					{#if selectedWebcam?.isActive}
						<Badge variant="primary" class="animate-pulse">LIVE VIEW</Badge>
					{/if}
				</div>

				<div class="text-text-muted flex items-center gap-4">
					<div class="flex items-center gap-1">
						<MapPin size={16} />
						<span class="text-[10px] font-bold tracking-widest uppercase"
							>{place.state}, {place.country}</span
						>
					</div>
					{#if place.coordinates?.latitude && place.coordinates?.longitude}
						<div class="bg-border h-1 w-1 rounded-full"></div>
						<span class="font-mono text-[10px] opacity-50"
							>{place.coordinates.latitude.toFixed(4)}°N, {place.coordinates.longitude.toFixed(
								4
							)}°E</span
						>
					{/if}
				</div>
			</section>

			<div
				class="border-border group relative aspect-video overflow-hidden rounded-3xl border bg-neutral-900 shadow-2xl"
			>
				{#if selectedWebcam?.largeImage}
					<div
						bind:this={scrollContainer}
						class="absolute inset-0 flex overflow-auto"
					>
						<img
							src={selectedWebcam.largeImage}
							alt={selectedWebcam.name}
							class="m-auto h-full w-auto max-w-none"
							onload={() => {
								if (scrollContainer) {
									scrollContainer.scrollLeft =
										(scrollContainer.scrollWidth - scrollContainer.clientWidth) / 2;
								}
							}}
						/>
					</div>
					<div
						class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
					></div>
					<div
						class="pointer-events-none absolute right-6 bottom-6 left-6 flex items-end justify-between"
					>
						<div class="space-y-1">
							<h2 class="text-xl font-bold text-white">{selectedWebcam.name}</h2>
						</div>
					</div>
				{:else}
					<div
						class="text-text/10 flex h-full w-full items-center justify-center text-4xl font-black tracking-tighter uppercase"
					>
						NO LIVE VIEW AVAILABLE
					</div>
				{/if}
			</div>

			<!-- Thumbnails Scroll -->
			<div class="flex snap-x gap-4 overflow-x-auto pb-4">
				{#each place.webcams as webcam, i}
					<button
						onclick={() => (selectedWebcamIndex = i)}
						class="aspect-video w-48 flex-none overflow-hidden rounded-2xl border bg-neutral-900 {selectedWebcamIndex ===
						i
							? 'border-primary'
							: 'border-border'} hover:border-primary/50 cursor-pointer snap-start transition-all"
					>
						<img
							src={webcam.thumbnailImage}
							alt={webcam.name}
							class="h-full w-full object-cover {selectedWebcamIndex === i
								? 'opacity-100'
								: 'opacity-40'} transition-opacity hover:opacity-100"
						/>
					</button>
				{/each}
			</div>
		</div>

		<!-- Right Column: Info & Actions -->
		<div class="space-y-8">
			<div class="bg-surface border-border space-y-6 rounded-3xl border p-8 shadow-xl">
				<h3 class="text-text-muted text-xs font-black tracking-[0.2em] uppercase">
					Location Details
				</h3>

				<div class="space-y-4">
					<div class="border-border/50 flex items-center justify-between border-b pb-4">
						<span class="text-text-muted text-sm">Region</span>
						<span class="text-sm font-bold tracking-tight">{place.state}</span>
					</div>
					<div class="border-border/50 flex items-center justify-between border-b pb-4">
						<span class="text-text-muted text-sm">Country</span>
						<span class="text-sm font-bold tracking-tight">{place.country}</span>
					</div>
					<div class="border-border/50 flex items-center justify-between border-b pb-4">
						<span class="text-text-muted text-sm">Webcams</span>
						<span class="text-sm font-bold tracking-tight">{place.webcams.length} Available</span>
					</div>
				</div>

				<Button variant="primary" size="lg" class="mt-4 w-full">OPEN ON MAP</Button>
			</div>

			{#if place.description}
				<div class="bg-surface/50 border-border space-y-4 rounded-3xl border p-8">
					<h3 class="text-text-muted text-xs font-black tracking-[0.2em] uppercase">About</h3>
					<p class="text-text-muted text-sm leading-relaxed font-medium">
						{place.description}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
