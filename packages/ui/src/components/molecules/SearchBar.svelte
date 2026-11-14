<script lang="ts">
	import Input from '../atoms/Input.svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		value?: string;
		onSearch?: (value: string) => void;
	}

	let { value = $bindable(), onSearch }: Props = $props();

	function handleSubmit(e: Event) {
		e.preventDefault();
		onSearch?.(value || '');
	}
</script>

<form onsubmit={handleSubmit} class="mx-auto w-full max-w-3xl">
	<div
		class="border-text bg-surface flex flex-col gap-0 border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:flex-row"
	>
		<div class="flex flex-1 items-center px-4 py-1">
			<svg
				class="text-text/40 mr-2"
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="square"
				stroke-linejoin="miter"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
			>
			<Input
				bind:value
				variant="bare"
				placeholder="SEARCH DESTINATIONS, RESORTS, OR CITIES..."
				class="text-sm font-bold tracking-wider uppercase"
			/>
		</div>
		<Button
			variant="primary"
			type="submit"
			size="lg"
			class="border-text border-t-2 border-l-2 md:w-48 md:border-t-0 md:border-l-2"
		>
			FIND PLACES
		</Button>
	</div>
</form>
