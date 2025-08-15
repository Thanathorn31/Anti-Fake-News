import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://my-json-server.typicode.com/Thanathorn31/anti-fake-news', 
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
});

export default {

  getNews(perPage: number, page: number) {
    return apiClient.get(`/news?_limit=${perPage}&_page=${page}`);
  },

  getNewsById(id: number) {
    return apiClient.get(`/news/${id}`);
  },

  getCommentsByNewsId(newsId: number, perPage: number, page: number) {
    return apiClient.get(`/comments?newsId=${newsId}&_limit=${perPage}&_page=${page}`);
  },

  getVotesByNewsId(newsId: number) {
    return apiClient.get(`/votes?newsId=${newsId}`);
  }
};
