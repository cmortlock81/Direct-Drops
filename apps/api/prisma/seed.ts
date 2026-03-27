import { PrismaClient, Role, CourierStatus, JobStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Password123!');

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', name: 'Admin User', role: Role.ADMIN, passwordHash }
  });

  const controllers = await Promise.all(
    ['controller1', 'controller2'].map((u, idx) =>
      prisma.user.upsert({
        where: { username: u },
        update: {},
        create: { username: u, name: `Controller ${idx + 1}`, role: Role.CONTROLLER, passwordHash }
      })
    )
  );

  const couriers = await Promise.all(
    Array.from({ length: 5 }).map((_, idx) =>
      prisma.user.upsert({
        where: { username: `courier${idx + 1}` },
        update: {},
        create: { username: `courier${idx + 1}`, name: `Courier ${idx + 1}`, role: Role.COURIER, passwordHash }
      })
    )
  );

  for (const user of couriers) {
    await prisma.courier.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, currentStatus: CourierStatus.AVAILABLE }
    });
  }

  const settings = {
    gps_update_interval_seconds: 20,
    stale_gps_threshold_seconds: 120,
    default_queue_sort_mode: 'PRIORITY_THEN_AGE',
    sms_sending_enabled: true,
    sms_retry_count: 2
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.adminSetting.upsert({
      where: { key },
      update: { value, updatedByUserId: admin.id },
      create: { key, value, updatedByUserId: admin.id }
    });
  }

  const templates = [
    { eventKey: 'ASSIGNED', name: 'Assigned', body: 'Hi {{customerName}}, courier {{courierName}} has your order {{jobId}}.' },
    { eventKey: 'OUT_FOR_DELIVERY', name: 'Out for delivery', body: 'Order {{jobId}} is out for delivery to {{addressLine1}}.' },
    { eventKey: 'DELIVERED', name: 'Delivered', body: 'Order {{jobId}} has been delivered. Status: {{status}}.' },
    { eventKey: 'FAILED', name: 'Failed', body: 'Delivery failed for order {{jobId}}. Status: {{status}}.' }
  ];

  for (const t of templates) {
    await prisma.smsTemplate.upsert({
      where: { eventKey: t.eventKey },
      update: { ...t, updatedByUserId: admin.id },
      create: { ...t, updatedByUserId: admin.id }
    });
  }

  const controllerId = controllers[0].id;
  const firstCourier = await prisma.courier.findFirstOrThrow();

  await prisma.job.createMany({
    data: [
      {
        customerName: 'Jane Smith', customerPhone: '+447700900123', deliveryAddressLine1: '10 High Street', deliveryCity: 'London', deliveryPostcode: 'SW1A 1AA', status: JobStatus.NEW, createdByUserId: controllerId
      },
      {
        customerName: 'Joe Bloggs', customerPhone: '+447700900124', deliveryAddressLine1: '11 High Street', deliveryCity: 'London', deliveryPostcode: 'SW1A 1AB', status: JobStatus.ASSIGNED, assignedCourierId: firstCourier.id, createdByUserId: controllerId, assignedAt: new Date()
      },
      {
        customerName: 'Alice Doe', customerPhone: '+447700900125', deliveryAddressLine1: '12 High Street', deliveryCity: 'London', deliveryPostcode: 'SW1A 1AC', status: JobStatus.DELIVERED, assignedCourierId: firstCourier.id, createdByUserId: controllerId, deliveredAt: new Date()
      }
    ]
  });
}

main().finally(() => prisma.$disconnect());
