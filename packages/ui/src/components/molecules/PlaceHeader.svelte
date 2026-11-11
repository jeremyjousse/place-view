<script lang="ts">
	import { MapPin, ExternalLink } from 'lucide-svelte';
	import Badge from '../atoms/Badge.svelte';
	import type { Place } from '@place-view/core';

	interface Props {
		place: Place;
		hasActiveWebcam: boolean;
	}

	let { place, hasActiveWebcam }: Props = $props();
</script>

<section class="space-y-4">
	<div class="flex items-center justify-between">
		{#if place.url}
			<a
				href={place.url}
				target="_blank"
				rel="noopener noreferrer"
				class="group hover:text-primary flex items-center gap-3 text-4xl font-black tracking-tighter transition-colors lg:text-5xl"
			>
				<span>{place.name}</span>
				<ExternalLink
					size={24}
					class="text-primary opacity-0 transition-opacity group-hover:opacity-100"
				/>
			</a>
		{:else}
			<h1 class="text-4xl font-black tracking-tighter lg:text-5xl">{place.name}</h1>
		{/if}
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
