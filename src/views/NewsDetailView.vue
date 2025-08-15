<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useNewsStore } from '@/stores/newsStore';
import NewsService from '@/services/NewsService';
import { type NewsItem, type Comment } from '@/types';

const newsItem = ref<NewsItem | null>(null);
const route = useRoute();
const newsStore = useNewsStore();

const newVote = ref<'fake' | 'not-fake' | null>(null);
const newCommentText = ref('');
const newCommentImage = ref('');

const combinedComments = computed(() => {
  const currentNewsComments = newsItem.value?.comments || [];
  const addedComments = newsStore.getCommentsForNews(Number(route.params.id));
  return [...currentNewsComments, ...addedComments].reverse();
});

const voteCount = computed(() => {
  let fakeVotes = newsItem.value?.votes.fake || 0;
  let notFakeVotes = newsItem.value?.votes['not-fake'] || 0;
  
  // Add votes from Pinia store
  const addedComments = newsStore.getCommentsForNews(Number(route.params.id));
  addedComments.forEach(comment => {
    if (comment.vote === 'fake') fakeVotes++;
    else if (comment.vote === 'not-fake') notFakeVotes++;
  });

  return { fake: fakeVotes, 'not-fake': notFakeVotes };
});

const submitVoteAndComment = () => {
  if (newVote.value) {
    const comment: Comment = {
      id: Date.now(),
      user: 'Anonymous',
      comment: newCommentText.value,
      vote: newVote.value,
      imageUrl: newCommentImage.value,
      date: new Date().toISOString(),
    };
    newsStore.addComment(Number(route.params.id), comment);
    newVote.value = null;
    newCommentText.value = '';
    newCommentImage.value = '';
  }
};

onMounted(() => {
  NewsService.getNewsById(Number(route.params.id))
    .then((response) => {
      newsItem.value = response.data;
    })
    .catch((error) => {
      console.log('Error fetching news details:', error);
    });
});
</script>

<template>
  <div v-if="newsItem" class="container mx-auto p-4">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-4xl font-bold mb-4">{{ newsItem.topic }}</h1>
      <p class="text-sm text-gray-500 mb-6">
        By {{ newsItem.reporter }} on {{ new Date(newsItem.date).toLocaleDateString() }}
      </p>
      <div class="mb-6 rounded-lg overflow-hidden">
        <img :src="newsItem.imageUrl" alt="News Image" class="w-full h-auto object-cover" />
      </div>
      <p class="text-lg text-gray-700 leading-relaxed mb-8">{{ newsItem.fullDetail }}</p>

      <div class="border-t pt-8">
        <h2 class="text-2xl font-bold mb-4">Community Feedback</h2>
        <div class="flex items-center gap-4 mb-6">
          <div class="flex items-center gap-2">
            <span class="text-green-500 font-bold text-lg">TRUE:</span>
            <span class="text-lg">{{ voteCount['not-fake'] }} votes</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-red-500 font-bold text-lg">FAKE:</span>
            <span class="text-lg">{{ voteCount.fake }} votes</span>
          </div>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 class="text-xl font-bold mb-4">Add your vote and comment</h3>
          <form @submit.prevent="submitVoteAndComment">
            <div class="flex items-center gap-4 mb-4">
              <label class="flex items-center">
                <input type="radio" v-model="newVote" value="fake" class="mr-2" />
                <span class="text-red-600 font-medium">Fake News</span>
              </label>
              <label class="flex items-center">
                <input type="radio" v-model="newVote" value="not-fake" class="mr-2" />
                <span class="text-green-600 font-medium">Not Fake News</span>
              </label>
            </div>
            <textarea
              v-model="newCommentText"
              placeholder="Your comment..."
              class="w-full h-24 px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#42b983]"
            ></textarea>
            <input
              v-model="newCommentImage"
              type="text"
              placeholder="Optional: Image URL to support your choice"
              class="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#42b983]"
            />
            <button
              type="submit"
              class="w-full px-4 py-2 bg-[#42b983] text-white rounded-md font-medium hover:bg-[#36a374] disabled:opacity-50"
              :disabled="!newVote"
            >
              Submit
            </button>
          </form>
        </div>

        <div>
          <h3 class="text-xl font-bold mb-4">Comments ({{ combinedComments.length }})</h3>
          <div v-for="comment in combinedComments" :key="comment.id" class="border-b last:border-b-0 py-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold">{{ comment.user }}</span>
              <span
                :class="comment.vote === 'fake' ? 'text-red-500' : 'text-green-500'"
                class="font-medium text-sm"
              >
                Voted: {{ comment.vote.toUpperCase() }}
              </span>
            </div>
            <p class="text-gray-700">{{ comment.comment }}</p>
            <img v-if="comment.imageUrl" :src="comment.imageUrl" class="mt-2 rounded-md max-h-40" />
            <span class="text-xs text-gray-400 block mt-2">{{ new Date(comment.date).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>