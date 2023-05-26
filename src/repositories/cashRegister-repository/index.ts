import { CreateCashRegister } from 'protocols';
import { prisma } from '../../config';

async function registersBalance() {
  return await prisma.cashRegister.groupBy({
    by: ['cash_item_id', 'transaction_type'],
    _sum: {
      quantity: true,
    },
    orderBy: { cash_item_id: 'asc' },
  });
}

async function createMany(data: CreateCashRegister[]) {
  return await prisma.cashRegister.createMany({
    data,
  });
}

const cashRegisterRepository = {
  registersBalance,
  createMany,
};

export default cashRegisterRepository;
