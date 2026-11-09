<script lang="ts">
	let {
		value = $bindable(),
		placeholder = '',
		type = 'text',
		class: className = '',
		...props
	} = $props<{
		value?: string;
		placeholder?: string;
		type?: string;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<div class="relative w-full">
	<input
		{type}
		{placeholder}
		bind:value
		class="bg-surface border-border text-text placeholder-text/30 focus:ring-primary focus:border-primary w-full rounded-none border px-4 py-2 transition-all duration-200 focus:ring-1 focus:outline-none {className}"
		{...props}
	/>
</div>
