<script setup lang="ts">
import {type  Event } from '@/types';
 defineProps<{
  event: Event;
}>();
// const event = ref({
//   id: '5928101',
//   category: 'animal Welfare',
//   title: 'Cat Adoption Day',
//   description: 'Find your new feline friend at this event. ',
//   date: 'January 28, 2022',
//   time: '12:00',
//   petsAllowed: true,
//   organizer: 'Kat Laydee'
// });

</script>

<template>
  <RouterLink class="event-link" :to="{ name: 'event-detail-view', params: { id: event.id } }">
    <div class="container">
  <!-- <div class="event-card"> -->
    <!-- 4.2
    <div class="event-card hover:scale-101 hover:shadow-sp"> -->
      <!-- 5 -->
        <!-- <div class="cursor-pointer border border-gray-600 p-4 w-64 mb-6 hover:scale-101 hover:shadow-sp">  -->
          <!-- 6 -->
           <div class="cursor-pointer border border-gray-600 p-[20px] w-64 mb-[18px] hover:scale-101 hover:shadow-sp">
      <h2>{{ event.title }}</h2>
      <span>@{{ event.time }} on {{ event.date }}</span> <br>
      <span> Category :{{ event.category }} </span><br>
      <span> Organizer :{{ event.organizer }} </span>
    </div>
    </div>
</RouterLink>
</template>

<style scoped>
/* 4.2 remove css */
/* .container{
  display: flex;
  justify-content: center;  
  align-items: center;       
} */
/* .event-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  width: 320px;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
} */
/* .event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
} */
/* 
.event-link {
  text-decoration: none;
  color: #2c3e50;
} */


</style>