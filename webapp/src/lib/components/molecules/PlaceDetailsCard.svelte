<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import type { Place } from '$lib/common/domain/Place';

	let { place } = $props<{ place: Place }>();
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
	</div>

	<Button variant="primary" size="lg" class="mt-4 w-full">OPEN ON MAP</Button>
</div>
