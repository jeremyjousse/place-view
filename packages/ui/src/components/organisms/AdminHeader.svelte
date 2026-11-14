<script lang="ts">
	import { ArrowLeft, FolderOpen, Plus, RotateCw } from 'lucide-svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		backHref?: string;
		backLabel?: string;
		filePath?: string | null;
		fileName?: string;
		isLoading?: boolean;
		newHref?: string;
		onPickFile?: () => void;
		onReload?: () => void;
	}

	let {
		title,
		subtitle,
		backHref,
		backLabel = 'Back to Places',
		filePath = null,
		fileName = '',
		isLoading = false,
		newHref,
		onPickFile,
		onReload
	}: Props = $props();
</script>

<header
	class="bg-background/95 border-border/60 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 backdrop-blur-md lg:px-12"
>
	<div class="min-w-0 space-y-1">
		{#if backHref}
			<a
				href={backHref}
				class="text-text-muted hover:text-primary inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase transition-colors"
			>
				<ArrowLeft size={14} />
				{backLabel}
			</a>
		{/if}

		<div class="flex items-center gap-3">
			<h1 class="truncate text-2xl font-black tracking-tight lg:text-3xl">{title}</h1>
			{#if subtitle}
				<span
					class="bg-surface border-border text-text-muted hidden rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase sm:inline-flex"
				>
					{subtitle}
				</span>
			{/if}
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-2.5">
		{#if filePath}
			<div
				class="bg-surface border-border flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs"
				title={filePath}
			>
				<span class="bg-primary h-2 w-2 rounded-full"></span>
				<span class="max-w-[180px] truncate font-mono text-[11px] text-white">
					{fileName}
				</span>
				{#if onReload}
					<button
						type="button"
						onclick={onReload}
						disabled={isLoading}
						class="text-text-muted hover:text-primary cursor-pointer rounded-lg p-1 transition-colors disabled:opacity-50"
						title="Reload from disk"
						aria-label="Reload from disk"
					>
						<RotateCw size={13} class={isLoading ? 'animate-spin' : ''} />
					</button>
				{/if}
			</div>
		{/if}

		{#if onPickFile}
			<Button variant="secondary" size="sm" onclick={onPickFile} class="gap-2">
				<FolderOpen size={14} />
				{filePath ? 'Switch File' : 'Open JSON'}
			</Button>
		{/if}

		{#if newHref && filePath}
			<Button variant="primary" size="sm" href={newHref} class="gap-1.5">
				<Plus size={15} />
				New Place
			</Button>
		{/if}
	</div>
</header>
