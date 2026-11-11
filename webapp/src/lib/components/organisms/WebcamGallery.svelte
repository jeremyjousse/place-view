<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { X, Maximize2, Minimize2, Share2, Check } from 'lucide-svelte';
	import type { Webcam } from '#lib/common/domain/Webcam';
	import { webcamIndexFromUrl, withParameters } from '#lib/url-state';

	let {
		webcams,
		placeName
	}: {
		webcams: Webcam[];
		placeName: string;
	} = $props();

	const STORAGE_KEY_FULLSCREEN_MODE = 'webcamFullscreenMode';

	let urlWebcamIndex = $derived(webcamIndexFromUrl(page.url, webcams));
	let selectedWebcamIndex = $state(0);
	const selectedWebcam = $derived(webcams[selectedWebcamIndex]);
	let isImageLoading = $state(true);
	let isFullscreen = $state(false);
	let isPanoramaScroll = $state(true); // Panorama par défaut
	let scrollContainer: HTMLDivElement | undefined = $state();
	let modalScrollContainer: HTMLDivElement | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();
	let copied = $state(false);

	function updateWebcamUrl(index: number | null, replace = false) {
		const targetParam = index !== null ? (index + 1).toString() : null;
		if (page.url.searchParams.get('webcam') === targetParam) return;
		const url = withParameters(page.url, { webcam: targetParam });
		void goto(url, { replace, reset: false }).catch((err) =>
			console.error('Failed to update webcam URL:', err)
		);
	}

	function toggleFullscreenMode() {
		isPanoramaScroll = !isPanoramaScroll;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_FULLSCREEN_MODE, isPanoramaScroll ? 'panorama' : 'fit');
		}
		if (isPanoramaScroll) {
			setTimeout(centerModalScroll, 50);
		}
	}

	function openFullscreen() {
		if (selectedWebcam?.largeImage) {
			updateWebcamUrl(selectedWebcamIndex, false);
		}
	}

	function closeFullscreen() {
		updateWebcamUrl(null, true);
		if (dialogElement?.open) {
			dialogElement.close();
		}
		isFullscreen = false;
	}

	function nextWebcam() {
		if (webcams.length > 1) {
			const nextIndex = (selectedWebcamIndex + 1) % webcams.length;
			isImageLoading = true;
			updateWebcamUrl(nextIndex, true);
			if (isPanoramaScroll) {
				setTimeout(centerModalScroll, 50);
			}
		}
	}

	function prevWebcam() {
		if (webcams.length > 1) {
			const prevIndex = (selectedWebcamIndex - 1 + webcams.length) % webcams.length;
			isImageLoading = true;
			updateWebcamUrl(prevIndex, true);
			if (isPanoramaScroll) {
				setTimeout(centerModalScroll, 50);
			}
		}
	}

	async function handleShare() {
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({
					title: `${selectedWebcam?.name ?? 'Webcam'} - ${placeName}`,
					text: `Check out live webcam for ${selectedWebcam?.name ?? placeName}`,
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

	function centerModalScroll() {
		if (modalScrollContainer) {
			modalScrollContainer.scrollLeft =
				(modalScrollContainer.scrollWidth - modalScrollContainer.clientWidth) / 2;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isFullscreen) return;

		if (event.key === 'Escape') {
			closeFullscreen();
		} else if (event.key === 'ArrowRight') {
			nextWebcam();
		} else if (event.key === 'ArrowLeft') {
			prevWebcam();
		}
	}

	$effect(() => {
		const targetIndex = urlWebcamIndex;
		if (targetIndex !== undefined) {
			if (selectedWebcamIndex !== targetIndex) {
				selectedWebcamIndex = targetIndex;
				isImageLoading = true;
			}
			if (dialogElement && webcams[targetIndex]?.largeImage) {
				isFullscreen = true;
				if (!dialogElement.open) {
					dialogElement.showModal();
				}
				if (isPanoramaScroll) {
					setTimeout(centerModalScroll, 50);
				}
			}
		} else {
			if (isFullscreen && dialogElement) {
				isFullscreen = false;
				if (dialogElement.open) {
					dialogElement.close();
				}
			}
		}
	});

	onMount(() => {
		if (browser) {
			const saved = localStorage.getItem(STORAGE_KEY_FULLSCREEN_MODE);
			if (saved !== null) {
				isPanoramaScroll = saved === 'panorama';
			}
		}
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<div
	class="border-border group relative aspect-video cursor-pointer overflow-hidden rounded-3xl border bg-neutral-900 shadow-2xl"
	onclick={openFullscreen}
	role="button"
	tabindex="0"
	aria-label="View webcam fullscreen"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openFullscreen();
		}
	}}
>
	{#if selectedWebcam?.largeImage}
		<div bind:this={scrollContainer} class="absolute inset-0 flex overflow-auto">
			{#if isImageLoading}
				<div class="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900">
					<div
						class="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
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

		<!-- Expand button hint -->
		<div
			class="absolute top-4 right-4 z-10 rounded-full bg-black/40 p-2 text-white/80 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-black/60 hover:text-white"
			title="Click to view fullscreen"
		>
			<Maximize2 size={18} />
		</div>

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

<!-- Thumbnails Scroll (Page View) -->
{#if webcams.length > 1}
	<div class="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
		{#each webcams as webcam, i (`${webcam.name}-${i}`)}
			<button
				onclick={(e) => {
					e.stopPropagation();
					if (selectedWebcamIndex !== i) {
						selectedWebcamIndex = i;
						isImageLoading = true;
					}
				}}
				class="aspect-video w-48 flex-none overflow-hidden rounded-2xl border bg-neutral-900 {selectedWebcamIndex ===
				i
					? 'border-primary ring-primary/40 ring-2'
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
{/if}

<!-- Fullscreen 100% Overlay Dialog -->
<dialog
	bind:this={dialogElement}
	onclose={closeFullscreen}
	oncancel={(e) => {
		e.preventDefault();
		closeFullscreen();
	}}
	class="fixed inset-0 z-[99999] m-0 h-screen max-h-none w-screen max-w-none overflow-hidden border-0 bg-black p-0 select-none backdrop:bg-black"
>
	{#if isFullscreen && selectedWebcam?.largeImage}
		<!-- 3 Overlay elements: Titre (left) | Fit Screen + Croix (right) -->
		<div
			class="pointer-events-none absolute top-0 right-0 left-0 z-30 flex items-center justify-between p-4 sm:p-6"
		>
			<!-- 1. Titre de l'image -->
			<div
				class="pointer-events-auto rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 shadow-2xl backdrop-blur-md"
			>
				<h2 class="text-sm leading-tight font-bold text-white sm:text-base">
					{selectedWebcam.name}
				</h2>
				{#if placeName}
					<p class="text-[11px] font-medium text-white/60">{placeName}</p>
				{/if}
			</div>

			<!-- 2. Bouton Fit screen & 3. Share & 4. Croix de fermeture -->
			<div class="pointer-events-auto flex items-center gap-3">
				<!-- Fit Screen toggle -->
				<button
					onclick={(e) => {
						e.stopPropagation();
						toggleFullscreenMode();
					}}
					class="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-all hover:border-white/20 hover:bg-black/80 active:scale-95"
					title={isPanoramaScroll ? 'Fit whole image to screen' : 'Expand panorama view'}
				>
					{#if isPanoramaScroll}
						<Minimize2 size={16} />
						<span>Fit Screen</span>
					{:else}
						<Maximize2 size={16} />
						<span>Panorama</span>
					{/if}
				</button>

				<!-- Share webcam button -->
				<button
					onclick={(e) => {
						e.stopPropagation();
						void handleShare();
					}}
					class="cursor-pointer rounded-full border border-white/10 bg-black/60 p-2.5 text-white shadow-2xl backdrop-blur-md transition-all hover:border-white/20 hover:bg-black/80 active:scale-95"
					aria-label="Share webcam"
					title="Share webcam"
				>
					{#if copied}
						<Check size={20} class="text-primary" />
					{:else}
						<Share2 size={20} />
					{/if}
				</button>

				<!-- Close button -->
				<button
					onclick={(e) => {
						e.stopPropagation();
						closeFullscreen();
					}}
					class="cursor-pointer rounded-full border border-white/10 bg-black/60 p-2.5 text-white shadow-2xl backdrop-blur-md transition-all hover:border-white/20 hover:bg-black/80 active:scale-95"
					aria-label="Close fullscreen"
					title="Close (Esc or click on image)"
				>
					<X size={20} />
				</button>
			</div>
		</div>

		<!-- 100% Fullscreen Image (clic ferme le mode plein écran) -->
		{#if isPanoramaScroll}
			<!-- Mode Panorama : 100% de la hauteur, scrollable horizontalement, clic pour fermer -->
			<div
				bind:this={modalScrollContainer}
				class="fixed inset-0 flex h-full w-full cursor-pointer items-center overflow-x-auto overflow-y-hidden"
				onclick={closeFullscreen}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter') closeFullscreen();
				}}
			>
				<img
					src={selectedWebcam.largeImage}
					alt={selectedWebcam.name}
					class="m-auto h-full w-auto max-w-none object-cover"
					onload={centerModalScroll}
				/>
			</div>
		{:else}
			<!-- Mode Fit : 100% plein écran ajusté (object-contain), clic pour fermer -->
			<div
				class="fixed inset-0 flex h-full w-full cursor-pointer items-center justify-center"
				onclick={closeFullscreen}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter') closeFullscreen();
				}}
			>
				<img
					src={selectedWebcam.largeImage}
					alt={selectedWebcam.name}
					class="h-full w-full object-contain"
				/>
			</div>
		{/if}
	{/if}
</dialog>
