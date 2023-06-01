import { Prisma } from '@prisma/client';
import cashItemRepository from '../../repositories/cashItem-repository';
import { ChangeDetails, CreateCashRegister, CreateChangeAvailabilityParams, RegistersBalance } from '../../protocols';
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

async function cashBalance(): Promise<{ [cash_item_id: number]: number }> {
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

async function cashRegisterBalance(): Promise<RegistersBalance[]> {
  const balance = await cashBalance();

  const cashItems = await cashItemRepository.findAll();

  if (cashItems.length === 0) {
    throw notFoundError();
  }

  const registersBalance = cashItems.map((cashItem) => {
    const { created_at, updated_at, user_id, ...rest } = cashItem;
    const quantity = balance[cashItem.id] || 0;
    const amount = quantity * cashItem.value;
    return { ...rest, quantity, amount };
  });

  const sortedRegistersBalance = registersBalance.sort((a, b) => a.value - b.value);

  return sortedRegistersBalance;
}

async function checkChangeAvailability(user_id: number, changeValue: number) {
  const cashItems = await cashRegisterBalance();
  const orderCashItems = cashItems.sort((a, b) => b.value - a.value);

  const changeDetails: ChangeDetails[] = [];

  for (const cashItem of orderCashItems) {
    const { value, quantity } = cashItem;

    if (quantity > 0 && value <= changeValue) {
      const maxCount = Math.min(Math.floor(changeValue / value), quantity);

      changeDetails.push({
        quantity: maxCount,
        amount: cashItem.value * maxCount,
        value: cashItem.value,
        cash_item_id: cashItem.id,
        transaction_type: 'OUTFLOW',
        user_id,
      });

      changeValue -= value * maxCount;

      cashItem.quantity -= maxCount;
    }

    if (changeValue === 0) {
      break;
    }
  }

  if (changeValue !== 0) {
    throw forbiddenError('Insufficient coins and notes in cash for change!');
  }

  return changeDetails;
}

export async function createChange(user_id: number, data: CreateChangeAvailabilityParams) {
  if (data.total_paid < data.total_price) {
    throw forbiddenError('Insufficient balance, the total paid is less than the total price!');
  }

  const changeValue = data.total_paid - data.total_price;

  const changeDetails = await checkChangeAvailability(user_id, changeValue);
  const createCashRegister: CreateCashRegister[] = changeDetails.map((item) => {
    const { value, ...createCashRegister } = item;
    return createCashRegister;
  });

  const inflowCash = data.cash_register.map((item) => {
    return {
      ...item,
      user_id: user_id,
    };
  });

  inflowCash.forEach((item) => {
    createCashRegister.push(item);
  });

  await cashRegisterRepository.createMany(createCashRegister);

  return changeDetails;
}

const cashRegisterService = {
  createCashRegister,
  cashRegisterBalance,
  createChange,
};

export default cashRegisterService;
