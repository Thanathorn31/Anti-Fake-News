<script setup lang="ts">
import type { Event } from '@/types'
defineProps<{
  event: Event
}>()
</script>

<template>
  <div class="EventCategory">
    <h2>Category :{{ event.category }}</h2>
    <h2>Organizer :{{ event.organizer }}</h2>
  </div>
</template>

<style scoped>
/* .EventCategory {
  padding: 20px;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  border: 1px solid #e5e7eb; 
  border-radius: 12px;
  background-color: #ffffff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 18px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
} */
</style>