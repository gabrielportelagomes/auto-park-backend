import { faker } from '@faker-js/faker';

import { prisma } from '../../src/config';
import { VehicleRegister } from '@prisma/client';

export async function createVehicleRegister(user_id: number, vehicle_type_id: number): Promise<VehicleRegister> {
  return await prisma.vehicleRegister.create({
    data: {
      user_id,
      vehicle_type_id,
      plate_number: faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 }),
      entry_time: new Date(),
    },
  });
}

export async function createInactiveVehicleRegister(
  user_id: number,
  vehicle_type_id: number,
): Promise<VehicleRegister> {
  return await prisma.vehicleRegister.create({
    data: {
      user_id,
      vehicle_type_id,
      plate_number: faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 }),
      entry_time: new Date(),
      exit_time: new Date(),
      paid_amount: faker.number.int({ min: 100, max: 200 }),
    },
  });
}
