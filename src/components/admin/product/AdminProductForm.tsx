"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  adminJsonRequest,
  uploadAdminImages,
  validateClientImages,
} from "@/lib/adminContentClient";
import { MAX_PRODUCT_DETAIL_IMAGES } from "@/lib/imageRules";
import AdminBilingualFormSteps, {
  type AdminContentLanguage,
} from "@/components/admin/AdminBilingualFormSteps";
import AdminGujaratiSuggestion from "@/components/admin/AdminGujaratiSuggestion";
import type { Category } from "@/types/category";
import {
  PRODUCT_BADGES,
  type Product,
  type ProductBadge,
  type ProductDetailImage,
  type ProductSpecification,
  type ProductVariant,
} from "@/types/product";

interface Props {
  initialItem?: Product;
  categories: Category[];
}

interface NewDetailImagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface ProductSpecificationDraft {
  name: string;
  values: string[];
}

const inputClass =
  "admin-product-input mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200";
const textareaClass =
  "admin-product-input mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200";
const compactInputClass =
  "admin-product-input h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200";
const MAX_PRODUCT_SPECIFICATIONS = 50;
const MAX_PRODUCT_VARIANTS = 20;
const MAX_VARIANT_OPTIONS = 50;
const MAX_PRODUCT_FEATURES = 30;

function getCollectionError(
  specifications: ProductSpecificationDraft[],
  variants: ProductVariant[],
  language: string,
): string {
  const incompleteSpecification = specifications.findIndex((item) => {
    const hasName = Boolean(item.name.trim());
    const hasValues = item.values.some((value) => value.trim());
    return hasName !== hasValues;
  });
  if (incompleteSpecification >= 0) {
    return `${language} specification ${incompleteSpecification + 1} needs both a name and value.`;
  }

  const incompleteVariant = variants.findIndex((variant) => {
    const hasName = Boolean(variant.name.trim());
    const hasOptions = variant.options.some((option) => option.trim());
    return hasName !== hasOptions;
  });
  if (incompleteVariant >= 0) {
    return `${language} variant ${incompleteVariant + 1} needs both a name and at least one option.`;
  }

  return "";
}

function normalizeBadge(value?: string): ProductBadge | "" {
  const normalized = value?.toLowerCase() || "";
  if (normalized.includes("best")) return "Best Sellers";
  if (normalized.includes("new")) return "New Releases";
  if (
    normalized.includes("trend") ||
    normalized.includes("popular") ||
    normalized.includes("sale")
  )
    return "Trending Products";
  if (normalized.includes("accessor")) return "Accessories";
  return "";
}

function groupSpecifications(
  specifications: ProductSpecification[],
): ProductSpecificationDraft[] {
  return specifications.reduce<ProductSpecificationDraft[]>((groups, item) => {
    const currentGroup = groups.find((group) => group.name === item.name);
    if (currentGroup) currentGroup.values.push(item.value);
    else groups.push({ name: item.name, values: [item.value] });
    return groups;
  }, []);
}

function flattenSpecifications(
  specifications: ProductSpecificationDraft[],
): ProductSpecification[] {
  return specifications.flatMap((item) => {
    const name = item.name.trim();
    return item.values
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => ({ name, value }));
  });
}

function initialFeatures(features?: string[]): string[] {
  return features?.length ? [...features] : [""];
}

function normalizeFeatures(features: string[]): string[] {
  return [...new Set(features.map((value) => value.trim()).filter(Boolean))];
}

function initialSpecifications(product?: Product): ProductSpecificationDraft[] {
  if (product?.specifications?.length) {
    return groupSpecifications(product.specifications);
  }
  if (!product) return [];
  const legacySpecifications = [
    product.publisher ? { name: "Publisher", value: product.publisher } : null,
    product.publishedDate
      ? { name: "Publication date", value: product.publishedDate }
      : null,
    product.pages ? { name: "Pages", value: String(product.pages) } : null,
    product.language ? { name: "Language", value: product.language } : null,
    product.isbn ? { name: "ISBN", value: product.isbn } : null,
    product.dimensions
      ? { name: "Dimensions", value: product.dimensions }
      : null,
  ].filter((item): item is ProductSpecification => item !== null);
  return groupSpecifications(legacySpecifications);
}

function initialVariants(product?: Product): ProductVariant[] {
  if (product?.variants?.length) return product.variants;
  return product?.format?.length
    ? [{ name: "Format", options: product.format }]
    : [];
}

function initialDetailImages(product?: Product): ProductDetailImage[] {
  if (product?.detailImages?.length) return product.detailImages;
  return (product?.images || [])
    .filter((url) => url !== product?.image)
    .slice(0, MAX_PRODUCT_DETAIL_IMAGES)
    .map((url, index) => ({
      id: `legacy-${index + 1}`,
      url,
      title: `Detail image ${index + 1}`,
    }));
}

export default function AdminProductForm({
  initialItem,
  categories: initialCategories,
}: Props) {
  const router = useRouter();
  const previewUrlsRef = useRef(new Set<string>());
  const [formLanguage, setFormLanguage] = useState<AdminContentLanguage>("en");
  const [categoryOptions, setCategoryOptions] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(
    initialItem?.category || "",
  );
  const [categoryCreatorOpen, setCategoryCreatorOpen] = useState(false);
  const [categoryCreatorLanguage, setCategoryCreatorLanguage] =
    useState<AdminContentLanguage>("en");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryGujaratiName, setNewCategoryGujaratiName] = useState("");
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [specifications, setSpecifications] = useState<
    ProductSpecificationDraft[]
  >(() => initialSpecifications(initialItem));
  const [variants, setVariants] = useState<ProductVariant[]>(() =>
    initialVariants(initialItem),
  );
  const [gujaratiSpecifications, setGujaratiSpecifications] = useState<
    ProductSpecificationDraft[]
  >(() => groupSpecifications(initialItem?.gujarati?.specifications || []));
  const [gujaratiVariants, setGujaratiVariants] = useState<ProductVariant[]>(
    () => initialItem?.gujarati?.variants || [],
  );
  const [features, setFeatures] = useState<string[]>(() =>
    initialFeatures(initialItem?.features),
  );
  const [gujaratiFeatures, setGujaratiFeatures] = useState<string[]>(() =>
    initialFeatures(initialItem?.gujarati?.features),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newDetailImages, setNewDetailImages] = useState<
    NewDetailImagePreview[]
  >([]);
  const [retainedDetailImages, setRetainedDetailImages] = useState<
    ProductDetailImage[]
  >(() => initialDetailImages(initialItem));
  const [imageError, setImageError] = useState("");
  const [detailImagesError, setDetailImagesError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const activeSpecifications =
    formLanguage === "gu" ? gujaratiSpecifications : specifications;
  const activeVariants = formLanguage === "gu" ? gujaratiVariants : variants;
  const activeFeatures = formLanguage === "gu" ? gujaratiFeatures : features;
  const activeSpecificationValueCount = activeSpecifications.reduce(
    (total, specification) => total + specification.values.length,
    0,
  );
  const updateActiveSpecifications = (
    update: (
      current: ProductSpecificationDraft[],
    ) => ProductSpecificationDraft[],
  ) => {
    if (formLanguage === "gu") setGujaratiSpecifications(update);
    else setSpecifications(update);
  };
  const updateActiveVariants = (
    update: (current: ProductVariant[]) => ProductVariant[],
  ) => {
    if (formLanguage === "gu") setGujaratiVariants(update);
    else setVariants(update);
  };
  const updateActiveFeatures = (update: (current: string[]) => string[]) => {
    if (formLanguage === "gu") setGujaratiFeatures(update);
    else setFeatures(update);
  };

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const selectCardImage = (file: File | undefined, input: HTMLInputElement) => {
    if (!file) {
      setImageFile(null);
      setImageError("");
      return;
    }
    const validationError = validateClientImages([file]);
    if (validationError) {
      setImageError(validationError);
      setImageFile(null);
      input.value = "";
      return;
    }
    setImageError("");
    setImageFile(file);
  };

  const selectDetailImages = (files: File[], input: HTMLInputElement) => {
    const validationError = validateClientImages(files);
    if (validationError) {
      setDetailImagesError(validationError);
      input.value = "";
      return;
    }
    if (
      retainedDetailImages.length + newDetailImages.length + files.length >
      MAX_PRODUCT_DETAIL_IMAGES
    ) {
      setDetailImagesError(
        `A product can contain at most ${MAX_PRODUCT_DETAIL_IMAGES} extra detail images.`,
      );
      input.value = "";
      return;
    }
    const previews = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return { id: crypto.randomUUID(), file, previewUrl };
    });
    setDetailImagesError("");
    setNewDetailImages((current) => [...current, ...previews]);
    input.value = "";
  };

  const removeNewDetailImage = (image: NewDetailImagePreview) => {
    URL.revokeObjectURL(image.previewUrl);
    previewUrlsRef.current.delete(image.previewUrl);
    setNewDetailImages((current) =>
      current.filter((item) => item.id !== image.id),
    );
    setDetailImagesError("");
  };

  const createCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryCreatorLanguage("en");
      setCategoryError("Enter the English category name.");
      return;
    }
    if (categoryCreatorLanguage === "en") {
      setCategoryError("");
      setCategoryCreatorLanguage("gu");
      return;
    }
    const gujaratiName = newCategoryGujaratiName.trim();
    if (!gujaratiName) {
      setCategoryError("Enter the Gujarati category name.");
      return;
    }
    setCategoryBusy(true);
    setCategoryError("");
    try {
      const result = await adminJsonRequest<{ item: Category }>(
        "/api/admin/content/categories",
        "POST",
        { name, gujarati: { name: gujaratiName } },
      );
      setCategoryOptions((current) =>
        [...current, result.item].sort((left, right) =>
          left.name.localeCompare(right.name),
        ),
      );
      setSelectedCategory(result.item.slug);
      setNewCategoryName("");
      setNewCategoryGujaratiName("");
      setCategoryCreatorLanguage("en");
      setCategoryCreatorOpen(false);
      toast.success("Category created and selected.");
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Category could not be created.";
      setCategoryError(message);
      toast.error(message);
    } finally {
      setCategoryBusy(false);
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setError("");
    const title = String(values.get("title") || "").trim();
    if (!title) {
      setFormLanguage("en");
      setError("Enter the English product title before continuing.");
      return;
    }
    const englishCollectionError = getCollectionError(
      specifications,
      variants,
      "English",
    );
    if (englishCollectionError) {
      setFormLanguage("en");
      setError(englishCollectionError);
      return;
    }
    if (formLanguage === "en") {
      if (!gujaratiSpecifications.length && specifications.length) {
        setGujaratiSpecifications(
          specifications.map((item) => ({
            name: "",
            values: item.values.map(() => ""),
          })),
        );
      }
      if (!gujaratiVariants.length && variants.length) {
        setGujaratiVariants(
          variants.map((item) => ({
            name: "",
            options: item.options.map(() => ""),
          })),
        );
      }
      if (
        gujaratiFeatures.every((item) => !item.trim()) &&
        features.some((item) => item.trim())
      ) {
        setGujaratiFeatures(features.map(() => ""));
      }
      setFormLanguage("gu");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const gujaratiTitle = String(values.get("gujaratiTitle") || "").trim();
    if (!gujaratiTitle) {
      setError("Enter the Gujarati product title before saving.");
      return;
    }
    const gujaratiCollectionError = getCollectionError(
      gujaratiSpecifications,
      gujaratiVariants,
      "Gujarati",
    );
    if (gujaratiCollectionError) {
      setError(gujaratiCollectionError);
      return;
    }

    setBusy(true);
    try {
      let image = initialItem?.image || "";
      let imageKey = initialItem?.imageKey;
      if (imageFile) {
        const [uploaded] = await uploadAdminImages("product-image", [
          imageFile,
        ]);
        image = uploaded.url;
        imageKey = uploaded.key;
      }
      if (!image) throw new Error("Choose a card image before saving.");
      const uploadedDetailImages = newDetailImages.length
        ? await uploadAdminImages(
            "product-detail-images",
            newDetailImages.map((item) => item.file),
          )
        : [];
      const detailImages: ProductDetailImage[] = [
        ...retainedDetailImages,
        ...uploadedDetailImages.map((item) => ({
          id: crypto.randomUUID(),
          url: item.url,
          key: item.key,
          title: item.name.replace(/\.[^.]+$/u, ""),
        })),
      ];
      const payload = {
        title,
        price: Number(values.get("price")),
        image,
        imageKey,
        detailImages,
        category: selectedCategory,
        badge: String(values.get("badge") || "").trim() || undefined,
        specifications: flattenSpecifications(specifications),
        variants: variants
          .map((variant) => ({
            name: variant.name.trim(),
            options: [
              ...new Set(
                variant.options.map((option) => option.trim()).filter(Boolean),
              ),
            ],
          }))
          .filter((variant) => variant.name || variant.options.length),
        description:
          String(values.get("description") || "").trim() || undefined,
        synopsis: String(values.get("synopsis") || "").trim() || undefined,
        features: normalizeFeatures(features),
        gujarati: {
          title: gujaratiTitle,
          specifications: flattenSpecifications(gujaratiSpecifications),
          variants: gujaratiVariants
            .map((variant) => ({
              name: variant.name.trim(),
              options: [
                ...new Set(
                  variant.options
                    .map((option) => option.trim())
                    .filter(Boolean),
                ),
              ],
            }))
            .filter((variant) => variant.name || variant.options.length),
          description:
            String(values.get("gujaratiDescription") || "").trim() || undefined,
          synopsis:
            String(values.get("gujaratiSynopsis") || "").trim() || undefined,
          features: normalizeFeatures(gujaratiFeatures),
        },
      };
      const url = initialItem
        ? `/api/admin/content/products/${encodeURIComponent(initialItem.id)}`
        : "/api/admin/content/products";
      await adminJsonRequest(url, initialItem ? "PUT" : "POST", payload);
      toast.success(initialItem ? "Product updated." : "Product created.");
      router.push("/admin/products");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Product could not be saved.";
      setError(message);
      toast.error(message);
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">
            {initialItem ? "Edit product" : "Add a new product"}
          </h2>
          <p className="text-xs text-slate-500">
            Catalog, pricing, media, variants, and product-detail content.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <AdminBilingualFormSteps currentStep={formLanguage} />
          <Link
            href="/admin/products"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to list
          </Link>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <form onSubmit={save} className="grid gap-5 lg:grid-cols-2">
        <fieldset className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:col-span-2">
          <legend className="px-2 font-bold">Core details</legend>
          <label
            className={`${formLanguage === "en" ? "" : "hidden"} text-sm font-semibold sm:col-span-2`}
          >
            English title
            <input
              name="title"
              required={formLanguage === "en"}
              maxLength={220}
              defaultValue={initialItem?.title}
              className={inputClass}
            />
          </label>
          <div
            className={`${formLanguage === "gu" ? "" : "hidden"} sm:col-span-2`}
          >
            <label
              htmlFor="product-gujarati-title"
              className="text-sm font-semibold"
            >
              Gujarati title
            </label>
            <input
              id="product-gujarati-title"
              name="gujaratiTitle"
              lang="gu"
              required={formLanguage === "gu"}
              maxLength={220}
              defaultValue={initialItem?.gujarati?.title}
              className={inputClass}
            />
            <AdminGujaratiSuggestion
              active={formLanguage === "gu"}
              sourceName="title"
              targetName="gujaratiTitle"
            />
          </div>
          <div className="min-w-0 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="product-category"
                className="text-sm font-semibold"
              >
                Category
              </label>
              <button
                type="button"
                onClick={() => {
                  setCategoryCreatorOpen(true);
                  setCategoryCreatorLanguage("en");
                  setCategoryError("");
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                <Plus size={14} />
                Add category
              </button>
            </div>
            <select
              id="product-category"
              name="category"
              required
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select category
              </option>
              {categoryOptions.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <label className="min-w-0 text-sm font-semibold">
            Badge
            <select
              name="badge"
              defaultValue={normalizeBadge(initialItem?.badge)}
              className={inputClass}
            >
              <option value="">No badge</option>
              {PRODUCT_BADGES.map((badge) => (
                <option key={badge} value={badge}>
                  {badge}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 text-sm font-semibold">
            Price (₹)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={initialItem?.price}
              className={`${inputClass} number-input-no-spinner`}
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 sm:grid-cols-2">
          <legend className="px-2 font-bold">Product images</legend>
          <p className="text-xs text-slate-500 sm:col-span-2">
            Choose one card image and up to {MAX_PRODUCT_DETAIL_IMAGES} extra
            images for the Product detail page. Every image must be JPG, PNG, or
            WebP and 500 KB or smaller.
          </p>
          <label className="text-sm font-semibold sm:col-span-2">
            Card image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!initialItem?.image}
              aria-invalid={Boolean(imageError)}
              aria-describedby={
                imageError ? "product-card-image-error" : undefined
              }
              onChange={(event) =>
                selectCardImage(
                  event.currentTarget.files?.[0],
                  event.currentTarget,
                )
              }
              className={`mt-1.5 block w-full rounded-xl border border-dashed p-3 text-sm ${imageError ? "border-red-400 bg-red-50/40" : "border-slate-300"}`}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {imageFile?.name ||
                (initialItem?.image
                  ? "Current card image will be kept."
                  : "Choose the primary card image.")}
            </span>
            {imageError && (
              <span
                id="product-card-image-error"
                role="alert"
                className="mt-1.5 block text-xs font-medium text-red-600"
              >
                {imageError}
              </span>
            )}
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Detail page extra images
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={Boolean(detailImagesError)}
              aria-describedby={
                detailImagesError ? "product-detail-images-error" : undefined
              }
              onChange={(event) =>
                selectDetailImages(
                  Array.from(event.currentTarget.files || []),
                  event.currentTarget,
                )
              }
              className={`mt-1.5 block w-full rounded-xl border border-dashed p-3 text-sm ${detailImagesError ? "border-red-400 bg-red-50/40" : "border-slate-300"}`}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {retainedDetailImages.length + newDetailImages.length} /{" "}
              {MAX_PRODUCT_DETAIL_IMAGES} selected
            </span>
            {detailImagesError && (
              <span
                id="product-detail-images-error"
                role="alert"
                className="mt-1.5 block text-xs font-medium text-red-600"
              >
                {detailImagesError}
              </span>
            )}
          </label>
          {(retainedDetailImages.length > 0 || newDetailImages.length > 0) && (
            <div className="grid grid-cols-3 gap-2 sm:col-span-2 sm:grid-cols-4 md:grid-cols-6">
              {retainedDetailImages.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                >
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setRetainedDetailImages((current) =>
                        current.filter((image) => image.id !== item.id),
                      );
                      setDetailImagesError("");
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    aria-label={`Remove ${item.title}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {newDetailImages.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 ring-2 ring-orange-400/70"
                >
                  <Image
                    src={item.previewUrl}
                    alt={`Selected preview: ${item.file.name}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="160px"
                  />
                  <span className="absolute bottom-1 left-1 rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewDetailImage(item)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    aria-label={`Remove selected image ${item.file.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <legend className="px-2 font-bold">Specifications</legend>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-slate-500">
              Add {formLanguage === "gu" ? "Gujarati " : ""}product-specific
              details, such as Material, Size, Weight, Publisher, ISBN, or
              Warranty.
            </p>
            <button
              type="button"
              disabled={
                activeSpecifications.length >= MAX_PRODUCT_SPECIFICATIONS ||
                activeSpecificationValueCount >= MAX_PRODUCT_SPECIFICATIONS
              }
              onClick={() =>
                updateActiveSpecifications((current) => [
                  ...current,
                  { name: "", values: [""] },
                ])
              }
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-orange-200 px-3 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} />
              Add specification
            </button>
          </div>
          {activeSpecifications.length ? (
            <div className="space-y-3">
              {activeSpecifications.map((specification, index) => (
                <div
                  key={`specification-${formLanguage}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`product-specification-${formLanguage}-${index}`}
                        className="text-xs font-semibold"
                      >
                        Specification name
                      </label>
                      <input
                        id={`product-specification-${formLanguage}-${index}`}
                        lang={formLanguage}
                        value={specification.name}
                        onChange={(event) =>
                          updateActiveSpecifications((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          )
                        }
                        maxLength={100}
                        placeholder="e.g. Material"
                        className={inputClass}
                      />
                      <AdminGujaratiSuggestion
                        active={formLanguage === "gu"}
                        autoSuggest={false}
                        sourceText={specifications[index]?.name}
                        onApply={(suggestion) =>
                          setGujaratiSpecifications((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, name: suggestion }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveSpecifications((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                      aria-label={`Remove specification ${index + 1}`}
                      title="Delete specification"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold">Values</p>
                      <button
                        type="button"
                        disabled={
                          activeSpecificationValueCount >=
                          MAX_PRODUCT_SPECIFICATIONS
                        }
                        onClick={() =>
                          updateActiveSpecifications((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, values: [...item.values, ""] }
                                : item,
                            ),
                          )
                        }
                        className="inline-flex h-10 items-center gap-1 rounded-lg border border-orange-200 px-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={14} />
                        Add value
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {specification.values.map((value, valueIndex) => (
                        <div
                          key={`specification-${formLanguage}-${index}-value-${valueIndex}`}
                          className="flex items-center gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <input
                              lang={formLanguage}
                              value={value}
                              onChange={(event) =>
                                updateActiveSpecifications((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          values: item.values.map(
                                            (
                                              currentValue,
                                              currentValueIndex,
                                            ) =>
                                              currentValueIndex === valueIndex
                                                ? event.target.value
                                                : currentValue,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                              maxLength={500}
                              placeholder={`Value ${valueIndex + 1}`}
                              aria-label={`Specification ${index + 1} value ${valueIndex + 1}`}
                              className={compactInputClass}
                            />
                            <AdminGujaratiSuggestion
                              active={formLanguage === "gu"}
                              autoSuggest={false}
                              sourceText={
                                specifications[index]?.values[valueIndex]
                              }
                              onApply={(suggestion) =>
                                setGujaratiSpecifications((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          values: item.values.map(
                                            (itemValue, itemValueIndex) =>
                                              itemValueIndex === valueIndex
                                                ? suggestion
                                                : itemValue,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveSpecifications((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        values: item.values.filter(
                                          (_, currentValueIndex) =>
                                            currentValueIndex !== valueIndex,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                            aria-label={`Remove value ${valueIndex + 1} from specification ${index + 1}`}
                            title="Delete value"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {!specification.values.length && (
                      <p className="text-xs text-slate-500">
                        Add at least one value for this specification.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              No specifications added for{" "}
              {formLanguage === "gu" ? "Gujarati" : "English"}.
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <legend className="px-2 font-bold">Variants</legend>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-slate-500">
              Create {formLanguage === "gu" ? "Gujarati " : ""}product-specific
              groups such as Size, Color, Format, Pack, Storage, or Edition.
            </p>
            <button
              type="button"
              disabled={activeVariants.length >= MAX_PRODUCT_VARIANTS}
              onClick={() =>
                updateActiveVariants((current) => [
                  ...current,
                  { name: "", options: [""] },
                ])
              }
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-orange-200 px-3 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} />
              Add variant
            </button>
          </div>
          {activeVariants.length ? (
            <div className="space-y-3">
              {activeVariants.map((variant, index) => (
                <div
                  key={`variant-${formLanguage}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`product-variant-${formLanguage}-${index}`}
                        className="text-xs font-semibold"
                      >
                        Variant name
                      </label>
                      <input
                        id={`product-variant-${formLanguage}-${index}`}
                        lang={formLanguage}
                        value={variant.name}
                        onChange={(event) =>
                          updateActiveVariants((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          )
                        }
                        maxLength={100}
                        placeholder="e.g. Color"
                        className={inputClass}
                      />
                      <AdminGujaratiSuggestion
                        active={formLanguage === "gu"}
                        autoSuggest={false}
                        sourceText={variants[index]?.name}
                        onApply={(suggestion) =>
                          setGujaratiVariants((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, name: suggestion }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveVariants((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                      aria-label={`Remove variant ${index + 1}`}
                      title="Delete variant"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold">Options</p>
                      <button
                        type="button"
                        disabled={variant.options.length >= MAX_VARIANT_OPTIONS}
                        onClick={() =>
                          updateActiveVariants((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, options: [...item.options, ""] }
                                : item,
                            ),
                          )
                        }
                        className="inline-flex h-10 items-center gap-1 rounded-lg border border-orange-200 px-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={14} />
                        Add option
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {variant.options.map((option, optionIndex) => (
                        <div
                          key={`variant-${formLanguage}-${index}-option-${optionIndex}`}
                          className="flex items-center gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <input
                              lang={formLanguage}
                              value={option}
                              onChange={(event) =>
                                updateActiveVariants((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          options: item.options.map(
                                            (
                                              currentOption,
                                              currentOptionIndex,
                                            ) =>
                                              currentOptionIndex === optionIndex
                                                ? event.target.value
                                                : currentOption,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                              maxLength={160}
                              placeholder={`Option ${optionIndex + 1}`}
                              aria-label={`Variant ${index + 1} option ${optionIndex + 1}`}
                              className={compactInputClass}
                            />
                            <AdminGujaratiSuggestion
                              active={formLanguage === "gu"}
                              autoSuggest={false}
                              sourceText={variants[index]?.options[optionIndex]}
                              onApply={(suggestion) =>
                                setGujaratiVariants((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          options: item.options.map(
                                            (itemOption, itemOptionIndex) =>
                                              itemOptionIndex === optionIndex
                                                ? suggestion
                                                : itemOption,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveVariants((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        options: item.options.filter(
                                          (_, currentOptionIndex) =>
                                            currentOptionIndex !== optionIndex,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                            aria-label={`Remove option ${optionIndex + 1} from variant ${index + 1}`}
                            title="Delete option"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {!variant.options.length && (
                      <p className="text-xs text-slate-500">
                        Add at least one option for this variant.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              No variants added for{" "}
              {formLanguage === "gu" ? "Gujarati" : "English"}. Products can be
              saved without variants.
            </p>
          )}
        </fieldset>

        <fieldset className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <legend className="px-2 font-bold">Storefront content</legend>
          <div className={formLanguage === "en" ? "grid gap-4" : "hidden"}>
            <label className="text-sm font-semibold">
              Short description
              <textarea
                name="description"
                maxLength={10000}
                rows={4}
                defaultValue={initialItem?.description}
                className={textareaClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Detailed overview
              <textarea
                name="synopsis"
                maxLength={20000}
                rows={5}
                defaultValue={initialItem?.synopsis}
                className={textareaClass}
              />
            </label>
          </div>
          <div
            className={formLanguage === "gu" ? "grid gap-4" : "hidden"}
            lang="gu"
          >
            <div>
              <label
                htmlFor="product-gujarati-description"
                className="text-sm font-semibold"
              >
                Gujarati short description
              </label>
              <textarea
                id="product-gujarati-description"
                name="gujaratiDescription"
                maxLength={10000}
                rows={4}
                defaultValue={initialItem?.gujarati?.description}
                className={textareaClass}
              />
              <AdminGujaratiSuggestion
                active={formLanguage === "gu"}
                sourceName="description"
                targetName="gujaratiDescription"
              />
            </div>
            <div>
              <label
                htmlFor="product-gujarati-synopsis"
                className="text-sm font-semibold"
              >
                Gujarati detailed overview
              </label>
              <textarea
                id="product-gujarati-synopsis"
                name="gujaratiSynopsis"
                maxLength={20000}
                rows={5}
                defaultValue={initialItem?.gujarati?.synopsis}
                className={textareaClass}
              />
              <AdminGujaratiSuggestion
                active={formLanguage === "gu"}
                sourceName="synopsis"
                targetName="gujaratiSynopsis"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">
              {formLanguage === "gu" ? "Gujarati features" : "Features"}
            </p>
            {activeFeatures.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {activeFeatures.map((feature, index) => (
                  <div
                    key={`feature-${formLanguage}-${index}`}
                    className="flex items-center gap-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <input
                        lang={formLanguage}
                        value={feature}
                        onChange={(event) =>
                          updateActiveFeatures((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? event.target.value : item,
                            ),
                          )
                        }
                        maxLength={500}
                        placeholder={`Feature ${index + 1}`}
                        aria-label={`${formLanguage === "gu" ? "Gujarati " : ""}feature ${index + 1}`}
                        className={compactInputClass}
                      />
                      <AdminGujaratiSuggestion
                        active={formLanguage === "gu"}
                        autoSuggest={false}
                        sourceText={features[index]}
                        onApply={(suggestion) =>
                          setGujaratiFeatures((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? suggestion : item,
                            ),
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      disabled={activeFeatures.length >= MAX_PRODUCT_FEATURES}
                      onClick={() =>
                        updateActiveFeatures((current) => [
                          ...current.slice(0, index + 1),
                          "",
                          ...current.slice(index + 1),
                        ])
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Add another feature after ${index + 1}`}
                      title="Add feature"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveFeatures((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                      aria-label={`Remove feature ${index + 1}`}
                      title="Delete feature"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => updateActiveFeatures(() => [""])}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-orange-200 px-3 text-xs font-semibold text-orange-600 hover:bg-orange-50"
              >
                <Plus size={15} />
                Add feature
              </button>
            )}
          </div>
        </fieldset>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end lg:col-span-2">
          <Link
            href="/admin/products"
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600"
          >
            Cancel
          </Link>
          {formLanguage === "gu" && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setFormLanguage("en");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={busy}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <ArrowLeft size={17} />
              Previous
            </button>
          )}
          <button
            disabled={
              busy ||
              !selectedCategory ||
              Boolean(imageError) ||
              Boolean(detailImagesError)
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {formLanguage === "en" ? (
              <ArrowRight size={17} />
            ) : (
              <Save size={17} />
            )}
            {formLanguage === "en"
              ? "Next"
              : busy
                ? "Saving..."
                : initialItem
                  ? "Update product"
                  : "Create product"}
          </button>
        </div>
      </form>
      {categoryCreatorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !categoryBusy) {
              setCategoryCreatorOpen(false);
              setCategoryCreatorLanguage("en");
              setCategoryError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-category-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="create-category-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Add category
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a category and select it for this product.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCategoryCreatorOpen(false);
                  setCategoryCreatorLanguage("en");
                  setCategoryError("");
                }}
                disabled={categoryBusy}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Close category popup"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5">
              <AdminBilingualFormSteps currentStep={categoryCreatorLanguage} />
            </div>
            <div className="mt-5 space-y-4">
              <label
                className={`text-sm font-semibold ${categoryCreatorLanguage === "en" ? "block" : "hidden"}`}
              >
                English category name
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  maxLength={120}
                  className={inputClass}
                />
              </label>
              <div
                className={
                  categoryCreatorLanguage === "gu" ? "block" : "hidden"
                }
                lang="gu"
              >
                <label
                  htmlFor="new-category-gujarati-name"
                  className="text-sm font-semibold"
                >
                  Gujarati category name
                </label>
                <input
                  id="new-category-gujarati-name"
                  value={newCategoryGujaratiName}
                  onChange={(event) =>
                    setNewCategoryGujaratiName(event.target.value)
                  }
                  maxLength={120}
                  className={inputClass}
                />
                <AdminGujaratiSuggestion
                  active={categoryCreatorLanguage === "gu"}
                  sourceText={newCategoryName}
                  targetText={newCategoryGujaratiName}
                  onApply={setNewCategoryGujaratiName}
                />
              </div>
              {categoryError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {categoryError}
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setCategoryCreatorOpen(false);
                  setCategoryCreatorLanguage("en");
                  setCategoryError("");
                }}
                disabled={categoryBusy}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              {categoryCreatorLanguage === "gu" ? (
                <button
                  type="button"
                  disabled={categoryBusy}
                  onClick={() => {
                    setCategoryCreatorLanguage("en");
                    setCategoryError("");
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ArrowLeft size={17} /> Previous
                </button>
              ) : null}
              <button
                type="button"
                disabled={categoryBusy}
                onClick={createCategory}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {categoryCreatorLanguage === "en" ? (
                  <ArrowRight size={17} />
                ) : (
                  <Save size={17} />
                )}
                {categoryCreatorLanguage === "en"
                  ? "Next"
                  : categoryBusy
                    ? "Creating..."
                    : "Create and select"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
