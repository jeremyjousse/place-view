<script lang="ts">
  let { 
    children, 
    class: className = '', 
    variant = 'default' 
  } = $props<{
    children?: any;
    class?: string;
    variant?: 'default' | 'primary' | 'accent';
  }>();

  const variants = {
    default: 'bg-gray-200 text-text-muted',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent'
  };
</script>

<span class="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-none {variants[variant]} {className}">
  {@render children?.()}
</span>
