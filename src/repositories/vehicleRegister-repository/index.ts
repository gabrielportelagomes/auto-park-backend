import { CreateVehicleRegister, UpdateVehicleRegister } from '../../protocols';
import { prisma } from '../../config';

async function findByPlateNumber(plate_number: string) {
  return await prisma.vehicleRegister.findFirst({
    where: { plate_number, exit_time: null },
  });
}

async function create(data: CreateVehicleRegister) {
  return await prisma.vehicleRegister.create({
    data,
  });
}

async function findAll() {
  return await prisma.vehicleRegister.findMany({
    orderBy: [{ exit_time: 'asc' }, { entry_time: 'asc' }],
  });
}

async function findByEntryTime(startDate: Date, endDate: Date) {
  return await prisma.vehicleRegister.findMany({
    where: {
      entry_time: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: [{ exit_time: 'asc' }, { entry_time: 'asc' }],
  });
}

async function findById(id: number) {
  return await prisma.vehicleRegister.findUnique({
    where: { id },
    include: {
      VehicleType: true,
    },
  });
}

async function update(id: number, data: UpdateVehicleRegister) {
  return await prisma.vehicleRegister.update({
    where: { id },
    data,
  });
}

const vehicleRegisterRepository = {
  findByPlateNumber,
  create,
  findAll,
  findByEntryTime,
  findById,
  update,
};

export default vehicleRegisterRepository;
