<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		label: string;
		error?: string;
		required?: boolean;
		compact?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		id,
		label,
		error,
		required = false,
		compact = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class="{compact ? 'space-y-1' : 'space-y-1.5'} {className}">
	<label
		for={id}
		class="text-text-muted block font-black tracking-widest uppercase {compact
			? 'text-[10px]'
			: 'text-[11px]'}"
	>
		{label}{#if required}<span class="text-primary ml-1">*</span>{/if}
	</label>

	{@render children()}

	{#if error}
		<p
			id="{id}-error"
			class="font-medium text-red-400 {compact ? 'text-[11px]' : 'text-xs'}"
			role="alert"
		>
			{error}
		</p>
	{/if}
</div>
