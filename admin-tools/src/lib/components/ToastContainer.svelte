<script lang="ts">
	import { toasts, removeToast } from '$lib/stores/toast';
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
</script>

<div class="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<div
			animate:flip
			in:fly={{ y: 20 }}
			out:fade
			class="flex min-w-[300px] items-center justify-between rounded-md px-4 py-3 text-white shadow-lg"
			class:bg-green-600={toast.type === 'success'}
			class:bg-red-600={toast.type === 'error'}
			class:bg-blue-600={toast.type === 'info'}
		>
			<span>{toast.message}</span>
			<button onclick={() => removeToast(toast.id)} class="ml-4 text-white hover:text-gray-200">
				&times;
			</button>
		</div>
	{/each}
</div>
