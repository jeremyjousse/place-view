<script module lang="ts">
	export interface FilterPillOption<TValue extends string = string> {
		value: TValue;
		label: string;
		count?: number;
	}
</script>

<script lang="ts" generics="T extends string">
	let {
		options,
		value,
		onChange
	}: {
		options: FilterPillOption<T>[];
		value: T;
		onChange: (next: T) => void;
	} = $props();
</script>

<div class="flex flex-wrap items-center gap-2" role="group">
	{#each options as option (option.value)}
		<button
			type="button"
			aria-pressed={value === option.value}
			onclick={() => onChange(option.value)}
			class="cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-black tracking-wider uppercase transition-colors {value ===
			option.value
				? 'bg-primary border-primary text-primary-text'
				: 'bg-surface border-border text-text-muted hover:text-text'}"
		>
			{option.label}{#if option.count !== undefined}
				({option.count}){/if}
		</button>
	{/each}
</div>
