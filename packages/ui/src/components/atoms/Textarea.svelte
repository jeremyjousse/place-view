<script lang="ts">
	interface Props {
		value?: string;
		placeholder?: string;
		rows?: number;
		invalid?: boolean;
		class?: string;
		[key: string]: unknown;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		rows = 2,
		invalid = false,
		class: className = '',
		...props
	}: Props = $props();
</script>

<textarea
	{rows}
	{placeholder}
	bind:value
	aria-invalid={invalid || undefined}
	class="bg-background border-border text-text placeholder:text-text-muted/40 focus:ring-primary w-full rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all focus:border-transparent focus:ring-2 focus:outline-none {invalid
		? 'border-red-500/60'
		: ''} {className}"
	{...props}></textarea>
