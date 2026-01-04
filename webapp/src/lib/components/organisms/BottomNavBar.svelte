<script lang="ts">
  import { LayoutList, Map as MapIcon } from 'lucide-svelte';
  import { page } from '$app/stores';

  let currentPath = $derived($page.url.pathname);
  let isMap = $derived(currentPath === '/map');
</script>

<nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-6 pb-6 pt-3 flex justify-around items-center z-50">
  <a 
    href="/"
    class="flex flex-col items-center gap-1 transition-colors {!isMap ? 'text-primary' : 'text-text-muted'}"
  >
    <LayoutList size={22} />
    <span class="text-[10px] font-black uppercase tracking-widest">List</span>
  </a>

  <a 
    href="/map"
    class="flex flex-col items-center gap-1 transition-colors {isMap ? 'text-primary' : 'text-text-muted'}"
  >
    <MapIcon size={22} />
    <span class="text-[10px] font-black uppercase tracking-widest">Map</span>
  </a>
</nav>