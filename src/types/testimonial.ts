interface TestimonialLocalizedContent {
  name: string;
  role: string;
  review: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  review: string;
  rating: number;
  gujarati?: TestimonialLocalizedContent;
}
