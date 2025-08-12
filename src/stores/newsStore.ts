import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Comment } from '@/types';

export const useNewsStore = defineStore('newsStore', () => {
  const addedComments = ref<{ [key: number]: Comment[] }>({});

  function addComment(newsId: number, comment: Comment) {
    if (!addedComments.value[newsId]) {
      addedComments.value[newsId] = [];
    }
    addedComments.value[newsId].push(comment);
  }

  function getCommentsForNews(newsId: number) {
    return addedComments.value[newsId] || [];
  }

  return { addedComments, addComment, getCommentsForNews };
});