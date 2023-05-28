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

async function findAll() {
  return await prisma.vehicleType.findMany();
}

async function findById(id: number) {
  return await prisma.vehicleType.findUnique({
    where: { id },
  });
}

const vehicleTypeRepository = {
  findByVehicleType,
  create,
  findAll,
  findById,
};

export default vehicleTypeRepository;
