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

const cashItemRepository = {
  findByValue,
  create,
  findAll,
};

export default cashItemRepository;
