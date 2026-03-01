import fs from 'fs';
import path from 'path';

const projectData = [
  {
    "id": 1,
    "title": "Test Project 1",
    "category": "civil",
    "location": "São Paulo, SP",
    "year": "2024",
    "image": "https://placehold.co/600x400",
    "description": "Test description"
  }
];

const articleData = [
  {
    "id": 1,
    "title": "Test Article 1",
    "content": "Test content",
    "author": "Admin",
    "category": "Technology",
    "date": "2024-03-01T00:00:00.000Z",
    "imageUrl": "https://placehold.co/600x400"
  }
];

fs.writeFileSync(path.join(process.cwd(), '../src/data/projects.json'), JSON.stringify(projectData, null, 2));
fs.writeFileSync(path.join(process.cwd(), '../src/data/articles.json'), JSON.stringify(articleData, null, 2));
console.log('Seeded data');
