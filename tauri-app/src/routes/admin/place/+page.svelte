<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Button,
		ConfirmDialog,
		PlaceForm,
		WebcamManager,
		type PlaceFormValues
	} from '@place-view/ui';
	import { ExternalLink, Trash2 } from 'lucide-svelte';
	import { getAdminContext } from '#lib/admin/admin-context.svelte';
	import AdminShell from '#lib/components/admin/AdminShell.svelte';

	const { placesStore, notify, detectWebcam, searchLocations } = getAdminContext();
	const placeId = $derived(page.url.searchParams.get('id') ?? '');
	const place = $derived(placeId ? placesStore.getById(placeId) : undefined);

	let showDeleteModal = $state(false);
	let deleting = $state(false);

	async function handleUpdate(values: PlaceFormValues) {
		if (!place) return;
		await placesStore.updatePlace(place.id, {
			name: values.name,
			country: values.country,
			state: values.state,
			url: values.url,
			description: values.description || undefined,
			coordinates: {
				latitude: values.latitude,
				longitude: values.longitude
			}
		});
		notify(`Saved "${values.name}"`, 'success');
	}

	async function confirmDelete() {
		if (!place || deleting) return;
		deleting = true;
		try {
			const deletedName = place.name;
			await placesStore.deletePlace(place.id);
			showDeleteModal = false;
			notify(`Deleted "${deletedName}"`, 'success');
			await goto('/admin/');
		} catch (err) {
			notify(err instanceof Error ? err.message : 'Failed to delete place', 'error');
		} finally {
			deleting = false;
		}
	}
</script>

<AdminShell
	title={place ? place.name : 'Edit Place'}
	subtitle={place ? place.id : undefined}
	backHref="/admin/"
	backLabel="Back to Places"
	contentClass="mx-auto max-w-5xl space-y-8 px-6 py-8 lg:px-12"
>
	{#if !place}
		<div class="bg-surface border-border space-y-4 rounded-3xl border p-8 text-center">
			<h2 class="text-xl font-black">Place Not Found</h2>
			<p class="text-text-muted text-sm">
				No place with ID <code class="font-mono text-white">{placeId || '(missing)'}</code> was
				found in <code class="font-mono text-white">{placesStore.fileName}</code>.
			</p>
			<div class="pt-2">
				<Button variant="primary" href="/admin/">Return to Places List</Button>
			</div>
		</div>
	{:else}
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				{#if place.url}
					<Button
						variant="secondary"
						size="sm"
						href={place.url}
						target="_blank"
						rel="noopener noreferrer"
						class="gap-2"
					>
						<ExternalLink size={14} />
						Official Website
					</Button>
				{/if}
			</div>

			<Button
				variant="danger-outline"
				size="sm"
				onclick={() => (showDeleteModal = true)}
				class="gap-2"
			>
				<Trash2 size={14} />
				Delete Place
			</Button>
		</div>

		<PlaceForm
			{place}
			mode="edit"
			saving={placesStore.isSaving}
			onSearchLocations={searchLocations}
			onSubmit={handleUpdate}
		/>

		<WebcamManager
			webcams={place.webcams ?? []}
			busy={placesStore.isSaving}
			onDetectUrl={detectWebcam}
			onNotify={notify}
			onAdd={async (cam) => {
				await placesStore.addWebcam(place.id, cam);
			}}
			onUpdate={async (index, cam) => {
				await placesStore.updateWebcam(place.id, index, cam);
			}}
			onRemove={async (index) => {
				await placesStore.removeWebcam(place.id, index);
			}}
			onReorder={async (from, to) => {
				await placesStore.reorderWebcam(place.id, from, to);
			}}
		/>

		<ConfirmDialog
			open={showDeleteModal}
			title="Delete Place"
			message={`Are you sure you want to remove "${place.name}" and its ${place.webcams?.length ?? 0} webcam(s) from ${placesStore.fileName}?`}
			confirmLabel="Delete Place"
			busy={deleting}
			onConfirm={confirmDelete}
			onCancel={() => (showDeleteModal = false)}
		/>
	{/if}
</AdminShell>
