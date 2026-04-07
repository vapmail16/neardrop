import { CustomerParcelDetailClient } from './CustomerParcelDetailClient';

export default function CustomerParcelDetailPage({ params }: { params: { id: string } }) {
  return <CustomerParcelDetailClient parcelId={params.id} />;
}
