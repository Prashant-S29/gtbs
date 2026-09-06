import { Skeleton } from "@/components/common/Skeleton";

export default function AboutLoading() {
  return (
    <div className="py-12 space-y-16">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="aspect-[1.3/1] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
