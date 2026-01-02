<script lang="ts">
	import Input from '../atoms/Input.svelte';
	import Icon from '../atoms/Icon.svelte';

	interface Props {
		value?: string;
		placeholder?: string;
	}

	let { value = $bindable(''), placeholder = 'Search...' }: Props = $props();
</script>

<div class="relative rounded-md shadow-sm">
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
		<!-- Search Icon path -->
		<Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={16} class="text-gray-400" />
	</div>
	<Input id="search" name="search" bind:value {placeholder} class="pl-10" />
</div>
