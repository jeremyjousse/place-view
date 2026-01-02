<script lang="ts">
  import Input from '../atoms/Input.svelte';
  import Button from '../atoms/Button.svelte';

  let { value = $bindable(), onSearch } = $props<{
    value?: string;
    onSearch?: (value: string) => void;
  }>();

  function handleSubmit(e: Event) {
    e.preventDefault();
    onSearch?.(value || '');
  }
</script>

<form onsubmit={handleSubmit} class="w-full max-w-3xl mx-auto">
  <div class="flex flex-col md:flex-row gap-0 border-2 border-text shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-surface">
    <div class="flex-1 flex items-center px-4 py-1">
      <svg class="text-text/40 mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <Input 
        bind:value 
        placeholder="SEARCH DESTINATIONS, RESORTS, OR CITIES..." 
        class="border-none focus:ring-0 uppercase tracking-wider font-bold text-sm"
      />
    </div>
    <Button 
      variant="primary" 
      type="submit" 
      size="lg"
      class="md:w-48 border-l-2 border-text md:border-l-2 border-t-2 md:border-t-0"
    >
      FIND PLACES
    </Button>
  </div>
</form>
