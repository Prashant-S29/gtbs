import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductImages from "@/components/product/ProductImages";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import LocalizedProductBreadcrumb from "@/components/product/LocalizedProductBreadcrumb";
import JsonLd from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  createPageMetadata,
  siteConfig,
  siteUrl,
  truncateDescription,
} from "@/lib/seo";
import { getProduct, getProducts } from "@/lib/contentRepository";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = truncateDescription(
    product.description ||
      `Buy ${product.title} from Gujarat Tract Book Store.`,
  );

  return {
    ...createPageMetadata({
      title: product.title,
      description,
      path: `/product/${product.id}`,
      image: product.image,
    }),
    keywords: [product.title, product.category, "GTBS products"],
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const detailImageUrls = [
    ...(product.detailImages || []).map((image) => image.url),
    ...(product.images || []),
  ];

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(`/product/${product.id}`)}#product`,
    name: product.title,
    description: product.description,
    image: [...new Set([product.image, ...detailImageUrls])].map(absoluteUrl),
    category: product.category,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        "@id": `${siteUrl}/#store`,
        name: siteConfig.legalName,
      },
    },
  };

  return (
    <>
      <JsonLd data={productStructuredData} />
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumbs */}
        <LocalizedProductBreadcrumb product={product} />

        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Gallery */}
          <div className="lg:col-span-5">
            <ProductImages
              mainImage={product.image}
              images={detailImageUrls}
              title={product.title}
              badge={product.badge}
            />
          </div>

          {/* Right Info & Purchase Actions */}
          <div className="lg:col-span-7">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Product Information Tabs */}
        <ProductTabs product={product} />

        {/* Related Products Carousel / Grid */}
        <RelatedProducts
          currentProductId={product.id}
          category={product.category}
          allProducts={products}
        />
      </div>
    </>
  );
}
