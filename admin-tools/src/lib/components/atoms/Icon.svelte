<script lang="ts">
	interface Props {
		path: string; // SVG path d attribute
		size?: number;
		class?: string;
		viewBox?: string;
	}

	let { path, size = 24, class: className = '', viewBox = '0 0 24 24' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	{viewBox}
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
>
	<path d={path} />
</svg>
