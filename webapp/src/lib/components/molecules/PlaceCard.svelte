<script lang="ts">
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';

  interface Webcam {
    id: string;
    name: string;
    imageUrl: string;
  }

  let { place } = $props<{
    place: {
      id: string;
      name: string;
      region?: string;
      country?: string;
      webcamsCount: number;
      previewUrl?: string;
      tags?: string[];
    }
  }>();
</script>

<div class="card-flat group overflow-hidden flex flex-col h-full border-2 border-text shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
  <div class="aspect-video relative overflow-hidden bg-gray-100 border-b-2 border-text">
    {#if place.previewUrl}
      <img 
        src={place.previewUrl} 
        alt={place.name} 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-text/20 uppercase font-black tracking-tighter text-4xl">
        NO PREVIEW
      </div>
    {/if}
    
    <div class="absolute top-2 left-2 flex flex-wrap gap-1">
      <Badge variant="primary">{place.webcamsCount} WEBCAMS</Badge>
    </div>
  </div>

  <div class="p-4 flex flex-col flex-1">
    <div class="mb-auto">
      <h3 class="text-xl font-black uppercase tracking-tight mb-1">{place.name}</h3>
      <p class="text-xs text-text-muted font-bold uppercase tracking-widest">
        {place.region}{place.country ? `, ${place.country}` : ''}
      </p>
    </div>

    <div class="mt-4">
      <Button variant="outline" class="w-full text-xs py-2">
        VIEW DETAILS
      </Button>
    </div>
  </div>
</div>
