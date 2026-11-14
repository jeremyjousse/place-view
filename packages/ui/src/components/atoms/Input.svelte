<script lang="ts">
	type Variant = 'default' | 'surface' | 'bare';
	type Size = 'sm' | 'md';

	interface Props {
		value?: string | number;
		placeholder?: string;
		type?: string;
		variant?: Variant;
		size?: Size;
		mono?: boolean;
		invalid?: boolean;
		class?: string;
		[key: string]: unknown;
	}

	let {
		value = $bindable(),
		placeholder = '',
		type = 'text',
		variant = 'default',
		size = 'md',
		mono = false,
		invalid = false,
		class: className = '',
		...props
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		default:
			'bg-background border-border text-text placeholder:text-text-muted/40 focus:ring-primary border transition-all focus:border-transparent focus:ring-2 focus:outline-none read-only:cursor-not-allowed read-only:opacity-60',
		surface:
			'bg-surface border-border text-text placeholder:text-text-muted/40 focus:ring-primary border transition-all focus:border-transparent focus:ring-2 focus:outline-none read-only:cursor-not-allowed read-only:opacity-60',
		bare: 'bg-transparent border-none text-text placeholder:text-text/30 focus:ring-0 focus:outline-none'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'rounded-xl px-3 py-2 text-xs',
		md: 'rounded-2xl px-4 py-2.5 text-sm font-medium'
	};
</script>

<input
	{type}
	{placeholder}
	bind:value
	aria-invalid={invalid || undefined}
	class="w-full {variantClasses[variant]} {variant === 'bare'
		? 'px-4 py-2'
		: sizeClasses[size]} {mono ? 'font-mono' : ''} {invalid ? 'border-red-500/60' : ''} {className}"
	{...props}
/>
