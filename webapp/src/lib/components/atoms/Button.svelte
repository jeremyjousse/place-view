<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
  type Size = 'sm' | 'md' | 'lg' | 'icon';

  let { 
    variant = 'primary', 
    size = 'md', 
    children, 
    class: className = '', 
    href = undefined,
    ...props 
  } = $props<{
    variant?: Variant;
    size?: Size;
    children?: Snippet;
    class?: string;
    href?: string;
    [key: string]: unknown;
  }>();

  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-95 cursor-pointer';
  
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-primary-text hover:bg-primary-hover',
    secondary: 'bg-surface text-text border border-border hover:border-text-muted',
    outline: 'bg-transparent text-text border-2 border-border hover:border-primary hover:text-primary',
    ghost: 'text-text-muted hover:text-text hover:bg-surface'
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-2xl',
    lg: 'px-8 py-4 text-base rounded-3xl',
    icon: 'p-2 rounded-2xl'
  };
</script>

{#if href}
  <a 
    {href}
    class="{baseStyles} {variants[variant as Variant]} {sizes[size as Size]} {className}"
    {...props}
  >
    {@render children?.()}
  </a>
{:else}
  <button 
    class="{baseStyles} {variants[variant as Variant]} {sizes[size as Size]} {className}"
    {...props}
  >
    {@render children?.()}
  </button>
{/if}
