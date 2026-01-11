<script lang="ts">
	import type { Webcam } from '$lib/domain/Webcam';
	import Button from '../atoms/Button.svelte';

	interface Props {
		webcam: Webcam;
		ondelete?: (event: MouseEvent) => void;
	}

	let { webcam, ondelete }: Props = $props();
</script>

<div class="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
	<img src={webcam.thumbnailImage} alt={webcam.name} class="h-16 w-24 rounded object-cover" />
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium text-gray-900">
			{webcam.name}
		</p>
		<p class="truncate text-xs text-gray-500">
			{webcam.thumbnailImage}
		</p>
		<a
			href={webcam.largeImage}
			target="_blank"
			rel="external noopener noreferrer"
			class="block truncate text-xs text-indigo-600 hover:text-indigo-900"
		>
			View Large Image
		</a>
	</div>
	<div>
		{#if ondelete}
			<Button variant="danger" onclick={ondelete} class="!p-2">
				<span class="sr-only">Delete</span>
				<!-- Trash Icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="3 6 5 6 21 6"></polyline>
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
					></path>
				</svg>
			</Button>
		{/if}
	</div>
</div>
