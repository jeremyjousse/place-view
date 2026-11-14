<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AlertCircle } from 'lucide-svelte';

	interface Props {
		title: string;
		description?: Snippet;
		icon?: Snippet;
		error?: string | null;
		actions?: Snippet;
		footnote?: string;
	}

	let { title, description, icon, error = null, actions, footnote }: Props = $props();
</script>

<div class="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center">
	<div class="bg-surface border-border w-full space-y-6 rounded-3xl border p-8 shadow-2xl lg:p-10">
		{#if icon}
			<div
				class="bg-primary/15 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
			>
				{@render icon()}
			</div>
		{/if}

		<div class="space-y-2">
			<h2 class="text-2xl font-black tracking-tight">{title}</h2>
			{#if description}
				<div class="text-text-muted text-sm leading-relaxed">
					{@render description()}
				</div>
			{/if}
		</div>

		{#if error}
			<div
				class="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-left text-xs text-red-300"
				role="alert"
			>
				<AlertCircle size={16} class="mt-0.5 shrink-0 text-red-400" />
				<span>{error}</span>
			</div>
		{/if}

		{#if actions || footnote}
			<div class="flex flex-col items-center gap-3 pt-2">
				{@render actions?.()}
				{#if footnote}
					<p class="text-text-muted/70 text-[11px]">{footnote}</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
