import { createPageMetadata } from "@/lib/seo";
import OurStory from "@/components/about/OurStory";
import VisionMission from "@/components/about/VisionMission";
import WhyChooseUs from "@/components/about/WhyChooseUs";
import Team from "@/components/about/Team";
import Faq from "@/components/common/Faq";
import { aboutFaqs } from "@/data/faqs";
import { getTeamMembers } from "@/lib/contentRepository";

export const revalidate = 300;

export const metadata = createPageMetadata({
  title: "About Us",
  description:
    "Learn about Gujarat Tract Book Store, our Christian publishing mission, values, team, and commitment to serving readers and faith communities.",
  path: "/about",
  image: "/images/about/story.webp",
});

export default async function About() {
  const teamMembers = await getTeamMembers();

  return (
    <div>
      <OurStory />
      <VisionMission />
      <WhyChooseUs />
      <Team members={teamMembers} />

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-orange-50/70 rounded-3xl p-6 sm:p-10 border border-orange-100/80 shadow-sm max-w-5xl mx-auto">
            <Faq
              faqs={aboutFaqs}
              badgeKey="about.faq.badge"
              titleKey="about.faq.title"
              subtitleKey="about.faq.subtitle"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
