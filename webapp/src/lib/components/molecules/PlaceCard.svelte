<script lang="ts">
  import { Heart } from 'lucide-svelte';
  import Badge from '../atoms/Badge.svelte';

  let { place, isFavorite = false, onToggleFavorite } = $props<{
    place: {
      id: string;
      name: string;
      state?: string;
      country?: string;
      webcams: any[];
    };
    isFavorite?: boolean;
    onToggleFavorite?: (favorite: boolean) => void;
  }>();

  const previewUrl = $derived(place.webcams[0]?.largeImage || '');
  const webcamsCount = $derived(place.webcams.length);
</script>

<div class="card-flat group relative flex flex-col h-full bg-surface border border-border p-3 hover:border-primary/50 hover:shadow-2xl transition-all duration-300">
  <button 
    class="absolute top-6 right-6 p-2.5 rounded-full backdrop-blur-md bg-black/20 text-white transition-all hover:bg-black/40 active:scale-90 z-10"
    onclick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite?.(!isFavorite); }}
  >
    <Heart size={18} fill={isFavorite ? "#C5FF29" : "none"} stroke={isFavorite ? "#C5FF29" : "currentColor"} />
  </button>

  <a href="/place/{place.id}" class="flex flex-col h-full">
    <div class="aspect-[4/3] relative overflow-hidden rounded-2xl bg-neutral-900 mb-4">
      {#if previewUrl}
        <img 
          src={previewUrl} 
          alt={place.name} 
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      {:else}
        <div class="w-full h-full flex items-center justify-center text-text/10 uppercase font-black tracking-tighter text-3xl">
          NO VIEW
        </div>
      {/if}
      
      <div class="absolute bottom-3 left-3">
         <Badge variant="primary">{webcamsCount} {webcamsCount > 1 ? 'CAMERAS' : 'CAMERA'}</Badge>
      </div>
    </div>

    <div class="px-2 pb-2">
      <h3 class="text-lg font-bold tracking-tight mb-0.5">{place.name}</h3>
      <p class="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
        {place.state}{place.country ? ` • ${place.country}` : ''}
      </p>
    </div>
  </a>
</div>
