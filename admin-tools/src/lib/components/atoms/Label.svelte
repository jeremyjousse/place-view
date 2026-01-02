<script lang="ts">
	interface Props {
		for: string;
		children?: import('svelte').Snippet;
		class?: string;
	}

	let { for: htmlFor, children, class: className = '' }: Props = $props();
</script>

<label for={htmlFor} class="block text-sm font-medium text-gray-700 {className}">
	{@render children?.()}
</label>
