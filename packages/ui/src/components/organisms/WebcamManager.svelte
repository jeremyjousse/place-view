<script lang="ts">
	import type { Webcam } from '@place-view/core';
	import { Camera } from 'lucide-svelte';
	import Badge from '../atoms/Badge.svelte';
	import WebcamAddForm from '../molecules/WebcamAddForm.svelte';
	import WebcamRow from '../molecules/WebcamRow.svelte';

	interface Props {
		webcams: Webcam[];
		busy?: boolean;
		onDetectUrl?: (url: string) => Promise<Webcam | null>;
		onAdd: (webcam: Webcam) => Promise<void>;
		onUpdate: (index: number, webcam: Webcam) => Promise<void>;
		onRemove: (index: number) => Promise<void>;
		onReorder: (fromIndex: number, toIndex: number) => Promise<void>;
		onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
	}

	let {
		webcams,
		busy = false,
		onDetectUrl,
		onAdd,
		onUpdate,
		onRemove,
		onReorder,
		onNotify
	}: Props = $props();

	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	async function runWithNotification(
		action: () => Promise<void>,
		successMsg: string,
		errorMsg: string
	) {
		try {
			await action();
			onNotify?.(successMsg, 'success');
		} catch (err) {
			onNotify?.(err instanceof Error ? err.message : errorMsg, 'error');
		}
	}

	function handleMove(index: number, delta: -1 | 1) {
		const target = index + delta;
		if (target < 0 || target >= webcams.length) return;
		void runWithNotification(
			() => onReorder(index, target),
			'Webcam order updated',
			'Failed to reorder webcams'
		);
	}

	function handleDrop(targetIndex: number) {
		const from = draggedIndex;
		draggedIndex = null;
		dragOverIndex = null;
		if (from === null || from === targetIndex) return;
		void runWithNotification(
			() => onReorder(from, targetIndex),
			'Webcam order saved',
			'Failed to reorder webcams'
		);
	}
</script>

<div class="bg-surface border-border space-y-6 rounded-3xl border p-6 shadow-2xl lg:p-8">
	<div class="flex items-center justify-between gap-3">
		<div>
			<h2 class="text-lg font-black tracking-tight">Webcams</h2>
			<p class="text-text-muted text-xs">
				Drag or use arrows to reorder. Auto-detect supports Skaping, Webcam-HD, Trinum, Panomax, or
				direct JPG links.
			</p>
		</div>
		<Badge variant="secondary">{webcams.length} {webcams.length === 1 ? 'CAM' : 'CAMS'}</Badge>
	</div>

	{#if webcams.length === 0}
		<div
			class="border-border/80 bg-background/40 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-10 text-center"
		>
			<Camera size={24} class="text-text-muted/50" />
			<p class="text-text-muted text-sm font-medium">No webcams configured yet.</p>
		</div>
	{:else}
		<div class="space-y-3" role="list">
			{#each webcams as webcam, index (`${webcam.largeImage}-${index}`)}
				<WebcamRow
					{webcam}
					{index}
					total={webcams.length}
					{busy}
					isDragTarget={dragOverIndex === index}
					onMove={(delta) => handleMove(index, delta)}
					onSave={(next) =>
						runWithNotification(
							() => onUpdate(index, next),
							'Webcam updated',
							'Failed to update webcam'
						)}
					onRemove={() =>
						void runWithNotification(
							() => onRemove(index),
							'Webcam removed',
							'Failed to remove webcam'
						)}
					onDragStart={() => {
						draggedIndex = index;
					}}
					onDragOver={(e) => {
						e.preventDefault();
						dragOverIndex = index;
					}}
					onDragLeave={() => {
						if (dragOverIndex === index) dragOverIndex = null;
					}}
					onDrop={(e) => {
						e.preventDefault();
						handleDrop(index);
					}}
					onDragEnd={() => {
						draggedIndex = null;
						dragOverIndex = null;
					}}
				/>
			{/each}
		</div>
	{/if}

	<WebcamAddForm {busy} {onDetectUrl} {onAdd} {onNotify} />
</div>
