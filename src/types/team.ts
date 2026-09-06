interface TeamMemberLocalizedContent {
  name: string;
  role: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  imageKey?: string;
  gujarati?: TeamMemberLocalizedContent;
}
