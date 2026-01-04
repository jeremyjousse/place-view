<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'outline';

  let { 
    variant = 'primary', 
    children, 
    class: className = '' 
  } = $props<{
    variant?: Variant;
    children?: Snippet;
    class?: string;
  }>();

  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors';
  
  const variants: Record<Variant, string> = {
    primary: 'bg-primary border-primary text-primary-text',
    secondary: 'bg-surface border-border text-text-muted',
    outline: 'bg-transparent border-border text-text-muted'
  };
</script>

<div class="{baseStyles} {variants[variant as Variant]} {className}">
  {@render children?.()}
</div>
