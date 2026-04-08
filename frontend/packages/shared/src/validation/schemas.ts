import { z } from 'zod';
import { PARCEL_STATUSES } from '../constants/parcelStatuses.js';
import { USER_ROLES } from '../constants/roles.js';
import { isPasswordAcceptableForAuth } from '../utils/password.js';
import { isLikelyUkPostcode, normalizeUkPostcode } from '../utils/validators.js';

export const emailSchema = z.string().trim().email('Invalid email address');

export const ukPostcodeSchema = z
  .string()
  .trim()
  .min(5, 'Postcode is required')
  .refine(isLikelyUkPostcode, 'Must be a valid UK postcode')
  .transform(normalizeUkPostcode);

export const userRoleSchema = z.enum(USER_ROLES);

export const parcelStatusSchema = z.enum(PARCEL_STATUSES);

export const uuidSchema = z.string().uuid('Invalid id');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const nameSchema = z.string().trim().min(1, 'Required').max(100);

export const registerRequestSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    firstName: nameSchema,
    lastName: nameSchema,
    role: userRoleSchema,
    postcode: z.preprocess(
      (val) => (val === null ? undefined : val),
      z
        .string()
        .trim()
        .optional()
        .transform((s) => (s === '' ? undefined : s)),
    ),
    phone: z
      .string()
      .trim()
      .max(20)
      .optional()
      .transform((s) => (s === '' ? undefined : s)),
    /** Pickup address (affiliate hub). Required when role is affiliate. */
    addressLine1: z
      .string()
      .trim()
      .max(255)
      .optional()
      .transform((s) => (s === '' ? undefined : s)),
    maxDailyCapacity: z.coerce.number().int().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (!isPasswordAcceptableForAuth(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Password must be 12–128 characters with upper, lower, number, and special character; avoid common weak patterns',
        path: ['password'],
      });
    }
    if (data.role === 'affiliate') {
      if (!data.postcode || !isLikelyUkPostcode(data.postcode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A valid UK postcode is required for affiliate registration',
          path: ['postcode'],
        });
      }
      const line = data.addressLine1?.trim() ?? '';
      if (line.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A pickup address (line 1) is required for affiliate registration',
          path: ['addressLine1'],
        });
      }
    }
    if (data.role === 'customer') {
      if (!data.postcode || !isLikelyUkPostcode(data.postcode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A valid UK postcode is required for customer registration',
          path: ['postcode'],
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    postcode:
      (data.role === 'affiliate' || data.role === 'customer') && data.postcode
        ? normalizeUkPostcode(data.postcode)
        : null,
  }));

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const manifestRowSchema = z
  .object({
    carrierRef: z.string().trim().min(1, 'carrierRef is required').max(100),
    recipientName: z.string().trim().min(1).max(200),
    recipientPostcode: z.string().trim().min(1),
    recipientEmail: z
      .string()
      .trim()
      .optional()
      .transform((s) => (s === '' || s === undefined ? undefined : s)),
    estimatedDropTime: z
      .string()
      .trim()
      .optional()
      .transform((s) => (s === '' || s === undefined ? null : s)),
  })
  .superRefine((row, ctx) => {
    if (!isLikelyUkPostcode(row.recipientPostcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be a valid UK postcode',
        path: ['recipientPostcode'],
      });
    }
  })
  .transform((row) => ({
    carrierRef: row.carrierRef,
    recipientName: row.recipientName,
    recipientPostcode: normalizeUkPostcode(row.recipientPostcode),
    recipientEmail: row.recipientEmail ?? null,
    estimatedDropTime: row.estimatedDropTime,
  }));

export const manifestUploadSchema = z.discriminatedUnion('format', [
  z.object({
    format: z.literal('csv'),
    content: z.string().min(1, 'CSV content is required'),
  }),
  z.object({
    format: z.literal('json'),
    rows: z.array(manifestRowSchema).min(1, 'At least one row is required'),
  }),
]);

export const parcelListQuerySchema = paginationSchema.extend({
  status: parcelStatusSchema.optional(),
});

export const parcelStatusPatchSchema = z.object({
  status: parcelStatusSchema,
  note: z.string().trim().max(2000).optional(),
});

/** Affiliate submits scanned / pasted JWT (web or mobile client). */
export const parcelCollectBodySchema = z.object({
  qrToken: z.string().min(10, 'qrToken is required'),
});

/** Ops manual affiliate assignment / reassignment. */
export const parcelAssignAffiliateBodySchema = z.object({
  affiliateId: z.union([uuidSchema, z.null()]),
});

export type ParcelCollectBody = z.infer<typeof parcelCollectBodySchema>;
export type ParcelAssignAffiliateBody = z.infer<typeof parcelAssignAffiliateBodySchema>;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type ManifestRowParsed = z.infer<typeof manifestRowSchema>;
export type ManifestUploadBody = z.infer<typeof manifestUploadSchema>;
export type ParcelListQuery = z.infer<typeof parcelListQuerySchema>;
export type ParcelStatusPatchBody = z.infer<typeof parcelStatusPatchSchema>;
