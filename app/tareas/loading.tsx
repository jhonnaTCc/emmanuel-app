import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 md:pl-64 pt-16 md:pt-0">
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">
        <LoadingSkeleton />
      </div>
    </div>
  );
}

