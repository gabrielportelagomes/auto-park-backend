import { faker } from '@faker-js/faker';

import { prisma } from '../../src/config';
import { CashRegister, Prisma } from '@prisma/client';
import { CreateCashRegisterFactory, CreateManyCashRegisterFactory } from 'protocols';

export async function createCashRegister({
  user_id,
  cash_item_id,
  value,
  transaction_type,
}: CreateCashRegisterFactory): Promise<CashRegister> {
  const quantity = faker.number.int({ min: 1, max: 5 });
  return await prisma.cashRegister.create({
    data: {
      cash_item_id,
      quantity,
      amount: quantity * value,
      transaction_type,
      user_id,
    },
  });
}

export async function createManyCashRegister(data: CreateManyCashRegisterFactory[]): Promise<Prisma.BatchPayload> {
  return await prisma.cashRegister.createMany({
    data,
  });
}
