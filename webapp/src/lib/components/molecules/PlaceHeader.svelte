<script lang="ts">
	import { MapPin } from 'lucide-svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import type { Place } from '$lib/common/domain/Place';

	let { place, hasActiveWebcam } = $props<{
		place: Place;
		hasActiveWebcam: boolean;
	}>();
</script>

<section class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-4xl font-black tracking-tighter lg:text-5xl">{place.name}</h1>
		{#if hasActiveWebcam}
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
				>{place.coordinates.latitude.toFixed(4)}°N, {place.coordinates.longitude.toFixed(4)}°E</span
			>
		{/if}
	</div>
</section>
