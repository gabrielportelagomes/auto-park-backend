import { CreateCashItem } from '../../protocols';
import { prisma } from '../../config';

async function findByValue(value: number) {
  return await prisma.cashItem.findUnique({
    where: { value },
  });
}

async function create(data: CreateCashItem) {
  return await prisma.cashItem.create({
    data,
  });
}

async function findAll() {
  return await prisma.cashItem.findMany();
}

async function findManyById(cashItemIds: number[]) {
  return prisma.cashItem.findMany({
    where: {
      id: {
        in: cashItemIds,
      },
    },
  });
}

async function findById(id: number) {
  return prisma.cashItem.findUnique({
    where: {
      id,
    },
  });
}

const cashItemRepository = {
  findByValue,
  create,
  findAll,
  findManyById,
  findById,
};

export default cashItemRepository;
