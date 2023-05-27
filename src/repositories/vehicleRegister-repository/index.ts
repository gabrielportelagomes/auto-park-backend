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

const vehicleRegisterRepository = {
  findByPlateNumber,
  create,
};

export default vehicleRegisterRepository;
