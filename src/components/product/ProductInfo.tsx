"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Share2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeProduct } from "@/lib/localizedProduct";
import { addCartItem } from "@/lib/storefrontStorage";
import { createWhatsAppOrderUrl } from "@/lib/whatsappOrder";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { language, t } = useLanguage();
  const localizedProduct = localizeProduct(product, language);
  const usesStoredGujarati = language === "gu" && Boolean(product.gujarati);
  const variantGroups = usesStoredGujarati
    ? localizedProduct.variants || []
    : localizedProduct.variants?.length
      ? localizedProduct.variants
      : product.format?.length
        ? [{ name: "Format", options: product.format }]
        : [];
  const [selectedVariantIndexes, setSelectedVariantIndexes] = useState<
    number[]
  >(() => variantGroups.map(() => 0));
  const [quantity, setQuantity] = useState(1);
  const productSnapshot = {
    productId: product.id,
    title: localizedProduct.title,
    price: product.price,
    image: product.image,
  };

  const getVariantSummary = () =>
    variantGroups
      .map((variant, index) =>
        variant.options[selectedVariantIndexes[index] ?? 0]
          ? `${variant.name}: ${variant.options[selectedVariantIndexes[index] ?? 0]}`
          : "",
      )
      .filter(Boolean)
      .join(", ");

  const handleAddToCart = () => {
    const variantSummary = getVariantSummary();
    if (!addCartItem(productSnapshot, quantity, variantSummary)) {
      toast.error(t("product.storageError"));
      return;
    }
    toast.success(
      `${t("product.added", {
        quantity,
        title: localizedProduct.title,
      })}${variantSummary ? ` (${variantSummary})` : ""}`,
    );
  };

  const handleBuyNow = () => {
    const variantSummary = getVariantSummary();
    const whatsappUrl = createWhatsAppOrderUrl([
      {
        title: localizedProduct.title,
        quantity,
        unitPrice: product.price,
        productUrl: window.location.href,
        ...(variantSummary ? { variantSummary } : {}),
      },
    ]);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const copyProductLink = async (url: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();

    if (!copied) {
      throw new Error("Unable to copy product link");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: localizedProduct.title,
          text: t("product.shareMessage", { title: localizedProduct.title }),
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await copyProductLink(url);
      toast.success(t("product.linkCopied"));
    } catch {
      toast.error(t("product.shareError"));
    }
  };

  return (
    <div className="flex flex-col">
      {/* Category & Breadcrumb link */}
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={`/allproducts?category=${product.category}`}
          className="text-xs font-semibold uppercase tracking-wider text-orange-600 hover:underline"
        >
          {product.category}
        </Link>
        <button
          onClick={handleShare}
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-orange-600"
          aria-label={t("product.shareLabel", {
            title: localizedProduct.title,
          })}
        >
          <Share2 size={14} />
          <span>{t("action.share")}</span>
        </button>
      </div>

      {/* Product Title */}
      <h1
        className={`title text-2xl font-bold tracking-tight text-gray-900 md:text-3xl lg:text-4xl ${usesStoredGujarati ? "notranslate" : ""}`}
        translate={usesStoredGujarati ? "no" : undefined}
        lang={usesStoredGujarati ? "gu" : undefined}
      >
        {localizedProduct.title}
      </h1>

      {/* Pricing */}
      <div className="mt-5">
        <span className="title text-3xl font-bold text-gray-900 md:text-4xl">
          &#8377;{product.price.toFixed(2)}
        </span>
      </div>

      {/* Dynamic Variant Selectors */}
      {variantGroups.map((variant, variantIndex) => (
        <div
          key={`${variant.name}-${variantIndex}`}
          className={`mt-6 ${usesStoredGujarati ? "notranslate" : ""}`}
          translate={usesStoredGujarati ? "no" : undefined}
          lang={usesStoredGujarati ? "gu" : undefined}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("product.selectVariant", { name: variant.name })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variant.options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setSelectedVariantIndexes((current) =>
                    Array.from({ length: variantGroups.length }, (_, index) =>
                      index === variantIndex
                        ? optionIndex
                        : (current[index] ?? 0),
                    ),
                  )
                }
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  (selectedVariantIndexes[variantIndex] ?? 0) === optionIndex
                    ? "border-orange-600 bg-orange-50/70 text-orange-700 shadow-sm ring-1 ring-orange-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Description Snippet */}
      {localizedProduct.description && (
        <p
          className={`description mt-5 text-sm leading-relaxed text-gray-600 line-clamp-3 ${usesStoredGujarati ? "notranslate" : ""}`}
          translate={usesStoredGujarati ? "no" : undefined}
          lang={usesStoredGujarati ? "gu" : undefined}
        >
          {localizedProduct.description}
        </p>
      )}

      {/* Quantity & CTA Buttons */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Quantity Stepper */}
        <div className="flex h-11 w-28 items-center justify-between rounded-lg border border-gray-200 bg-gray-50/80 px-2.5">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label={t("product.decreaseQuantity")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm"
          >
            <Minus size={15} />
          </button>
          <span className="font-semibold text-gray-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            aria-label={t("product.increaseQuantity")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-orange-600 bg-white px-3 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50 active:scale-[0.98] sm:min-w-36 sm:px-5"
          >
            <ShoppingCart size={17} aria-hidden="true" />
            <span>{t("action.addToCart")}</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-lg bg-gray-900 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 active:scale-[0.98] sm:min-w-32 sm:px-5"
            aria-label={t("product.buyWhatsAppLabel", {
              title: localizedProduct.title,
            })}
          >
            <span>{t("action.buyNow")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
