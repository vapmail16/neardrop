/** Public affiliate card for customer map / pickup context (no PII beyond location). */
export type AffiliateSummaryPublic = {
  id: string;
  displayName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  verificationStatus: string;
  latitude: string | null;
  longitude: string | null;
};
