<script setup lang="ts">
import EventCard from '@/components/EventCard.vue';
import {type  Event } from '@/types';
import { ref, onMounted ,computed,watchEffect} from 'vue';
import EventService from '@/services/EventService';


const events = ref<Event[] | null>(null)

const totalEvents =ref(0)
const hasNextPage = computed(() => {
  const totalPages = Math.ceil(totalEvents.value / pageSize.value);
  return totalPages > page.value;
});



const props = defineProps({
  page: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true,
  },
})
const page = computed(() => props.page);
const pageSize = computed(() => props.pageSize)

const pageSizeOption = [2, 3, 4, 6]

onMounted(() =>{
 
watchEffect(() => {
    events.value = null
    EventService.getEvents(pageSize.value, page.value)
      .then((response) => {
        console.log(response.data)

        events.value = response.data
        totalEvents.value = response.headers['x-total-count']
      })
      .catch((error) => {
        console.log('There was an error!', error)
      })
  })
  })
  
</script>

<template>
   
  <h1>Events For Good</h1>
  
  <div class="flex flex-col items-center">
    <EventCard
      v-for="event in events"
      :key="event.id"
      :event="event" 
    />
  </div>
    
  <div class="flex flex-col items-center gap-6 mx-auto my-12 max-w-xl">
    <div class="flex justify-center items-center gap-8">
      <router-link
        id="page-prev"
        :to="{ name: 'event-list-view', query: { page: page - 1, pageSize: pageSize } }"
        rel="prev"
        v-if="page != 1"
        class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#42b983] text-white no-underline rounded-[6px] font-medium text-sm transition-colors duration-200 ease-in-out min-w-[90px] justify-center hover:bg-[#36a374]">
        <span>Previous</span>
      </router-link>
       
      <div class="text-gray-600 text-sm font-medium px-4">
        <span>Page {{ page }} of {{ Math.ceil(totalEvents / pageSize) }}</span>
      </div>

      <router-link
        id="page-next"
        :to="{ name: 'event-list-view', query: { page: page + 1, pageSize: pageSize } }"
        rel="next"
        v-if="hasNextPage"
        class="inline-flex items-center gap-2 py-[10px] px-4 bg-[#42b983] text-white no-underline rounded-[6px] font-medium text-sm transition-colors duration-200 ease-in-out min-w-[90px] justify-center hover:bg-[#36a374]">
        <span>Next</span>
      </router-link>
    </div>
      
    <div class="flex items-center gap-3 bg-[#f8f9fa] py-3 px-4 rounded-lg border border-[#e9ecef]">
      <span class="text-[#666] text-sm font-medium">Show:</span>
      <div class="flex gap-1">
        <router-link
          v-for="size in pageSizeOption"
          :key="size"
          :to="{ name: 'event-list-view', query: { page: 1, pageSize: size } }"
          :class="{ 
            'bg-[#42b983] text-white border-[#42b983]': pageSize === size,
            'bg-white text-[#666] border-[#ddd]': pageSize !== size 
          }"
          class="inline-flex items-center justify-center min-w-8 h-8 px-2 no-underline rounded text-[13px] font-medium transition-all duration-200 ease-in-out
                 hover:bg-[#f0f0f0] hover:border-[#42b983] hover:text-[#42b983]">
          {{ size }}
        </router-link>
      </div>
      <span class="text-[#666] text-sm font-medium">items</span>
    </div>
  </div>
    
</template>

<style scoped>
/* คุณสามารถลบ CSS ที่เคยมีในส่วนนี้ออกได้ทั้งหมด เนื่องจากตอนนี้ได้แปลงเป็น Tailwind แล้ว */
/* หรือหากต้องการเก็บไว้เป็นแนวทาง ให้คอมเมนต์ทั้งบล็อก */

/* .evens{
  display: flex;
  justify-content: center;
  align-items: center;
} */

/* .pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 3rem auto;
  max-width: 600px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.page-info {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  padding: 0 1rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 16px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s ease;
  min-width: 90px;
  justify-content: center;
}

.pagination-btn:hover {
  background-color: #36a374;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-family: inherit;
}

.page-size-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.page-size-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.page-size-options {
  display: flex;
  gap: 4px;
}

.page-size-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background-color: white;
  color: #666;
  text-decoration: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.page-size-option:hover {
  background-color: #f0f0f0;
  border-color: #42b983;
  color: #42b983;
}

.page-size-option.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
} */
</style>