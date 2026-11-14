<script lang="ts">
	import { CheckCircle2, AlertCircle, Info, X } from 'lucide-svelte';

	export type ToastType = 'success' | 'error' | 'info';

	export interface ToastItem {
		id: number;
		message: string;
		type: ToastType;
	}

	interface Props {
		items: ToastItem[];
		onDismiss: (id: number) => void;
	}

	let { items, onDismiss }: Props = $props();
</script>

{#if items.length > 0}
	<div
		class="pointer-events-none fixed right-6 bottom-6 z-50 flex max-w-sm flex-col gap-3"
		aria-live="polite"
	>
		{#each items as item (item.id)}
			<div
				class="bg-surface pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl {item.type ===
				'success'
					? 'border-primary/40'
					: item.type === 'error'
						? 'border-red-500/40'
						: 'border-border'}"
			>
				{#if item.type === 'success'}
					<CheckCircle2 size={18} class="text-primary shrink-0" />
				{:else if item.type === 'error'}
					<AlertCircle size={18} class="shrink-0 text-red-400" />
				{:else}
					<Info size={18} class="text-text-muted shrink-0" />
				{/if}

				<p class="flex-1 text-sm font-medium text-white">{item.message}</p>

				<button
					type="button"
					onclick={() => onDismiss(item.id)}
					class="text-text-muted hover:text-text cursor-pointer rounded-lg p-1 transition-colors"
					aria-label="Dismiss notification"
				>
					<X size={14} />
				</button>
			</div>
		{/each}
	</div>
{/if}
