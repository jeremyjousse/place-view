<script lang="ts">
	import type { Webcam } from '$lib/domain/Webcam';
	import { enhance, deserialize } from '$app/forms';
	import { addToast } from '$lib/stores/toast';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import WebcamCard from '../molecules/WebcamCard.svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		webcams: Webcam[];
	}

	let { webcams }: Props = $props();

	type DraggableWebcam = Webcam & { id: string };

	let items = $state<DraggableWebcam[]>([]);

	$effect(() => {
		items = webcams.map((w) => ({ ...w, id: w.largeImage }));
	});

	const flipDurationMs = 300;
	let saveForm: HTMLFormElement;

	function handleDndConsider(e: CustomEvent<DndEvent<DraggableWebcam>>) {
		items = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<DraggableWebcam>>) {
		items = e.detail.items;
		saveForm.requestSubmit();
	}

	let newWebcam = $state({
		name: '',
		largeImage: '',
		thumbnailImage: '',
		detectUrl: ''
	});

	let detecting = $state(false);

	async function handleDetect() {
		if (!newWebcam.detectUrl) return;
		detecting = true;
		try {
			const formData = new FormData();
			formData.append('url', newWebcam.detectUrl);
			const response = await fetch('?/detectWebcam', {
				method: 'POST',
				body: formData,
				headers: {
					'x-sveltekit-action': 'true'
				}
			});
			const result = deserialize(await response.text());
			console.log('Webcam detection result:', result);
			if (result.type === 'success' && result.data && 'detected' in result.data) {
				const detected = result.data.detected as Webcam;
				newWebcam.name = detected.name;
				newWebcam.largeImage = detected.largeImage;
				newWebcam.thumbnailImage = detected.thumbnailImage;
				addToast('Webcam detected successfully', 'success');
			} else {
				addToast('Could not detect webcam from URL', 'error');
			}
		} catch {
			addToast('Error detecting webcam', 'error');
		} finally {
			detecting = false;
		}
	}
</script>

<div class="mt-8 space-y-6 border-t pt-8">
	<h3 class="text-lg leading-6 font-medium text-gray-900">Webcams</h3>

	<form
		method="POST"
		action="?/saveWebcamOrder"
		bind:this={saveForm}
		class="hidden"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					addToast('Webcam order saved', 'success');
				} else {
					addToast('Failed to save webcam order', 'error');
				}
				await update();
			};
		}}
	>
		<input type="hidden" name="webcams" value={JSON.stringify(items)} />
	</form>

	<div
		class="flex flex-col gap-4"
		use:dndzone={{ items, flipDurationMs }}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
	>
		{#each items as webcam (webcam.id)}
			<div animate:flip={{ duration: flipDurationMs }} class="relative">
				<form
					method="POST"
					action="?/removeWebcam"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								addToast('Webcam removed successfully', 'success');
							} else {
								addToast('Failed to remove webcam', 'error');
							}
							await update();
						};
					}}
				>
										<input
											type="hidden"
											name="index"
											value={webcams.findIndex((w) => w.largeImage === webcam.largeImage)}
										/>
										<WebcamCard
											{webcam}
											ondelete={(e) => {
												const form = (e.currentTarget as HTMLElement).closest('form');
												if (form) form.requestSubmit();
											}}
										/>
									</form>
			</div>
		{/each}
	</div>

	<div class="rounded-md bg-gray-50 p-4">
		<h4 class="mb-4 text-sm font-medium text-gray-900">Add New Webcam</h4>

		<div class="mb-6 space-y-2 border-b pb-6">
			<label for="detect-url" class="block text-sm font-medium text-gray-700"
				>Detect from URL (Skaping, Trinum, Panomax or .jpg)</label
			>
			<div class="flex gap-2">
				<input
					type="url"
					id="detect-url"
					bind:value={newWebcam.detectUrl}
					placeholder="https://www.skaping.com/..."
					class="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
				<Button onclick={handleDetect} disabled={detecting || !newWebcam.detectUrl}>
					{detecting ? 'Detecting...' : 'Detect'}
				</Button>
			</div>
		</div>

		<form
			method="POST"
			action="?/addWebcam"
			class="space-y-4"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						addToast('Webcam added successfully', 'success');
						newWebcam.name = '';
						newWebcam.largeImage = '';
						newWebcam.thumbnailImage = '';
						newWebcam.detectUrl = '';
					} else {
						addToast('Failed to add webcam', 'error');
					}
					await update();
				};
			}}
		>
			<div>
				<label for="webcam-name" class="block text-sm font-medium text-gray-700">Name</label>
				<input
					type="text"
					name="name"
					id="webcam-name"
					required
					bind:value={newWebcam.name}
					class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			<div>
				<label for="webcam-large" class="block text-sm font-medium text-gray-700"
					>Large Image URL</label
				>
				<input
					type="url"
					name="largeImage"
					id="webcam-large"
					required
					bind:value={newWebcam.largeImage}
					class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			<div>
				<label for="webcam-thumb" class="block text-sm font-medium text-gray-700"
					>Thumbnail Image URL</label
				>
				<input
					type="url"
					name="thumbnailImage"
					id="webcam-thumb"
					required
					bind:value={newWebcam.thumbnailImage}
					class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			<Button type="submit">Add Webcam</Button>
		</form>
	</div>
</div>
