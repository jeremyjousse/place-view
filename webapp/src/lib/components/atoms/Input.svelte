<script lang="ts">
  let { 
    value = $bindable(), 
    placeholder = '', 
    type = 'text',
    class: className = '',
    ...props 
  } = $props<{
    value?: string;
    placeholder?: string;
    type?: string;
    class?: string;
    [key: string]: any;
  }>();
</script>

<div class="relative w-full">
  <input
    {type}
    {placeholder}
    bind:value
    class="w-full bg-surface border border-border rounded-none px-4 py-2 text-text placeholder-text/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 {className}"
    {...props}
  />
</div>
