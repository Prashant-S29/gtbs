"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
  useCart,
} from "@/lib/storefrontStorage";
import { createWhatsAppOrderUrl } from "@/lib/whatsappOrder";
import { useLanguage } from "@/contexts/LanguageContext";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export default function CartPageClient() {
  const { t } = useLanguage();
  const { items, itemCount, subtotal } = useCart();
  const persistCartChange = (change: () => boolean) => {
    if (!change()) {
      toast.error(t("cart.updateError"));
    }
  };
  const handleBuyCart = () => {
    const whatsappUrl = createWhatsAppOrderUrl(
      items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.price,
        productUrl: new URL(
          `/product/${encodeURIComponent(item.productId)}`,
          window.location.origin,
        ).toString(),
        ...(item.variantSummary ? { variantSummary: item.variantSummary } : {}),
      })),
      subtotal,
    );
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-orange-50/40 via-white to-white py-10 md:py-14">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3.5 py-1 text-xs font-semibold text-orange-700">
            <ShoppingBag size={14} />
            <span>{t("cart.badge")}</span>
          </div>
          <h1 className="title text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t("cart.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600" aria-live="polite">
            {itemCount === 0
              ? t("cart.emptyStatus")
              : t(itemCount === 1 ? "cart.itemStatus" : "cart.itemsStatus", {
                  count: itemCount,
                })}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <ShoppingBag size={36} strokeWidth={1.75} />
            </div>
            <h2 className="title mb-3 text-2xl font-bold text-gray-900">
              {t("cart.emptyTitle")}
            </h2>
            <p className="description mx-auto mb-8 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base">
              {t("cart.emptyDescription")}
            </p>
            <Link
              href="/allproducts"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 sm:w-auto"
            >
              {t("cart.browse")}
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <section aria-labelledby="cart-items-heading" className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2
                  id="cart-items-heading"
                  className="title text-xl font-bold text-gray-900"
                >
                  {t("cart.items")}
                </h2>
                <button
                  type="button"
                  onClick={() => persistCartChange(clearCart)}
                  className="text-sm font-semibold text-gray-500 hover:text-red-600"
                >
                  {t("cart.clear")}
                </button>
              </div>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.key}
                    className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:p-4"
                  >
                    <Link
                      href={`/product/${encodeURIComponent(item.productId)}`}
                      className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100"
                    >
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 self-center">
                      <Link
                        href={`/product/${encodeURIComponent(item.productId)}`}
                        className="line-clamp-2 font-semibold text-gray-900 hover:text-orange-700"
                      >
                        {item.title}
                      </Link>
                      {item.variantSummary && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {item.variantSummary}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0">
                      <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() =>
                            persistCartChange(() =>
                              updateCartItemQuantity(
                                item.key,
                                item.quantity - 1,
                              ),
                            )
                          }
                          aria-label={t("cart.decreaseItem", {
                            title: item.title,
                          })}
                          className="flex h-9 w-9 items-center justify-center rounded-l-xl hover:bg-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            persistCartChange(() =>
                              updateCartItemQuantity(
                                item.key,
                                item.quantity + 1,
                              ),
                            )
                          }
                          aria-label={t("cart.increaseItem", {
                            title: item.title,
                          })}
                          className="flex h-9 w-9 items-center justify-center rounded-r-xl hover:bg-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          persistCartChange(() => removeCartItem(item.key))
                        }
                        aria-label={t("cart.removeItem", { title: item.title })}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="rounded-2xl border border-orange-100 bg-orange-50 p-5 lg:sticky lg:top-6">
              <h2 className="title text-xl font-bold text-gray-900">
                {t("cart.summary")}
              </h2>
              <div className="mt-5 flex justify-between border-b border-orange-200 pb-4 text-sm text-gray-700">
                <span>{t("cart.subtotal")}</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="mt-4 text-xs leading-5 text-gray-600">
                {t("cart.notice")}
              </p>
              <button
                type="button"
                onClick={handleBuyCart}
                className="mt-5 flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
                aria-label={t("cart.buyWhatsAppLabel")}
              >
                {t("action.buyNow")}
              </button>
              <Link
                href="/allproducts"
                className="mt-3 block text-center text-sm font-semibold text-orange-700 hover:underline"
              >
                {t("cart.continue")}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
