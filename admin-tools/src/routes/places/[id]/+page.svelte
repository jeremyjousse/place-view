<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script lang="ts">
	import PlaceForm from '$lib/components/organisms/PlaceForm.svelte';
	import WebcamList from '$lib/components/organisms/WebcamList.svelte';
	import PageHeader from '$lib/components/organisms/PageHeader.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Place view - Admin Tools - {data.place.name}</title>
</svelte:head>

<div class="container mx-auto space-y-8 p-4">
	<PageHeader title={data.place.name}>
		{#snippet actions()}
			<form
				method="POST"
				action="?/deletePlace"
				onsubmit={(e) => {
					if (!confirm('Are you sure you want to delete this place?')) {
						e.preventDefault();
					}
				}}
			>
				<Button type="submit" variant="danger">Delete Place</Button>
			</form>
			<a href="/" class="text-sm font-semibold text-indigo-600 hover:text-indigo-900">Back to List</a>
		{/snippet}
	</PageHeader>

	<section>
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Details</h2>
		<PlaceForm place={data.place} action="?/updatePlace" />
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Webcams</h2>
		<WebcamList webcams={data.place.webcams || []} />
	</section>
</div>