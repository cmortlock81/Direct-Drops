export const Roles = ['ADMIN', 'CONTROLLER', 'COURIER'] as const;
export type Role = (typeof Roles)[number];

export const JobStatuses = ['NEW', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'] as const;
export type JobStatus = (typeof JobStatuses)[number];

export const PriorityValues = ['NORMAL', 'HIGH'] as const;
export type Priority = (typeof PriorityValues)[number];

export const CourierStatuses = ['OFFLINE', 'AVAILABLE', 'BUSY'] as const;
export type CourierStatus = (typeof CourierStatuses)[number];

export interface CreateJobDto {
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    postcode: string;
  };
  notes?: string | null;
  priority?: Priority;
}
