<script lang="ts">
	import Button from '#lib/components/atoms/Button.svelte';
	import type { Place } from '#lib/common/domain/Place';
	import { page } from '$app/state';
	import { viewHref } from '#lib/url-state';

	let { place }: { place: Place } = $props();
</script>

<div class="bg-surface border-border space-y-6 rounded-3xl border p-8 shadow-xl">
	<h3 class="text-text-muted text-xs font-black tracking-[0.2em] uppercase">Location Details</h3>

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
		{#if place.url}
			<div class="border-border/50 flex items-center justify-between border-b pb-4">
				<span class="text-text-muted text-sm">Official Website</span>
				<a
					href={place.url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary max-w-[180px] truncate text-sm font-bold tracking-tight hover:underline"
				>
					Visit ↗
				</a>
			</div>
		{/if}
	</div>

	<Button
		variant="primary"
		size="lg"
		class="mt-4 w-full"
		href={viewHref(page.url, '/map/', {
			place: place.id,
			lat: null,
			lon: null,
			zoom: null,
			webcam: null
		})}
	>
		OPEN ON MAP
	</Button>
</div>
