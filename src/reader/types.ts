
// Reader-specific types

export interface Comment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: number;
    likes: number;
}

export interface ComicPanel {
  id: string;
  description: string;
  dialogue: string;
  caption?: string; 
  imageUrl?: string;
}

export interface Chapter {
    chapterNumber: number;
    title: string;
    thumbnail?: string; // Derived from first panel
    panels: ComicPanel[];
    comments?: Comment[];
    likes?: number;
    views?: number;
    publishedAt?: number;
}

export interface Author {
    name: string;
    avatar: string;
}

export interface StoryConcept {
    premise: string;
    genreTrends?: string;
}

export interface ComicProject {
  id?: string;
  ownerId?: string;
  title: string;
  theme: string;
  style: string;
  coverImage?: string;
  
  // Enriched Data
  author?: Author;
  rating?: number;
  viewCount?: string;
  subscriberCount?: string;
  tags?: string[];
  status?: 'ONGOING' | 'COMPLETED' | 'HIATUS';
  
  // Structure
  currentChapter?: number; // Pointer to last read
  panels: ComicPanel[]; // Legacy support for single-chunk projects
  storyConcept?: StoryConcept;
}
