<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { X, Maximize2, Minimize2, Share2, Check } from 'lucide-svelte';
	import type { Webcam } from '@place-view/core';

	interface Props {
		webcams: Webcam[];
		placeName: string;
		activeWebcamIndex?: number;
		onWebcamChange?: (index: number | null) => void;
		shareUrl?: string;
	}

	let { webcams, placeName, activeWebcamIndex, onWebcamChange, shareUrl }: Props = $props();

	const STORAGE_KEY_FULLSCREEN_MODE = 'webcamFullscreenMode';
	const isBrowser = typeof window !== 'undefined';

	let internalWebcamIndex = $state(0);
	let selectedWebcamIndex = $derived(
		activeWebcamIndex !== undefined ? activeWebcamIndex : internalWebcamIndex
	);
	const selectedWebcam = $derived(webcams[selectedWebcamIndex]);

	let isImageLoading = $state(true);
	let isFullscreen = $state(false);
	let isPanoramaScroll = $state(true);
	let scrollContainer: HTMLDivElement | undefined = $state();
	let modalScrollContainer: HTMLDivElement | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();
	let copied = $state(false);

	function setWebcam(index: number | null) {
		if (index !== null) {
			internalWebcamIndex = index;
		}
		onWebcamChange?.(index);
	}

	function toggleFullscreenMode() {
		isPanoramaScroll = !isPanoramaScroll;
		if (isBrowser && typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY_FULLSCREEN_MODE, isPanoramaScroll ? 'panorama' : 'fit');
		}
		if (isPanoramaScroll) {
			setTimeout(centerModalScroll, 50);
		}
	}

	function openFullscreen() {
		if (selectedWebcam?.largeImage) {
			setWebcam(selectedWebcamIndex);
			isFullscreen = true;
			if (dialogElement && !dialogElement.open) {
				dialogElement.showModal();
			}
		}
	}

	function closeFullscreen() {
		setWebcam(null);
		if (dialogElement?.open) {
			dialogElement.close();
		}
		isFullscreen = false;
	}

	function nextWebcam() {
		if (webcams.length > 1) {
			const nextIndex = (selectedWebcamIndex + 1) % webcams.length;
			isImageLoading = true;
			setWebcam(nextIndex);
			if (isPanoramaScroll) {
				setTimeout(centerModalScroll, 50);
			}
		}
	}

	function prevWebcam() {
		if (webcams.length > 1) {
			const prevIndex = (selectedWebcamIndex - 1 + webcams.length) % webcams.length;
			isImageLoading = true;
			setWebcam(prevIndex);
			if (isPanoramaScroll) {
				setTimeout(centerModalScroll, 50);
			}
		}
	}

	async function handleShare() {
		const targetUrl = shareUrl || (isBrowser ? window.location.href : '');
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({
					title: `${selectedWebcam?.name ?? 'Webcam'} - ${placeName}`,
					text: `Check out live webcam for ${selectedWebcam?.name ?? placeName}`,
					url: targetUrl
				});
				return;
			} catch {
				// User cancelled or share failed, fallback to clipboard
			}
		}

		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(targetUrl);
				copied = true;
				setTimeout(() => {
					copied = false;
				}, 2000);
			} catch (e) {
				console.error('Failed to copy to clipboard', e);
			}
		}
	}

	function centerModalScroll() {
		if (modalScrollContainer) {
			const maxScroll = modalScrollContainer.scrollWidth - modalScrollContainer.clientWidth;
			modalScrollContainer.scrollLeft = maxScroll / 2;
		}
	}

	function centerInlineScroll() {
		if (scrollContainer) {
			const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
			scrollContainer.scrollLeft = maxScroll / 2;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isFullscreen) return;

		if (e.key === 'Escape') {
			closeFullscreen();
		} else if (e.key === 'ArrowRight') {
			nextWebcam();
		} else if (e.key === 'ArrowLeft') {
			prevWebcam();
		} else if (e.key === 'f' || e.key === 'F') {
			toggleFullscreenMode();
		}
	}

	onMount(() => {
		if (isBrowser && typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem(STORAGE_KEY_FULLSCREEN_MODE);
			if (saved) {
				isPanoramaScroll = saved === 'panorama';
			}
		}

		centerInlineScroll();

		if (isBrowser) {
			window.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (isBrowser) {
			window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<div class="space-y-4">
	<!-- Main Webcam Display -->
	<div
		class="border-border bg-surface relative aspect-video w-full overflow-hidden rounded-3xl border shadow-2xl"
	>
		{#if selectedWebcam}
			{#if isImageLoading}
				<div class="absolute inset-0 flex items-center justify-center bg-neutral-900">
					<div
						class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
					></div>
				</div>
			{/if}

			<div
				bind:this={scrollContainer}
				class="scrollbar-none h-full w-full overflow-x-auto overflow-y-hidden"
			>
				<button
					type="button"
					class="h-full max-w-none min-w-full cursor-pointer border-none bg-transparent p-0 text-left"
					onclick={openFullscreen}
					aria-label="Open fullscreen webcam image"
				>
					<img
						src={selectedWebcam.largeImage || selectedWebcam.thumbnailImage}
						alt={selectedWebcam.name}
						class="h-full max-w-none min-w-full object-cover transition-opacity duration-300"
						class:opacity-0={isImageLoading}
						onload={() => {
							isImageLoading = false;
							centerInlineScroll();
						}}
					/>
				</button>
			</div>

			<div
				class="from-background/80 pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-6 pt-12"
			>
				<div class="pointer-events-auto flex items-end justify-between">
					<div>
						<h2 class="text-xl font-bold tracking-tight">{selectedWebcam.name}</h2>
						<p class="text-text-muted text-xs font-medium">Click image for fullscreen</p>
					</div>

					<div class="flex items-center gap-2">
						<button
							class="bg-surface/80 hover:bg-surface border-border text-text cursor-pointer rounded-xl border p-2.5 backdrop-blur-md transition-all active:scale-95"
							onclick={handleShare}
							aria-label="Share webcam"
							title="Share webcam link"
						>
							{#if copied}
								<Check size={18} class="text-primary" />
							{:else}
								<Share2 size={18} />
							{/if}
						</button>

						<button
							class="bg-surface/80 hover:bg-surface border-border text-text cursor-pointer rounded-xl border p-2.5 backdrop-blur-md transition-all active:scale-95"
							onclick={openFullscreen}
							aria-label="Open fullscreen"
							title="Fullscreen"
						>
							<Maximize2 size={18} />
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div
				class="text-text/20 flex h-full items-center justify-center text-sm font-bold tracking-widest uppercase"
			>
				No webcam available
			</div>
		{/if}
	</div>

	<!-- Thumbnails strip -->
	{#if webcams.length > 1}
		<div class="scrollbar-none flex gap-3 overflow-x-auto pb-2">
			{#each webcams as webcam, index}
				<button
					class="border-border hover:border-primary/50 relative aspect-video w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl border transition-all {selectedWebcamIndex ===
					index
						? 'border-primary ring-primary ring-2'
						: 'opacity-60 hover:opacity-100'}"
					onclick={() => {
						isImageLoading = true;
						setWebcam(index);
					}}
				>
					<img
						src={webcam.thumbnailImage || webcam.largeImage}
						alt={webcam.name}
						class="h-full w-full object-cover"
						loading="lazy"
					/>
					<div
						class="from-background/90 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-1.5"
					>
						<p class="truncate text-[10px] font-bold">{webcam.name}</p>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Native Dialog Fullscreen Modal -->
<dialog
	bind:this={dialogElement}
	onclose={closeFullscreen}
	class="bg-background/95 fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-none p-0 text-white backdrop:bg-black/80 backdrop:backdrop-blur-xl"
>
	{#if isFullscreen && selectedWebcam}
		<div class="relative flex h-full w-full flex-col">
			<!-- Header Controls -->
			<div
				class="from-background/90 absolute inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b to-transparent p-6"
			>
				<div>
					<h2 class="text-xl font-bold tracking-tight">{selectedWebcam.name}</h2>
					<p class="text-text-muted text-xs">{placeName}</p>
				</div>

				<div class="flex items-center gap-3">
					<button
						class="bg-surface/80 hover:bg-surface border-border text-text cursor-pointer rounded-xl border p-2.5 backdrop-blur-md transition-all active:scale-95"
						onclick={toggleFullscreenMode}
						title={isPanoramaScroll ? 'Fit to screen' : 'Panorama scroll'}
						aria-label={isPanoramaScroll ? 'Fit to screen' : 'Panorama scroll'}
					>
						{#if isPanoramaScroll}
							<Minimize2 size={18} />
						{:else}
							<Maximize2 size={18} />
						{/if}
					</button>

					<button
						class="bg-surface/80 hover:bg-surface border-border text-text cursor-pointer rounded-xl border p-2.5 backdrop-blur-md transition-all active:scale-95"
						onclick={handleShare}
						title="Share webcam"
						aria-label="Share webcam"
					>
						{#if copied}
							<Check size={18} class="text-primary" />
						{:else}
							<Share2 size={18} />
						{/if}
					</button>

					<button
						class="bg-surface/80 hover:bg-surface border-border text-text cursor-pointer rounded-xl border p-2.5 backdrop-blur-md transition-all active:scale-95"
						onclick={closeFullscreen}
						title="Close fullscreen"
						aria-label="Close fullscreen"
					>
						<X size={18} />
					</button>
				</div>
			</div>

			<!-- Media Container -->
			<div
				bind:this={modalScrollContainer}
				class="flex flex-1 items-center justify-center overflow-auto {isPanoramaScroll
					? 'scrollbar-none cursor-grab active:cursor-grabbing'
					: ''}"
			>
				<img
					src={selectedWebcam.largeImage || selectedWebcam.thumbnailImage}
					alt={selectedWebcam.name}
					class="{isPanoramaScroll
						? 'h-full max-w-none object-contain'
						: 'max-h-full max-w-full object-contain'} select-none"
				/>
			</div>
		</div>
	{/if}
</dialog>
