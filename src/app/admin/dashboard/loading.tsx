export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="h-7 w-40 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-60 bg-gray-100 rounded-md" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="w-8 h-8 rounded-lg bg-gray-100" />
            </div>
            <div className="h-7 w-16 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded-lg" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-50 flex items-center gap-6">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-14 bg-gray-100 rounded-md" />
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
