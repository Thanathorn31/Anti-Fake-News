<script setup lang="ts">
defineProps<{
  name: string
  surname: string
  gpa: number
}>()
</script>

<template>
   <div class="cursor-pointer border border-gray-600 p-[20px] w-64 mb-[18px] hover:scale-101 hover:shadow-sp">
    <h2>{{ name }} {{ surname }}</h2>
    <p>GPA: {{ gpa }}</p>
  </div>
</template>

<style scoped>
/* .student-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  margin-bottom: 20px;
  width: 320px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-family: 'Segoe UI', sans-serif;
}
.student-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
} */

</style>