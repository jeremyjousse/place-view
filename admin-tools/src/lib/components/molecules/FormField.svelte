<script lang="ts">
	import Label from '../atoms/Label.svelte';
	import Input from '../atoms/Input.svelte';

	interface Props {
		id: string;
		name: string;
		label: string;
		type?: string;
		value?: string | number;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		step?: string;
		error?: string;
	}

	let {
		id,
		name,
		label,
		type = 'text',
		value = $bindable(),
		placeholder,
		required,
		disabled,
		step,
		error
	}: Props = $props();
</script>

<div class="space-y-1">
	<Label for={id}>{label}</Label>
	<Input {id} {name} {type} bind:value {placeholder} {required} {disabled} {step} {error} />
	{#if error}
		<p class="mt-2 text-sm text-red-600" id="{id}-error">{error}</p>
	{/if}
</div>
