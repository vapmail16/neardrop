import { PageSkeleton } from '@/components/ui/PageSkeleton';

export default function OpsParcelsLoading() {
  return (
    <div className="p-4 sm:p-6">
      <PageSkeleton
        title="Parcel pipeline"
        subtitle="All parcels. Assign or reassign affiliate hubs manually."
      />
    </div>
  );
}
