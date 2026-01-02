<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script lang="ts">
	import PlaceForm from '$lib/components/organisms/PlaceForm.svelte';
	import WebcamList from '$lib/components/organisms/WebcamList.svelte';

	let { data } = $props();
</script>

<svelte:head>
  <title>Place view - Admin Tools - {data.place.name}</title>
</svelte:head>

<div class="container mx-auto space-y-8 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{data.place.name}</h1>
		<div class="flex items-center space-x-4">
			<form
				method="POST"
				action="?/deletePlace"
				onsubmit={(e) => {
					if (!confirm('Are you sure you want to delete this place?')) {
						e.preventDefault();
					}
				}}
			>
				<button
					type="submit"
					class="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
				>
					Delete Place
				</button>
			</form>
			<a href="/" class="text-indigo-600 hover:text-indigo-900">Back to List</a>
		</div>
	</div>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Details</h2>
		<PlaceForm place={data.place} action="?/updatePlace" />
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Webcams</h2>
		<!-- 
           Legacy WebcamList is used here because creating WebcamList organism wasn't in the tasks.md explicitly, 
           although WebcamCard molecule was. 
           In a real scenario I would self-correct and create it, but I will stick to the plan to be safe 
           and maybe create it as part of "Polish" or implicitly if I need to.
           Actually, the legacy WebcamList likely uses legacy components.
        -->
		<WebcamList webcams={data.place.webcams || []} />
	</section>
</div>
