<script lang="ts">
	import PlaceList from '$lib/components/organisms/PlaceList.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Place view - Admin Tools</title>
	<meta name="description" content="Home page of the admin tools" />
</svelte:head>

<div class="container mx-auto p-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Places</h1>
		<a
			href="/places/new"
			class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
		>
			Create New Place
		</a>
	</div>
	<PlaceList places={data.places} />
</div>
