<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		busyConfirmLabel?: string;
		cancelLabel?: string;
		busy?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmLabel = 'Delete',
		busyConfirmLabel = 'Deleting...',
		cancelLabel = 'Cancel',
		busy = false,
		onConfirm,
		onCancel
	}: Props = $props();

	let dialogEl = $state<HTMLElement>();
	let previousFocus: HTMLElement | null = null;

	$effect(() => {
		if (open) {
			previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			queueMicrotask(() => {
				const cancelBtn = dialogEl?.querySelector<HTMLButtonElement>(
					'[data-dialog-actions] button'
				);
				cancelBtn?.focus();
			});
		} else if (previousFocus) {
			previousFocus.focus();
			previousFocus = null;
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (open && e.key === 'Escape' && !busy) {
			onCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-dialog-title"
	>
		<button
			type="button"
			tabindex={-1}
			class="fixed inset-0 cursor-default"
			onclick={() => !busy && onCancel()}
			aria-label="Close confirmation dialog"
		></button>

		<div
			bind:this={dialogEl}
			class="bg-surface border-border relative z-10 w-full max-w-md space-y-6 rounded-3xl border p-6 shadow-2xl"
		>
			<div class="flex items-start gap-4">
				<div class="rounded-2xl bg-red-500/15 p-3 text-red-400">
					<AlertTriangle size={22} />
				</div>
				<div class="space-y-1.5">
					<h2 id="confirm-dialog-title" class="text-lg font-black tracking-tight">{title}</h2>
					<p class="text-text-muted text-sm leading-relaxed">{message}</p>
				</div>
			</div>

			<div class="flex justify-end gap-3" data-dialog-actions>
				<Button variant="secondary" size="sm" onclick={onCancel} disabled={busy}>
					{cancelLabel}
				</Button>
				<Button variant="danger" size="sm" onclick={onConfirm} disabled={busy}>
					{busy ? busyConfirmLabel : confirmLabel}
				</Button>
			</div>
		</div>
	</div>
{/if}
