<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		actions?: Snippet;
	}

	let { title, actions }: Props = $props();
</script>

<div class="mb-8 flex items-center justify-between">
	<h1 class="text-3xl font-bold text-gray-900">{title}</h1>
	{#if actions}
		<div class="flex items-center space-x-4">
			{@render actions()}
		</div>
	{/if}
</div>
