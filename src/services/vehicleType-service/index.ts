import { conflictError } from '../../errors';
import vehicleTypeRepository from '../../repositories/vehicleType-repository';

export async function createVehicleType(user_id: number, vehicle_type: string, hour_hate: number) {
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

const vehicleTypeService = {
  createVehicleType,
};

export default vehicleTypeService;
