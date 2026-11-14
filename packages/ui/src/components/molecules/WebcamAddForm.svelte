<script lang="ts">
	import { validateWebcam, type ValidationErrors, type Webcam } from '@place-view/core';
	import { Loader2, Plus, Sparkles } from 'lucide-svelte';
	import Button from '../atoms/Button.svelte';
	import FormField from '../atoms/FormField.svelte';
	import Input from '../atoms/Input.svelte';

	interface Props {
		busy?: boolean;
		onDetectUrl?: (url: string) => Promise<Webcam | null>;
		onAdd: (webcam: Webcam) => Promise<void>;
		onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
	}

	let { busy = false, onDetectUrl, onAdd, onNotify }: Props = $props();

	let detectUrl = $state('');
	let detecting = $state(false);
	let name = $state('');
	let largeImage = $state('');
	let thumbnailImage = $state('');
	let errors = $state<ValidationErrors>({});

	async function handleDetect() {
		if (!onDetectUrl || !detectUrl.trim() || detecting) return;
		detecting = true;
		try {
			const detected = await onDetectUrl(detectUrl);
			if (detected && detected.largeImage) {
				name = detected.name;
				largeImage = detected.largeImage;
				thumbnailImage = detected.thumbnailImage || detected.largeImage;
				errors = {};
				onNotify?.('Webcam detected from URL', 'success');
			} else {
				onNotify?.('Could not detect a supported webcam from that URL', 'error');
			}
		} catch (err) {
			onNotify?.(err instanceof Error ? err.message : 'Failed to detect webcam', 'error');
		} finally {
			detecting = false;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};

		const validation = validateWebcam({
			name,
			largeImage,
			thumbnailImage: thumbnailImage || largeImage
		});

		if (!validation.success) {
			errors = validation.errors;
			return;
		}

		try {
			await onAdd(validation.data);
			name = '';
			largeImage = '';
			thumbnailImage = '';
			detectUrl = '';
			onNotify?.('Webcam added', 'success');
		} catch (err) {
			onNotify?.(err instanceof Error ? err.message : 'Failed to add webcam', 'error');
		}
	}
</script>

<div class="bg-background/60 border-border space-y-5 rounded-2xl border p-5">
	<h3 class="text-sm font-black tracking-wider uppercase">Add New Webcam</h3>

	{#if onDetectUrl}
		<div class="border-border/60 space-y-2 border-b pb-5">
			<FormField
				id="webcam-detect-url"
				label="Auto-Detect from URL (Skaping, Webcam-HD, Trinum, Panomax, or .jpg)"
			>
				<div class="flex flex-col gap-2 sm:flex-row">
					<Input
						id="webcam-detect-url"
						type="url"
						variant="surface"
						bind:value={detectUrl}
						placeholder="https://www.skaping.com/..."
						class="flex-1"
					/>
					<Button
						variant="secondary"
						size="md"
						onclick={handleDetect}
						disabled={detecting || !detectUrl.trim()}
						class="shrink-0 gap-2"
					>
						{#if detecting}
							<Loader2 size={15} class="animate-spin" />
							Detecting...
						{:else}
							<Sparkles size={15} class="text-primary" />
							Detect
						{/if}
					</Button>
				</div>
			</FormField>
		</div>
	{/if}

	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<FormField id="new-webcam-name" label="Name" error={errors.name} required>
				<Input
					id="new-webcam-name"
					variant="surface"
					bind:value={name}
					invalid={Boolean(errors.name)}
					required
					placeholder="Summit Panorama"
				/>
			</FormField>

			<FormField id="new-webcam-large" label="Large Image URL" error={errors.largeImage} required>
				<Input
					id="new-webcam-large"
					type="url"
					variant="surface"
					bind:value={largeImage}
					invalid={Boolean(errors.largeImage)}
					required
					placeholder="https://..."
				/>
			</FormField>

			<FormField id="new-webcam-thumb" label="Thumbnail URL" error={errors.thumbnailImage}>
				<Input
					id="new-webcam-thumb"
					type="url"
					variant="surface"
					bind:value={thumbnailImage}
					invalid={Boolean(errors.thumbnailImage)}
					placeholder="Defaults to Large Image URL"
				/>
			</FormField>
		</div>

		{#if thumbnailImage || largeImage}
			<div class="bg-surface border-border flex items-center gap-4 rounded-2xl border p-3">
				<img
					src={thumbnailImage || largeImage}
					alt="Webcam preview"
					class="h-14 w-24 rounded-xl object-cover"
				/>
				<span class="text-text-muted text-xs font-medium">Live image preview</span>
			</div>
		{/if}

		<div class="flex justify-end">
			<Button type="submit" variant="primary" size="md" disabled={busy} class="gap-2">
				<Plus size={16} />
				Add Webcam
			</Button>
		</div>
	</form>
</div>
