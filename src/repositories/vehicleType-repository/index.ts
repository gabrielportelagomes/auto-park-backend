import { CreateVehicleType } from '../../protocols';
import { prisma } from '../../config';

async function findByVehicleType(vehicle_type: string) {
  return await prisma.vehicleType.findUnique({
    where: { vehicle_type },
  });
}

async function create(data: CreateVehicleType) {
  return await prisma.vehicleType.create({
    data,
  });
}

const vehicleTypeRepository = {
  findByVehicleType,
  create,
};

export default vehicleTypeRepository;
