<script lang="ts">
	import type { Place } from '@place-view/core';
	import { AlertTriangle, Camera, ChevronRight } from 'lucide-svelte';
	import Badge from '../atoms/Badge.svelte';

	interface Props {
		place: Place;
		href: string;
	}

	let { place, href }: Props = $props();

	const previewUrl = $derived(
		place.webcams?.[0]?.thumbnailImage || place.webcams?.[0]?.largeImage || ''
	);
	const webcamCount = $derived(place.webcams?.length ?? 0);
	const missingMeta = $derived(!place.country?.trim() || !place.url?.trim());
</script>

<a
	{href}
	class="bg-surface border-border hover:border-primary/50 group flex items-center gap-4 rounded-2xl border p-3.5 transition-all"
>
	<div class="bg-background border-border h-14 w-20 shrink-0 overflow-hidden rounded-xl border">
		{#if previewUrl}
			<img src={previewUrl} alt={place.name} loading="lazy" class="h-full w-full object-cover" />
		{:else}
			<div class="text-text-muted/40 flex h-full w-full items-center justify-center">
				<Camera size={18} />
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-1 space-y-1">
		<div class="flex items-center gap-2">
			<h3 class="group-hover:text-primary truncate text-sm font-bold transition-colors">
				{place.name}
			</h3>
			{#if missingMeta}
				<span title="Missing country or official URL" class="text-amber-400">
					<AlertTriangle size={13} />
				</span>
			{/if}
		</div>
		<p class="text-text-muted truncate text-xs">
			{[place.state, place.country].filter(Boolean).join(', ') || 'No region set'}
			<span class="mx-1.5 opacity-40">•</span>
			<span class="font-mono text-[11px] opacity-70">{place.id}</span>
		</p>
	</div>

	<Badge variant={webcamCount > 0 ? 'secondary' : 'outline'}>
		{webcamCount}
		{webcamCount === 1 ? 'CAM' : 'CAMS'}
	</Badge>

	<ChevronRight
		size={18}
		class="text-text-muted group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5"
	/>
</a>
