<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { tmdb } from '../services/tmdb';
import type { MediaDetails, CrewMember } from '../types/tmdb';

const route = useRoute();
const media = ref<MediaDetails | null>(null);
const loading = ref(true);
const showAllCast = ref(false);

onMounted(async () => {
  const type = route.params.type as 'movie' | 'tv';
  const id = Number(route.params.id);
  
  try {
    media.value = await tmdb.getDetails(type, id);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const getYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';
const formatRuntime = (mins?: number) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '';
const formatMoney = (amount?: number) => amount ? `$${(amount / 1000000).toFixed(1)}M` : '-';

const directors = computed(() => 
  media.value?.credits.crew.filter((c: CrewMember) => c.job === 'Director') || []
);

const writers = computed(() => 
  media.value?.credits.crew.filter((c: CrewMember) => ['Screenplay', 'Writer', 'Story'].includes(c.job)) || []
);

const trailer = computed(() => 
  media.value?.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
  media.value?.videos.results.find(v => v.type === 'Teaser' && v.site === 'YouTube')
);

// Assuming a grid of roughly 6 items per row on large screens, 2 rows = 12 items.
// We can adjust this number based on design preference.
const sortedCast = computed(() => {
    if (!media.value?.credits.cast) return [];
    return [...media.value.credits.cast].sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
});

const displayedCast = computed(() => {
    if (showAllCast.value) return sortedCast.value;
    return sortedCast.value.slice(0, 12);
});
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-[70vh]">
    <div class="relative w-20 h-20">
      <div class="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
      <div class="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>

  <div v-else-if="media" class="pb-20">
    <!-- Backdrop Section -->
    <div class="relative h-[500px] lg:h-[650px] w-full overflow-hidden">
      <div class="absolute inset-0">
        <img 
          :src="tmdb.getImageUrl(media.backdrop_path, 'original')" 
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-gray-950 dark:via-gray-900/80 dark:to-black/30"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-gray-50/90 via-transparent to-transparent dark:from-gray-950/90 dark:via-transparent dark:to-transparent"></div>
      </div>

      <div class="absolute inset-0 flex flex-col justify-end p-4 md:p-8 max-w-7xl mx-auto">
         <div class="flex flex-col md:flex-row gap-8 items-end">
            <div class="hidden md:block w-72 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden ring-4 ring-white dark:ring-gray-800 transform translate-y-16">
              <img :src="tmdb.getImageUrl(media.poster_path)" class="w-full" />
            </div>

            <div class="flex-1 text-gray-900 dark:text-white pb-0 md:pb-16 z-10">
               <h1 class="text-4xl md:text-6xl font-extrabold mb-2 drop-shadow-sm leading-tight">
                 {{ media.title || media.name }}
                 <span class="text-2xl md:text-4xl font-light opacity-70">
                   ({{ getYear(media.release_date || media.first_air_date) }})
                 </span>
               </h1>
               
               <p v-if="media.tagline" class="text-lg md:text-xl text-gray-500 dark:text-gray-400 italic mb-4 font-light">
                 "{{ media.tagline }}"
               </p>
               
               <div class="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium opacity-90 mb-6">
                 <span class="bg-gray-200 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700">
                    {{ media.media_type === 'movie' ? 'Movie' : 'TV Series' }}
                 </span>
                 <span>{{ media.genres.map(g => g.name).join(', ') }}</span>
                 <span v-if="media.runtime || media.episode_run_time?.length">
                    • {{ formatRuntime(media.runtime || media.episode_run_time?.[0]) }}
                 </span>
               </div>

               <div class="flex flex-wrap items-center gap-4">
                 <div class="flex items-center gap-3 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 dark:border-white/10 shadow-sm">
                   <div class="relative w-10 h-10 flex items-center justify-center">
                     <svg class="w-full h-full transform -rotate-90">
                       <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="3" fill="transparent" class="text-gray-300 dark:text-gray-700" />
                       <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="3" fill="transparent" :stroke-dasharray="100" :stroke-dashoffset="100 - (media.vote_average * 10)" class="text-teal-500" />
                     </svg>
                     <span class="absolute text-xs font-bold">{{ Math.round(media.vote_average * 10) }}%</span>
                   </div>
                   <span class="font-bold text-sm leading-tight">User<br>Score</span>
                 </div>

                 <div class="flex gap-2">
                   <button class="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full font-bold transition flex items-center gap-2 shadow-lg hover:shadow-teal-500/30">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                     </svg>
                     Watchlist
                   </button>
                   <button class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-md" title="Mark as Watched">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                     </svg>
                   </button>
                   
                   <a 
                      v-if="trailer"
                      :href="`https://www.youtube.com/watch?v=${trailer.key}`" 
                      target="_blank"
                      class="bg-gray-900/80 dark:bg-white/10 text-white border border-gray-700 dark:border-white/20 px-6 py-3 rounded-full font-bold transition hover:bg-gray-800 dark:hover:bg-white/20 flex items-center gap-2"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Play Trailer
                   </a>
                 </div>
               </div>
            </div>
         </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 mt-8 md:mt-24 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
      
      <!-- Right Content (Main) -->
      <div class="md:col-span-2 lg:col-span-3 space-y-10 order-2 md:order-1">
        
        <section>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Overview</h3>
          <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            {{ media.overview }}
          </p>
          
          <div class="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
             <div v-for="director in directors" :key="director.id">
               <h4 class="font-bold text-gray-900 dark:text-white">{{ director.name }}</h4>
               <p class="text-sm text-gray-500 dark:text-gray-400">Director</p>
             </div>
             <div v-for="writer in writers" :key="writer.id">
               <h4 class="font-bold text-gray-900 dark:text-white">{{ writer.name }}</h4>
               <p class="text-sm text-gray-500 dark:text-gray-400">Writer</p>
             </div>
          </div>
        </section>

        <section>
          <div class="flex items-center justify-between mb-6">
             <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Top Cast</h3>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div v-for="person in displayedCast" :key="person.id" class="group">
              <div class="aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-200 dark:bg-gray-800 shadow-md border-2 border-transparent group-hover:border-teal-500 transition">
                <img 
                  v-if="person.profile_path"
                  :src="tmdb.getImageUrl(person.profile_path)" 
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              </div>
              <p class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ person.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ person.character }}</p>
            </div>
          </div>
          
          <div v-if="(media.credits.cast.length || 0) > 12" class="mt-8 text-center">
             <button 
               @click="showAllCast = !showAllCast"
               class="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-2 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
             >
               {{ showAllCast ? 'Show Less' : 'Show All Cast' }}
               <svg :class="{'rotate-180': showAllCast}" class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </button>
          </div>
        </section>
        
         <!-- Production -->
        <section v-if="media.production_companies?.length">
           <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Production</h3>
           <div class="flex flex-wrap items-center gap-8">
             <div v-for="company in media.production_companies" :key="company.id" class="flex items-center gap-2">
                <div v-if="company.logo_path" class="h-8 md:h-12 bg-white/10 p-2 rounded">
                  <img :src="tmdb.getImageUrl(company.logo_path, 'original')" class="h-full object-contain mix-blend-multiply dark:mix-blend-normal brightness-0 dark:brightness-100 dark:invert" />
                </div>
                <span v-else class="font-medium text-gray-700 dark:text-gray-300">{{ company.name }}</span>
             </div>
           </div>
        </section>

      </div>

      <!-- Left Sidebar (Metadata) -->
      <div class="col-span-1 space-y-8 order-1 md:order-2">
        <div class="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-2xl">
           <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Details</h3>
           
           <div class="space-y-4">
             <div>
               <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
               <p class="font-medium text-gray-900 dark:text-white">{{ media.status || '-' }}</p>
             </div>
             <div>
               <p class="text-sm text-gray-500 dark:text-gray-400">Original Language</p>
               <p class="font-medium text-gray-900 dark:text-white uppercase">{{ media.original_language || '-' }}</p>
             </div>
             <div v-if="media.budget">
               <p class="text-sm text-gray-500 dark:text-gray-400">Budget</p>
               <p class="font-medium text-gray-900 dark:text-white">{{ formatMoney(media.budget) }}</p>
             </div>
             <div v-if="media.revenue">
               <p class="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
               <p class="font-medium text-gray-900 dark:text-white">{{ formatMoney(media.revenue) }}</p>
             </div>
           </div>
        </div>
        
        <div v-if="media.videos?.results?.length" class="space-y-4">
           <h3 class="text-lg font-bold text-gray-900 dark:text-white">Videos</h3>
           <div v-for="video in media.videos.results" :key="video.id" class="aspect-video rounded-lg overflow-hidden shadow-lg">
             <iframe 
               :src="`https://www.youtube.com/embed/${video.key}`" 
               class="w-full h-full" 
               frameborder="0" 
               allowfullscreen
             ></iframe>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
