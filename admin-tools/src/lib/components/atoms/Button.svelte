<script lang="ts">
	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children?: import('svelte').Snippet;
	}

	let {
		type = 'button',
		variant = 'primary',
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const baseClass =
		'inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variants = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm',
		secondary:
			'bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 border border-gray-300 shadow-sm',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm'
	};
</script>

<button {type} {disabled} class="{baseClass} {variants[variant]} {className}" {onclick}>
	{@render children?.()}
</button>
