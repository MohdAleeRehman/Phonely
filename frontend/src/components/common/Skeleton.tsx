export default function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Card Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Image */}
        <div className="w-full h-48 bg-gray-200 rounded-lg skeleton-shimmer"></div>
        
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 skeleton-shimmer"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 skeleton-shimmer"></div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-24 skeleton-shimmer"></div>
          <div className="h-8 bg-gray-200 rounded w-20 skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function PhoneCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-56 bg-gray-200 skeleton-shimmer"></div>
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4 skeleton-shimmer"></div>
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/2 skeleton-shimmer"></div>
        
        {/* Details */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/3 skeleton-shimmer"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PhoneCardSkeleton key={i} />
      ))}
    </div>
  );
}
