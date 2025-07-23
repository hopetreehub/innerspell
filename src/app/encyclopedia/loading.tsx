
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpenText } from 'lucide-react';

export default function EncyclopediaLoading() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <BookOpenText className="mx-auto h-16 w-16 text-primary mb-4 animate-pulse" />
        <Skeleton className="h-10 w-3/4 sm:w-1/2 mx-auto mb-4" />
        <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-2">
            <Skeleton className="aspect-[275/475] w-full rounded-lg" /> {/* Aspect ratio for card image */}
            <div className="p-2">
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
