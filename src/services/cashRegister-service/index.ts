import { Prisma } from '@prisma/client';
import cashItemRepository from '../../repositories/cashItem-repository';
import { CreateCashRegister } from '../../protocols';
import { forbiddenError, notFoundError } from '../../errors';
import cashRegisterRepository from '../../repositories/cashRegister-repository';

async function checkCashItemExistence(cashRegisters: CreateCashRegister[]) {
  const cashItemIds = cashRegisters.map((register) => register.cash_item_id);

  const existingCashItems = await cashItemRepository.findManyById(cashItemIds);

  const existingCashItemIds = existingCashItems.map((cashItem) => cashItem.id);

  for (const register of cashRegisters) {
    if (!existingCashItemIds.includes(register.cash_item_id)) {
      throw notFoundError();
    }
  }
}

async function cashBalance() {
  const registersBalance = await cashRegisterRepository.registersBalance();
  const balance: { [cash_item_id: number]: number } = {};

  for (const register of registersBalance) {
    const { cash_item_id, transaction_type, _sum } = register;
    const { quantity } = _sum;

    if (transaction_type === 'INFLOW') {
      if (balance[cash_item_id]) {
        balance[cash_item_id] += quantity;
      } else {
        balance[cash_item_id] = quantity;
      }
    } else if (transaction_type === 'OUTFLOW') {
      if (balance[cash_item_id]) {
        balance[cash_item_id] -= quantity;
      } else {
        balance[cash_item_id] = -quantity;
      }
    }
  }

  return balance;
}

async function checkAvailability(cashRegisters: CreateCashRegister[], balance: Record<string, number>) {
  for (const register of cashRegisters) {
    if (register.transaction_type === 'OUTFLOW') {
      const availableQuantity = balance[register.cash_item_id] || 0;

      if (register.quantity > availableQuantity) {
        const cashItem = await cashItemRepository.findById(register.cash_item_id);
        const valueInReal = (cashItem.value / 100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        const errorMessage = `Insufficient quantity available for ${valueInReal}!`;

        throw forbiddenError(errorMessage);
      }
    }
  }
}

async function createCashRegister(cashRegisters: CreateCashRegister[]): Promise<Prisma.BatchPayload> {
  await checkCashItemExistence(cashRegisters);
  const balance = await cashBalance();
  await checkAvailability(cashRegisters, balance);

  const registersCount = await cashRegisterRepository.createMany(cashRegisters);

  return registersCount;
}

async function cashRegisterBalance() {
  const balance = await cashBalance();

  if (Object.keys(balance).length === 0) {
    throw notFoundError();
  }

  const cashItems = await cashItemRepository.findAll();

  const registersBalance = cashItems.map((cashItem) => {
    const { created_at, updated_at, user_id, ...rest } = cashItem;
    const quantity = balance[cashItem.id] || 0;
    const amount = quantity * cashItem.value;
    return { ...rest, quantity, amount };
  });

  return registersBalance;
}

const cashRegisterService = {
  createCashRegister,
  cashRegisterBalance,
};

export default cashRegisterService;
