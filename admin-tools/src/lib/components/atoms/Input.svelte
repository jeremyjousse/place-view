<script lang="ts">
	interface Props {
		id: string;
		name: string;
		type?: string;
		value?: string | number;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		step?: string;
		error?: string;
		class?: string;
		oninput?: (event: Event) => void;
		onblur?: (event: FocusEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		autocomplete?: import('svelte/elements').HTMLInputAttributes['autocomplete'];
	}

	let {
		id,
		name,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		required = false,
		disabled = false,
		step,
		error = '',
		class: className = '',
		oninput,
		onblur,
		onfocus,
		autocomplete
	}: Props = $props();
</script>

<input
	{id}
	{name}
	{type}
	bind:value
	{placeholder}
	{required}
	{disabled}
	{step}
	{oninput}
	{onblur}
	{onfocus}
	{autocomplete}
	class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm {error
		? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
		: ''} {className}"
/>
