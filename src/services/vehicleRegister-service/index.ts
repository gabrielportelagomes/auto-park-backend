import vehicleRegisterRepository from '../../repositories/vehicleRegister-repository';
import { conflictError, notFoundError } from '../../errors';
import vehicleTypeRepository from '../../repositories/vehicleType-repository';
import { VehicleRegister } from '@prisma/client';

export async function createVehicleRegister(
  user_id: number,
  vehicle_type_id: number,
  plate_number: string,
): Promise<VehicleRegister> {
  await validateUniqueVehicleActive(plate_number);
  await validateVehicleType(vehicle_type_id);

  const entry_time: Date = new Date();
  entry_time.setHours(entry_time.getHours() - 3);

  const vehicleRegister = await vehicleRegisterRepository.create({
    user_id,
    vehicle_type_id,
    plate_number,
    entry_time,
  });

  return vehicleRegister;
}

async function validateUniqueVehicleActive(plate_number: string) {
  const isActiveVehicleAlreadyRegistered = await vehicleRegisterRepository.findByPlateNumber(plate_number);

  if (isActiveVehicleAlreadyRegistered) {
    throw conflictError('This vehicle already has an active registration!');
  }
}

async function validateVehicleType(vehicle_type_id: number) {
  const vehicleType = await vehicleTypeRepository.findById(vehicle_type_id);

  if (!vehicleType) {
    throw notFoundError();
  }
}

async function findAllVehicleRegisters(): Promise<VehicleRegister[]> {
  const registers = await vehicleRegisterRepository.findAll();

  if (registers.length === 0) {
    throw notFoundError();
  }

  return registers;
}

async function findVehicleRegisterByPlateNumber(plate_number: string): Promise<VehicleRegister> {
  const register = await vehicleRegisterRepository.findByPlateNumber(plate_number);

  if (!register) {
    throw notFoundError();
  }

  return register;
}

const vehicleRegisterService = {
  createVehicleRegister,
  findAllVehicleRegisters,
  findVehicleRegisterByPlateNumber,
};

export default vehicleRegisterService;
