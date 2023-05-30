import { faker } from '@faker-js/faker';

import { prisma } from '../../src/config';
import { VehicleType } from '@prisma/client';

export async function createVehicleType(user_id: number): Promise<VehicleType> {
  return await prisma.vehicleType.create({
    data: {
      vehicle_type: faker.person.firstName().toLowerCase(),
      hour_hate: faker.number.int({ max: 200 }),
      user_id,
    },
  });
}
