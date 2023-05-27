import { CreateVehicleRegister } from '../../protocols';
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

const vehicleRegisterRepository = {
  findByPlateNumber,
  create,
  findAll,
};

export default vehicleRegisterRepository;
