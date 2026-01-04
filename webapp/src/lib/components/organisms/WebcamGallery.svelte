<script lang="ts">
	import type { Webcam } from '$lib/common/domain/Webcam';

	let { webcams, placeName } = $props<{
		webcams: Webcam[];
		placeName: string;
	}>();

	let selectedWebcamIndex = $state(0);
	const selectedWebcam = $derived(webcams[selectedWebcamIndex]);
	let isImageLoading = $state(true);
	let scrollContainer: HTMLDivElement | undefined = $state();
</script>

<div
	class="border-border group relative aspect-video overflow-hidden rounded-3xl border bg-neutral-900 shadow-2xl"
>
	{#if selectedWebcam?.largeImage}
		<div bind:this={scrollContainer} class="absolute inset-0 flex overflow-auto">
			{#if isImageLoading}
				<div class="absolute inset-0 flex items-center justify-center z-20 bg-neutral-900">
					<div
						class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
					></div>
				</div>
			{/if}
			<img
				src={selectedWebcam.largeImage}
				alt={selectedWebcam.name}
				class="m-auto h-full w-auto max-w-none transition-opacity duration-300"
				class:opacity-0={isImageLoading}
				onload={() => {
					isImageLoading = false;
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
		<div class="pointer-events-none absolute right-6 bottom-6 left-6 flex items-end justify-between">
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
<div class="flex snap-x gap-4 overflow-x-auto pb-4 mt-8">
	{#each webcams as webcam, i}
		<button
			onclick={() => {
				if (selectedWebcamIndex !== i) {
					selectedWebcamIndex = i;
					isImageLoading = true;
				}
			}}
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
