export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="h-7 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
            <div className="h-7 w-16 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-100" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-4 w-12 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
