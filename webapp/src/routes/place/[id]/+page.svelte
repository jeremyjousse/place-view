<script lang="ts">
	import { Heart, Share2, ArrowLeft, Check } from 'lucide-svelte';
	import { favoritesStore } from '#lib/stores/favorites.svelte';
	import type { Place } from '#lib/common/domain/Place';
	import WebcamGallery from '#lib/components/organisms/WebcamGallery.svelte';
	import PlaceDetailsCard from '#lib/components/molecules/PlaceDetailsCard.svelte';
	import PlaceHeader from '#lib/components/molecules/PlaceHeader.svelte';
	import MapView from '#lib/components/organisms/MapView.svelte';
	import { page } from '$app/state';
	import { viewHref } from '#lib/url-state';

	let { data }: { data: { place: Place } } = $props();
	const place = $derived(data.place);
	const isFavorite = $derived(favoritesStore.isFavorite(place.id));
	let copied = $state(false);

	const hasActiveWebcam = $derived(place.webcams.some((w) => w.isActive));

	function toggleFavorite() {
		favoritesStore.toggle(place.id);
	}

	async function handleShare() {
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({
					title: place.name,
					text: `Check out live webcams for ${place.name}`,
					url: window.location.href
				});
				return;
			} catch {
				// User cancelled or share failed, fallback to clipboard
			}
		}

		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}
</script>

<div class="mx-auto max-w-7xl py-8">
	<div class="mb-8 flex items-center justify-between">
		<a
			href={viewHref(page.url, '/')}
			class="text-text-muted hover:text-text flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
		>
			<ArrowLeft size={16} />
			Back to Explorer
		</a>

		<div class="flex items-center gap-3">
			<button
				class="bg-surface border-border hover:border-primary/50 text-text cursor-pointer rounded-2xl border p-3 transition-all"
				onclick={toggleFavorite}
				aria-label="Toggle favorite"
			>
				<Heart
					size={20}
					fill={isFavorite ? '#C5FF29' : 'none'}
					stroke={isFavorite ? '#C5FF29' : 'currentColor'}
				/>
			</button>
			<button
				class="bg-surface border-border hover:border-primary/50 text-text text-text-muted cursor-pointer rounded-2xl border p-3 transition-all"
				onclick={handleShare}
				aria-label="Share place"
			>
				{#if copied}
					<Check size={20} class="text-primary" />
				{:else}
					<Share2 size={20} />
				{/if}
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
		<!-- Left Column: Media & Gallery -->
		<div class="space-y-8 lg:col-span-2">
			<PlaceHeader {place} {hasActiveWebcam} />
			<WebcamGallery webcams={place.webcams} placeName={place.name} />
		</div>

		<!-- Right Column: Info & Actions & Map -->
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

			{#if place.coordinates?.latitude && place.coordinates?.longitude}
				<div class="space-y-4">
					<h3 class="text-text-muted text-xs font-black tracking-[0.2em] uppercase">
						Location Map
					</h3>
					<MapView
						places={[place]}
						center={[place.coordinates.latitude, place.coordinates.longitude]}
						zoom={11}
						heightClass="h-[360px]"
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
