import { PageSkeleton } from '@/components/ui/PageSkeleton';

export default function OpsDashboardLoading() {
  return (
    <div className="p-4 sm:p-6">
      <PageSkeleton
        title="Operations dashboard"
        subtitle="Network-wide parcel and hub overview."
      />
    </div>
  );
}
