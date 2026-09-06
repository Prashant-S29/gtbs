import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>

      {/* Category & Rating */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-3.5 w-20 rounded-md" />
        <Skeleton className="h-3.5 w-12 rounded-md" />
      </div>

      {/* Title lines */}
      <Skeleton className="h-4.5 w-full rounded-md mb-1.5" />
      <Skeleton className="h-4.5 w-3/4 rounded-md mb-3" />

      {/* Price and CTA button */}
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm">
      {/* Cover Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gray-100 mb-5">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>

      {/* Date & Category */}
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-full rounded-md mb-2" />
      <Skeleton className="h-6 w-4/5 rounded-md mb-3" />

      {/* Summary */}
      <Skeleton className="h-3.5 w-full rounded-md mb-1.5" />
      <Skeleton className="h-3.5 w-11/12 rounded-md mb-4" />

      {/* Footer / Author */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
    </div>
  );
}

export function GalleryCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm">
      {/* Image Preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>

      {/* Category */}
      <Skeleton className="h-4 w-20 rounded-full mb-2" />

      {/* Title */}
      <Skeleton className="h-5 w-full rounded-md mb-2" />
      <Skeleton className="h-5 w-3/4 rounded-md mb-3" />

      {/* Date & Location */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-3.5 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-4 w-4 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-4 rounded-md" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>

      {/* Main product grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: Gallery image skeleton */}
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Right: Product Info skeleton */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-3/4 rounded-xl" />

          {/* Rating */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 py-2">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>

          {/* Description */}
          <div className="space-y-2 py-3 border-y border-gray-100">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-2xl" />
            <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48 rounded-md mb-6" />

      {/* Category badge */}
      <Skeleton className="h-6 w-28 rounded-full mb-4" />

      {/* Title */}
      <Skeleton className="h-10 w-full rounded-xl mb-3" />
      <Skeleton className="h-10 w-4/5 rounded-xl mb-6" />

      {/* Author & Date */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 rounded-md mb-1.5" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
      </div>

      {/* Hero Image */}
      <Skeleton className="aspect-[16/9] w-full rounded-3xl mb-8" />

      {/* Content paragraphs */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
    </div>
  );
}

export function GalleryDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-48 rounded-md mb-6" />

      <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-2/3 rounded-xl" />
        </div>

        {/* Photos grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CatalogPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
        <Skeleton className="h-6 w-36 rounded-full mx-auto" />
        <Skeleton className="h-10 w-72 rounded-xl mx-auto" />
        <Skeleton className="h-4 w-96 rounded-md mx-auto" />
      </div>

      {/* Filter and grid row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 p-6 rounded-3xl border border-gray-200/80 bg-white">
          <Skeleton className="h-5 w-24 rounded-md" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="py-3 space-y-12">
      {/* Hero Banner Skeleton */}
      <div className="container px-3 lg:px-6">
        <Skeleton className="h-[420px] sm:h-[480px] w-full rounded-3xl" />
      </div>

      {/* Feature Strip */}
      <div className="container px-3 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Product Section Skeleton */}
      <div className="container px-3 lg:px-6 space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
