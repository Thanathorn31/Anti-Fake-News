// News System
// export interface News {
//   id: number;
//   title: string;
//   shortDetail: string;
//   fullDetail: string;
//   status: 'fake' | 'not_fake';
//   reporter: string;
//   date: string;
//   imageUrl: string;
// }

// export interface Comment {
//   id: number;
//   newsId: number;
//   author: string;
//   content: string;
//   imageUrl: string;
//   date: string;
// }

// export interface Vote {
//   newsId: number;
//   fake: number;
//   not_fake: number;
// }

// export interface NewsState {
//   news: News[];
//   comments: Comment[];
//   votes: Vote[];
//   loading: boolean;
// }
export interface NewsItem {
  id: number;
  topic: string;
  shortDetail: string;
  fullDetail: string;
  status: 'fake' | 'not-fake';
  reporter: string;
  date: string;
  imageUrl: string;
  votes: {
    fake: number;
    'not-fake': number;
  };
  comments: Comment[];
}

export interface Comment {
  id: number;
  user: string;
  comment: string;
  vote: 'fake' | 'not-fake';
  imageUrl: string | null;
  date: string;
}

export interface Vote {
  id: number;
  newsId: number;
  vote: 'fake' | 'not-fake';
  user: string;
}