import { CreateCashItem } from '../../protocols';
import { prisma } from '../../config';

async function findByValue(value: number) {
  return prisma.cashItem.findUnique({
    where: { value },
  });
}

async function create(data: CreateCashItem) {
  return prisma.cashItem.create({
    data,
  });
}

const cashItemRepository = {
  findByValue,
  create,
};

export default cashItemRepository;
