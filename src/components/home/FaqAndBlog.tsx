import Faq from "@/components/common/Faq";
import Blogs from "@/components/common/Blogs";
import { homeFaqs } from "@/data/faqs";

const FaqAndBlog = () => {
  return (
    <section className="py-10">
      <div className="container px-3 lg:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* FAQ Section - 5 columns */}
          <div className="lg:col-span-5 bg-orange-50/70 rounded-3xl p-6 md:p-8 border border-orange-100/80 shadow-sm">
            <Faq
              faqs={homeFaqs}
              badgeKey="home.faq.badge"
              titleKey="home.faq.title"
              subtitleKey="home.faq.subtitle"
            />
          </div>

          {/* Blogs Section - 7 columns */}
          <div className="lg:col-span-7 bg-orange-50/70 rounded-3xl p-6 md:p-8 border border-orange-100/80 shadow-sm">
            <Blogs limit={3} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqAndBlog;
