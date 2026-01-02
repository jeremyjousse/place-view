<script lang="ts">
	import Input from '../atoms/Input.svelte';
	import Label from '../atoms/Label.svelte';
	import type { LocationPrediction } from '$lib/services/GeocodeService';

	interface Props {
		value: string;
		onSelect: (prediction: LocationPrediction) => void;
		id: string;
		label: string;
		required?: boolean;
	}

	let { value = $bindable(), onSelect, id, label, required = false }: Props = $props();

	let predictions = $state<LocationPrediction[]>([]);
	let open = $state(false);
	let loading = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	async function fetchPredictions(query: string) {
		if (query.length < 3) {
			predictions = [];
			open = false;
			return;
		}

		loading = true;
		try {
			const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
			if (response.ok) {
				predictions = await response.json();
				open = predictions.length > 0;
			}
		} catch (error) {
			console.error('Failed to fetch predictions', error);
		} finally {
			loading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const query = target.value;
		clearTimeout(timeout);
		timeout = setTimeout(() => fetchPredictions(query), 500);
	}

	function handleSelect(prediction: LocationPrediction) {
		value = prediction.displayName;
		onSelect(prediction);
		open = false;
		predictions = [];
	}

	function handleBlur() {
		// Small delay to allow click on item
		setTimeout(() => {
			open = false;
		}, 200);
	}
</script>

<div class="relative">
	<Label for={id}>{label}</Label>
	<div class="mt-1">
		<Input
			{id}
			name={id}
			bind:value
			oninput={handleInput}
			onblur={handleBlur}
			onfocus={() => {
				if (predictions.length > 0) open = true;
			}}
			placeholder="Search for a place..."
			{required}
			autocomplete="off"
		/>
	</div>

	{#if loading}
		<div class="absolute top-9 right-3">
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{/if}

	{#if open}
		<ul
			class="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm"
		>
			{#each predictions as prediction (prediction.id)}
				<li>
					<button
						type="button"
						class="relative w-full cursor-default py-2 pr-9 pl-3 text-left text-gray-900 select-none hover:bg-indigo-600 hover:text-white"
						onclick={() => handleSelect(prediction)}
					>
						<span class="block truncate font-normal">
							{prediction.displayName}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
