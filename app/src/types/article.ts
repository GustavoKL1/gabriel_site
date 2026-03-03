export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  date: string;
  imageUrl: string;
  starred?: boolean;
}
