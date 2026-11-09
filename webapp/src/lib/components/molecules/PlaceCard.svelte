<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import Badge from '../atoms/Badge.svelte';
	import type { Webcam } from '#lib/common/domain/Webcam';

	interface Props {
		place: {
			id: string;
			name: string;
			state?: string;
			country?: string;
			webcams: Webcam[];
		};
		isFavorite?: boolean;
		onToggleFavorite?: (favorite: boolean) => void;
	}

	let { place, isFavorite = false, onToggleFavorite }: Props = $props();

	const previewUrl = $derived(
		place.webcams[0]?.thumbnailImage || place.webcams[0]?.largeImage || ''
	);
	const webcamsCount = $derived(place.webcams.length);
</script>

<div
	class="card-flat group bg-surface border-border hover:border-primary/50 relative flex h-full flex-col border p-3 transition-all duration-300 hover:shadow-2xl"
>
	<button
		class="absolute top-6 right-6 z-10 rounded-full bg-black/20 p-2.5 text-white backdrop-blur-md transition-all hover:bg-black/40 active:scale-90"
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onToggleFavorite?.(!isFavorite);
		}}
	>
		<Heart
			size={18}
			fill={isFavorite ? '#C5FF29' : 'none'}
			stroke={isFavorite ? '#C5FF29' : 'currentColor'}
		/>
	</button>

	<a href="/place/{place.id}" class="flex h-full flex-col">
		<div class="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900">
			{#if previewUrl}
				<img
					src={previewUrl}
					alt={place.name}
					loading="lazy"
					class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
			{:else}
				<div
					class="text-text/10 flex h-full w-full items-center justify-center text-3xl font-black tracking-tighter uppercase"
				>
					NO VIEW
				</div>
			{/if}

			<div class="absolute bottom-3 left-3">
				<Badge variant="primary">{webcamsCount} {webcamsCount > 1 ? 'CAMERAS' : 'CAMERA'}</Badge>
			</div>
		</div>

		<div class="px-2 pb-2">
			<h3 class="mb-0.5 text-lg font-bold tracking-tight">{place.name}</h3>
			<p class="text-text-muted text-[10px] font-black tracking-widest uppercase opacity-60">
				{place.state}{place.country ? ` • ${place.country}` : ''}
			</p>
		</div>
	</a>
</div>
