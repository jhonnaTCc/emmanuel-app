export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-10 w-40 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-40 bg-slate-100 border border-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
