<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
  type Size = 'sm' | 'md' | 'lg';

  let { 
    variant = 'primary', 
    size = 'md', 
    children, 
    class: className = '', 
    ...props 
  } = $props<{
    variant?: Variant;
    size?: Size;
    children?: any;
    class?: string;
    [key: string]: any;
  }>();

  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none rounded-none';
  
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-accent text-white hover:opacity-90',
    outline: 'bg-transparent text-text border-2 border-border hover:border-text',
    ghost: 'text-text/70 hover:text-text hover:bg-gray-100'
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-5 py-2 text-sm',
    lg: 'px-7 py-3 text-base'
  };
</script>

<button 
  class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
  {...props}
>
  {@render children?.()}
</button>
