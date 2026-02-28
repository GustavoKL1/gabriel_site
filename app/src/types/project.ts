export interface Project {
  id: number;
  title: string;
  category: 'civil';
  location: string;
  year: string;
  image: string;
  description: string;
  sketchfabId?: string;
  sketchfabTitle?: string;
}
