import vehicleRegisterRepository from '../../repositories/vehicleRegister-repository';
import { conflictError, forbiddenError, notFoundError } from '../../errors';
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

async function findVehicleRegistersByDate(date: string): Promise<VehicleRegister[]> {
  const startDate = new Date(date);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setUTCHours(23, 59, 59, 999);

  const registers = await vehicleRegisterRepository.findByEntryTime(startDate, endDate);

  if (registers.length === 0) {
    throw notFoundError();
  }

  return registers;
}

async function updateVehicleRegister(user_id: number, id: number) {
  const register = await vehicleRegisterRepository.findById(id);

  if (!register) {
    throw notFoundError();
  }

  if (register.exit_time) {
    throw forbiddenError('This register is not active!');
  }

  const exit_time: Date = new Date();
  exit_time.setHours(exit_time.getHours() - 3);

  const entry_time: Date = new Date(register.entry_time);
  const diff = Math.abs(exit_time.getTime() - entry_time.getTime());
  const hours = diff / (1000 * 60 * 60);
  const paid_amount = Math.round((hours * register.VehicleType.hour_hate) / 5) * 5;

  const registerUpdated = vehicleRegisterRepository.update(id, { user_id, exit_time, paid_amount });

  return registerUpdated;
}

const vehicleRegisterService = {
  createVehicleRegister,
  findAllVehicleRegisters,
  findVehicleRegisterByPlateNumber,
  findVehicleRegistersByDate,
  updateVehicleRegister,
};

export default vehicleRegisterService;
