export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-48 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded-md" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-8 gap-4 items-center">
              <div className="h-4 w-20 bg-gray-200 rounded font-mono" />
              <div className="col-span-2">
                <div className="h-3.5 w-28 bg-gray-200 rounded mb-1.5" />
                <div className="h-3 w-36 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-16 bg-gray-100 rounded" />
              <div className="h-6 w-14 bg-gray-100 rounded-md" />
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
