interface CategoryLocalizedContent {
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  gujarati?: CategoryLocalizedContent;
}
