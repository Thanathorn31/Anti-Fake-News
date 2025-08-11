<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    resource: string
  }>(),
  {
    resource: 'page',
  },
)
</script>

<template>
  <h1>Oops!</h1>
  <h3>The {{ resource }} you're looking for is not here.</h3>
  <router-link :to="{ name: 'event-list-view' }"> Back to home page</router-link>
</template>