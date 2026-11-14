<script lang="ts">
	import type { LocationPrediction } from '@place-view/core';
	import { Loader2, MapPin } from 'lucide-svelte';
	import FormField from '../atoms/FormField.svelte';
	import Input from '../atoms/Input.svelte';

	interface Props {
		id: string;
		label: string;
		value: string;
		error?: string;
		required?: boolean;
		placeholder?: string;
		onSearch: (query: string) => Promise<LocationPrediction[]>;
		onSelect: (prediction: LocationPrediction) => void;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		required = false,
		placeholder = 'Type a resort or city (3+ chars for suggestions)...',
		onSearch,
		onSelect
	}: Props = $props();

	let predictions = $state<LocationPrediction[]>([]);
	let open = $state(false);
	let loading = $state(false);
	let highlightedIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let blurTimer: ReturnType<typeof setTimeout> | undefined;
	let requestSeq = 0;

	$effect(() => {
		return () => {
			clearTimeout(debounceTimer);
			clearTimeout(blurTimer);
		};
	});

	async function fetchPredictions(query: string) {
		const seq = ++requestSeq;
		if (query.trim().length < 3) {
			predictions = [];
			highlightedIndex = -1;
			open = false;
			loading = false;
			return;
		}

		loading = true;
		try {
			const results = await onSearch(query);
			if (seq !== requestSeq) return;
			predictions = results;
			highlightedIndex = results.length > 0 ? 0 : -1;
			open = results.length > 0;
		} catch (err) {
			if (seq !== requestSeq) return;
			console.error('Geocode lookup failed:', err);
			predictions = [];
			highlightedIndex = -1;
			open = false;
		} finally {
			if (seq === requestSeq) {
				loading = false;
			}
		}
	}

	function handleInput(e: Event) {
		const query = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			void fetchPredictions(query);
		}, 450);
	}

	function handleSelect(prediction: LocationPrediction) {
		clearTimeout(blurTimer);
		onSelect(prediction);
		open = false;
		predictions = [];
		highlightedIndex = -1;
	}

	function handleBlur() {
		blurTimer = setTimeout(() => {
			open = false;
		}, 180);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open || predictions.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % predictions.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightedIndex = (highlightedIndex - 1 + predictions.length) % predictions.length;
		} else if (e.key === 'Enter' && highlightedIndex >= 0) {
			e.preventDefault();
			handleSelect(predictions[highlightedIndex]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			open = false;
		}
	}
</script>

<div class="relative">
	<FormField {id} {label} {error} {required}>
		<div class="relative">
			<Input
				{id}
				name={id}
				type="text"
				bind:value
				invalid={Boolean(error)}
				oninput={handleInput}
				onblur={handleBlur}
				onkeydown={handleKeydown}
				onfocus={() => {
					if (predictions.length > 0) open = true;
				}}
				{placeholder}
				{required}
				autocomplete="off"
				role="combobox"
				aria-expanded={open}
				aria-controls="{id}-listbox"
				aria-autocomplete="list"
				aria-activedescendant={open && highlightedIndex >= 0
					? `${id}-option-${highlightedIndex}`
					: undefined}
				class="pr-10"
			/>

			{#if loading}
				<div class="text-primary absolute top-1/2 right-3 -translate-y-1/2">
					<Loader2 size={16} class="animate-spin" />
				</div>
			{/if}
		</div>
	</FormField>

	{#if open && predictions.length > 0}
		<ul
			id="{id}-listbox"
			class="bg-surface border-border absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-2xl border py-1.5 shadow-2xl"
			role="listbox"
		>
			{#each predictions as prediction, i (prediction.id)}
				<li id="{id}-option-{i}" role="option" aria-selected={i === highlightedIndex}>
					<button
						type="button"
						class="hover:bg-primary hover:text-primary-text flex w-full cursor-pointer items-start gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors {i ===
						highlightedIndex
							? 'bg-primary text-primary-text'
							: 'text-white'}"
						onmousedown={(e) => {
							e.preventDefault();
							handleSelect(prediction);
						}}
					>
						<MapPin size={14} class="mt-0.5 shrink-0 opacity-70" />
						<span class="line-clamp-2">{prediction.displayName}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
