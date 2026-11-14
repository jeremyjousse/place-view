<script lang="ts">
	import { validateWebcam, type ValidationErrors, type Webcam } from '@place-view/core';
	import {
		ArrowDown,
		ArrowUp,
		Check,
		ExternalLink,
		GripVertical,
		Pencil,
		Trash2,
		X
	} from 'lucide-svelte';
	import Button from '../atoms/Button.svelte';
	import FormField from '../atoms/FormField.svelte';
	import IconButton from '../atoms/IconButton.svelte';
	import Input from '../atoms/Input.svelte';

	interface Props {
		webcam: Webcam;
		index: number;
		total: number;
		busy?: boolean;
		isDragTarget?: boolean;
		onMove: (delta: -1 | 1) => void;
		onSave: (webcam: Webcam) => Promise<void>;
		onRemove: () => void;
		onDragStart: () => void;
		onDragOver: (e: DragEvent) => void;
		onDragLeave: () => void;
		onDrop: (e: DragEvent) => void;
		onDragEnd: () => void;
	}

	let {
		webcam,
		index,
		total,
		busy = false,
		isDragTarget = false,
		onMove,
		onSave,
		onRemove,
		onDragStart,
		onDragOver,
		onDragLeave,
		onDrop,
		onDragEnd
	}: Props = $props();

	let editing = $state(false);
	let editName = $state('');
	let editLargeImage = $state('');
	let editThumbnailImage = $state('');
	let editErrors = $state<ValidationErrors>({});

	function startEdit() {
		editing = true;
		editName = webcam.name;
		editLargeImage = webcam.largeImage;
		editThumbnailImage = webcam.thumbnailImage;
		editErrors = {};
	}

	function cancelEdit() {
		editing = false;
		editErrors = {};
	}

	async function handleSave() {
		editErrors = {};
		const validation = validateWebcam({
			name: editName,
			largeImage: editLargeImage,
			thumbnailImage: editThumbnailImage || editLargeImage
		});

		if (!validation.success) {
			editErrors = validation.errors;
			return;
		}

		await onSave(validation.data);
		editing = false;
	}
</script>

<div
	role="listitem"
	draggable={!busy && !editing}
	ondragstart={onDragStart}
	ondragover={onDragOver}
	ondragleave={onDragLeave}
	ondrop={onDrop}
	ondragend={onDragEnd}
	class="bg-background/80 border-border rounded-2xl border p-4 transition-all {isDragTarget
		? 'border-primary ring-primary/30 ring-2'
		: ''}"
>
	{#if editing}
		<div class="space-y-3">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<FormField id="edit-cam-name-{index}" label="Name" error={editErrors.name} compact>
					<Input
						id="edit-cam-name-{index}"
						variant="surface"
						size="sm"
						bind:value={editName}
						invalid={Boolean(editErrors.name)}
					/>
				</FormField>

				<FormField
					id="edit-cam-large-{index}"
					label="Large Image URL"
					error={editErrors.largeImage}
					compact
				>
					<Input
						id="edit-cam-large-{index}"
						type="url"
						variant="surface"
						size="sm"
						bind:value={editLargeImage}
						invalid={Boolean(editErrors.largeImage)}
					/>
				</FormField>

				<FormField
					id="edit-cam-thumb-{index}"
					label="Thumbnail URL"
					error={editErrors.thumbnailImage}
					compact
				>
					<Input
						id="edit-cam-thumb-{index}"
						type="url"
						variant="surface"
						size="sm"
						bind:value={editThumbnailImage}
						invalid={Boolean(editErrors.thumbnailImage)}
					/>
				</FormField>
			</div>

			<div class="flex justify-end gap-2">
				<Button variant="ghost" size="sm" onclick={cancelEdit} class="gap-1">
					<X size={14} />
					Cancel
				</Button>
				<Button variant="primary" size="sm" onclick={handleSave} disabled={busy} class="gap-1">
					<Check size={14} />
					Save
				</Button>
			</div>
		</div>
	{:else}
		<div class="flex flex-wrap items-center gap-4">
			<div
				class="text-text-muted/50 hidden cursor-grab active:cursor-grabbing sm:block"
				title="Drag to reorder"
			>
				<GripVertical size={18} />
			</div>

			<div class="bg-surface border-border h-16 w-24 shrink-0 overflow-hidden rounded-xl border">
				<img
					src={webcam.thumbnailImage || webcam.largeImage}
					alt={webcam.name}
					loading="lazy"
					class="h-full w-full object-cover"
				/>
			</div>

			<div class="min-w-0 flex-1 space-y-1">
				<p class="truncate text-sm font-bold text-white">{webcam.name}</p>
				<p class="text-text-muted truncate font-mono text-[11px]">{webcam.thumbnailImage}</p>
				<a
					href={webcam.largeImage}
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary inline-flex items-center gap-1 text-[11px] font-bold hover:underline"
				>
					Open Large Image
					<ExternalLink size={11} />
				</a>
			</div>

			<div class="flex items-center gap-1.5">
				<IconButton
					label="Move webcam up"
					title="Move up"
					disabled={busy || index === 0}
					onclick={() => onMove(-1)}
				>
					<ArrowUp size={14} />
				</IconButton>
				<IconButton
					label="Move webcam down"
					title="Move down"
					disabled={busy || index === total - 1}
					onclick={() => onMove(1)}
				>
					<ArrowDown size={14} />
				</IconButton>
				<IconButton label="Edit webcam" tone="primary" disabled={busy} onclick={startEdit}>
					<Pencil size={14} />
				</IconButton>
				<IconButton label="Remove webcam" tone="danger" disabled={busy} onclick={onRemove}>
					<Trash2 size={14} />
				</IconButton>
			</div>
		</div>
	{/if}
</div>
