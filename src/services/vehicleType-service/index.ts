import { VehicleType } from '@prisma/client';
import { conflictError, notFoundError } from '../../errors';
import vehicleTypeRepository from '../../repositories/vehicleType-repository';

export async function createVehicleType(
  user_id: number,
  vehicle_type: string,
  hour_hate: number,
): Promise<VehicleType> {
  await validateUniqueVehicleType(vehicle_type);

  const vehicleType = await vehicleTypeRepository.create({ user_id, vehicle_type, hour_hate });

  return vehicleType;
}

async function validateUniqueVehicleType(vehicle_type: string) {
  const isVehicleTypeAlreadyRegistered = await vehicleTypeRepository.findByVehicleType(vehicle_type);

  if (isVehicleTypeAlreadyRegistered) {
    throw conflictError('There is already a vehicle type with this name!');
  }
}

async function findAllVehicleTypes(): Promise<VehicleType[]> {
  const vehicleTypes = await vehicleTypeRepository.findAll();

  if (vehicleTypes.length === 0) {
    throw notFoundError();
  }

  return vehicleTypes;
}

const vehicleTypeService = {
  createVehicleType,
  findAllVehicleTypes,
};

export default vehicleTypeService;
