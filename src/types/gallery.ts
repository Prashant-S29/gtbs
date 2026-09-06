export interface GalleryPhoto {
  id: string;
  url: string;
  key?: string;
  title: string;
  caption?: string;
}

interface GalleryLocalizedContent {
  title: string;
  category: string;
  location: string;
  description: string;
  organizer?: string;
}

export interface GalleryItem {
  id: string | number;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  date: string;
  location: string;
  coverImage: string;
  coverImageKey?: string;
  description: string;
  organizer?: string;
  photos: GalleryPhoto[];
  gujarati?: GalleryLocalizedContent;
}
