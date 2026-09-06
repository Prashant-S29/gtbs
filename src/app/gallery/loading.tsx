import { Skeleton, GalleryCardSkeleton } from "@/components/common/Skeleton";

export default function GalleryLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
        <Skeleton className="h-6 w-36 rounded-full mx-auto" />
        <Skeleton className="h-10 w-80 rounded-xl mx-auto" />
        <Skeleton className="h-4 w-96 rounded-md mx-auto" />
      </div>

      {/* Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-11 w-full md:w-80 rounded-full" />
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GalleryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
