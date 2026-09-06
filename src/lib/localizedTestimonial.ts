import type { Testimonial } from "@/types/testimonial";

export function localizeTestimonial(
  testimonial: Testimonial,
  language: "en" | "gu",
): Testimonial {
  if (language !== "gu" || !testimonial.gujarati) return testimonial;

  return {
    ...testimonial,
    name: testimonial.gujarati.name,
    role: testimonial.gujarati.role,
    review: testimonial.gujarati.review,
  };
}
