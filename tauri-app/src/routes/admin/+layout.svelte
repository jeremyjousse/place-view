<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isDesktopTauri } from '#lib/platform';
	import { createTauriAdminContext, setAdminContext } from '#lib/admin/admin-context.svelte';

	let { children } = $props();

	const isDesktop = isDesktopTauri();
	const adminContext = setAdminContext(createTauriAdminContext());

	onMount(() => {
		if (!isDesktop) {
			void goto('/', { replaceState: true });
			return;
		}
		void adminContext.placesStore.restoreRememberedFile();
	});
</script>

{#if isDesktop}
	{@render children()}
{/if}
