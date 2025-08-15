<script setup lang="ts">
const group = [
  { name: 'Kirana Pritsanapanurungsee', sid: '662115001', sec: '702' },
  { name: 'Chonticha Kummayom',          sid: '662115009', sec: '702' },
  { name: 'Thanathorn Teekawong',        sid: '662115021', sec: '702' },
]
const videoUrl  = ''  // add your video link
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-6">
   <!-- Intro -->
<header class="text-center flex flex-col items-center gap-3">

  <!-- Title -->
  <h1 class="text-2xl sm:text-3xl font-extrabold text-[#2c3e50]">
    About ABCnews
  </h1>
    <!-- Logo -->
  <img
    src="@/assets/image/logo.PNG"
    alt="ABCnews Logo"
    class="w-40 h-40 sm:w-20 sm:h-20 object-contain"
  />

  <!-- Description -->
  <p class="text-gray-600 text-sm sm:text-base max-w-prose px-2">
    Group Name: <b>ABCnews</b>
  </p>
</header>


    <!-- Project description -->
    <div class="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold mb-3">About This Website</h2>
      <p class="text-gray-700 leading-relaxed">
        The Social Anti-Fake News System is a community-driven platform designed to help 
        identify and reduce the spread of fake news. Users can post news articles, and the 
        community can vote on whether the news is <span class="font-semibold text-red-600">Fake</span> 
        or <span class="font-semibold text-green-600">Not Fake</span>.  
        Each vote can be accompanied by a comment explaining the reason, and optional evidence 
        via an image URL.  
        The overall status of each news item is determined by the majority vote.  
        Visitors can browse all news, filter by status, and see detailed views with comments 
        and voting history.
      </p>
    </div>

    <!-- Team members -->
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

    <!-- Links -->
    <div>
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
    </div>

    <p class="text-sm text-gray-500">
      This project was developed for the SE331 Component-Based Software Development course.
    </p>
  </section>
</template>
