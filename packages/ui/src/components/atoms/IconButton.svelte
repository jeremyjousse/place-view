<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'default' | 'primary' | 'danger';

	interface Props {
		label: string;
		title?: string;
		tone?: Tone;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		class?: string;
		children: Snippet;
	}

	let {
		label,
		title = label,
		tone = 'default',
		disabled = false,
		onclick,
		class: className = '',
		children
	}: Props = $props();

	const toneClasses: Record<Tone, string> = {
		default: 'text-text-muted hover:text-text',
		primary: 'text-text-muted hover:text-primary',
		danger: 'text-text-muted hover:border-red-500/40 hover:text-red-400'
	};
</script>

<button
	type="button"
	{onclick}
	{disabled}
	{title}
	aria-label={label}
	class="bg-surface border-border cursor-pointer rounded-xl border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30 {toneClasses[
		tone
	]} {className}"
>
	{@render children()}
</button>
