<script lang="ts">
	import type { Snippet } from 'svelte';
	import { FileJson2, FolderOpen } from 'lucide-svelte';
	import { AdminHeader, Button, EmptyState } from '@place-view/ui';
	import { getAdminContext } from '#lib/admin/admin-context.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		backHref?: string;
		backLabel?: string;
		newHref?: string;
		contentClass?: string;
		children: Snippet;
	}

	let {
		title,
		subtitle,
		backHref,
		backLabel,
		newHref,
		contentClass = 'px-6 py-8 lg:px-12',
		children
	}: Props = $props();

	const { placesStore, notify } = getAdminContext();

	async function handlePickFile() {
		const loaded = await placesStore.pickAndLoadFile();
		if (loaded) {
			notify(`Loaded ${placesStore.places.length} places from ${placesStore.fileName}`, 'success');
		} else if (placesStore.error) {
			notify(placesStore.error, 'error');
		}
	}

	async function handleReload() {
		const loaded = await placesStore.reload();
		if (loaded) {
			notify('Reloaded places from local file', 'info');
		} else if (placesStore.error) {
			notify(placesStore.error, 'error');
		}
	}
</script>

<AdminHeader
	{title}
	{subtitle}
	{backHref}
	{backLabel}
	{newHref}
	filePath={placesStore.filePath}
	fileName={placesStore.fileName}
	isLoading={placesStore.isLoading}
	onPickFile={handlePickFile}
	onReload={handleReload}
/>

<div class={contentClass}>
	{#if !placesStore.filePath}
		<EmptyState
			title="Open Local places.json"
			error={placesStore.error}
			footnote="Your selection is remembered locally. Edits write directly to disk without committing to Git or altering the web Explorer."
		>
			{#snippet icon()}
				<FileJson2 size={32} />
			{/snippet}

			{#snippet description()}
				<p>
					Select your local <code class="text-primary font-mono">places.json</code> file (for
					example, <code class="font-mono text-white">resources/places.json</code>) to inspect,
					create, edit, or delete places and webcams.
				</p>
			{/snippet}

			{#snippet actions()}
				<Button
					variant="primary"
					size="lg"
					onclick={handlePickFile}
					disabled={placesStore.isLoading}
					class="gap-2.5"
				>
					<FolderOpen size={18} />
					{placesStore.isLoading ? 'Loading file...' : 'Select places.json'}
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		{@render children()}
	{/if}
</div>
