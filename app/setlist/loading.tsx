import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <div className="px-8 py-8 max-w-[1400px] mx-auto">
        <LoadingSkeleton />
      </div>
    </div>
  );
}
