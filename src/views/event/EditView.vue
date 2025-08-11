<script setup lang="ts">
import { defineProps, toRefs } from 'vue'
import { type Event } from '@/types'
import { useRouter } from 'vue-router';
import { useMessageStore } from '@/stores/message';

const props = defineProps<{
  event: Event
  id: string
}>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { event } = toRefs(props)
const router = useRouter();
const store = useMessageStore();

function handleEditDone() {
  store.updateMessages('Data has been updated successfully: ' + props.event.title);
  setTimeout(() => {
   store.resetMessages();
 }, 3000)
  router.push({ name: 'event-detail-view', params: { id: props.event.id } });
}

</script>

<template>
  <div>
    <p>Edit event here</p>
    <button @click="handleEditDone">Update Event!</button>
  </div>
  
</template>