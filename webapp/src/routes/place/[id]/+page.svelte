<script lang="ts">
	import { Heart, Share2, ArrowLeft } from 'lucide-svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import type { Place } from '$lib/common/domain/Place';
	import WebcamGallery from '$lib/components/organisms/WebcamGallery.svelte';
	import PlaceDetailsCard from '$lib/components/molecules/PlaceDetailsCard.svelte';
	import PlaceHeader from '$lib/components/molecules/PlaceHeader.svelte';

	let { data }: { data: { place: Place } } = $props();
	const place = $derived(data.place);
	const isFavorite = $derived(favoritesStore.isFavorite(place.id));

	// We can check if any webcam is active to show the badge
	const hasActiveWebcam = $derived(place.webcams.some((w) => w.isActive));

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
			<PlaceHeader {place} {hasActiveWebcam} />
			<WebcamGallery webcams={place.webcams} placeName={place.name} />
		</div>

		<!-- Right Column: Info & Actions -->
		<div class="space-y-8">
			<PlaceDetailsCard {place} />

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