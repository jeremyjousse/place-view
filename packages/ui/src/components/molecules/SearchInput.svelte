<script lang="ts">
	import { Search } from 'lucide-svelte';
	import Input from '../atoms/Input.svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		onInput?: (value: string) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		onInput,
		class: className = ''
	}: Props = $props();
</script>

<div class="relative w-full {className}">
	<Search
		class="text-text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
		size={16}
	/>
	<Input
		type="text"
		variant="surface"
		bind:value
		{placeholder}
		oninput={(e: Event) => onInput?.((e.target as HTMLInputElement).value)}
		class="pl-11"
	/>
</div>
