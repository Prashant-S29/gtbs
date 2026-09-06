import { Skeleton } from "@/components/common/Skeleton";

export default function ContactLoading() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-3xl bg-orange-50/50 p-6 lg:grid-cols-2">
          <Skeleton className="h-[460px] w-full rounded-2xl" />
          <Skeleton className="h-[460px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
