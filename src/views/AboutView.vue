<script setup lang="ts">
const group = [
  { name: 'Kirana Pritsanapanurungsee', sid: '662115001', sec: '702' },
  { name: 'Chonticha Kummayom',          sid: '662115009', sec: '702' },
  { name: 'Thanathorn Teekawong',        sid: '662115021', sec: '702' },
]
const videoUrl  = ''  // 🔗 ใส่ลิงก์วิดีโอที่นี่ เช่น 'https://youtu.be/xxxx'
const deployUrl = ''  // 🔗 ใส่ลิงก์ Deploy ที่นี่ เช่น 'https://abcnews.vercel.app'
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <header class="text-center">
      <h1 class="text-3xl font-extrabold text-[#2c3e50]">About ABCnews</h1>
      <p class="text-gray-600 mt-2">
        Group Name: <b>ABCnews</b>
      </p>
    </header>

    <div class="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold mb-3">Team Members</h2>
      <ul class="divide-y">
        <li v-for="m in group" :key="m.sid" class="py-3 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">{{ m.name }}</p>
            <p class="text-sm text-gray-500">SID: {{ m.sid }} • Sec: {{ m.sec }}</p>
          </div>
          <span class="inline-block rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-1 border border-emerald-200">
            ABCnews
          </span>
        </li>
      </ul>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <a
        :href="videoUrl || '#'"
        target="_blank" rel="noopener"
        class="rounded-xl border p-5 bg-white shadow-sm hover:shadow transition
               flex items-center justify-between"
        :class="videoUrl ? 'border-emerald-200' : 'opacity-60 cursor-not-allowed'"
      >
        <div>
          <h3 class="font-semibold">Video URL</h3>
          <p class="text-sm text-gray-600">
            {{ videoUrl || '— add link —' }}
          </p>
        </div>
        <span class="text-emerald-700 text-sm font-medium">Open ↗</span>
      </a>

      <a
        :href="deployUrl || '#'"
        target="_blank" rel="noopener"
        class="rounded-xl border p-5 bg-white shadow-sm hover:shadow transition
               flex items-center justify-between"
        :class="deployUrl ? 'border-emerald-200' : 'opacity-60 cursor-not-allowed'"
      >
        <div>
          <h3 class="font-semibold">Deploy URL</h3>
          <p class="text-sm text-gray-600">
            {{ deployUrl || '— add link —' }}
          </p>
        </div>
        <span class="text-emerald-700 text-sm font-medium">Open ↗</span>
      </a>
    </div>

    <p class="text-sm text-gray-500">
      This project is a community-driven anti-fake-news system built with Vue 3 + Vite.
    </p>
  </section>
</template>
