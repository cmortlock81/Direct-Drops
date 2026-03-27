import { z } from 'zod';

export const Roles = ['ADMIN', 'CONTROLLER', 'COURIER'] as const;
export type Role = (typeof Roles)[number];

export const JobStatuses = ['NEW', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'] as const;
export type JobStatus = (typeof JobStatuses)[number];

export const PriorityValues = ['NORMAL', 'HIGH'] as const;
export type Priority = (typeof PriorityValues)[number];

export const CourierStatuses = ['OFFLINE', 'AVAILABLE', 'BUSY'] as const;
export type CourierStatus = (typeof CourierStatuses)[number];

export const createJobSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(8),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional().nullable(),
    city: z.string().min(1),
    postcode: z.string().min(1)
  }),
  notes: z.string().optional().nullable(),
  priority: z.enum(PriorityValues).default('NORMAL')
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
