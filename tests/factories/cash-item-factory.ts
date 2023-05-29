import { faker } from '@faker-js/faker';

import { prisma } from '../../src/config';
import { CashItem } from '@prisma/client';
import { CreateCashItem } from 'protocols';

export async function createCashItem(user_id: number): Promise<CashItem> {
  return await prisma.cashItem.create({
    data: {
      cash_type: Math.random() < 0.5 ? 'COIN' : 'NOTE',
      value: faker.number.int({ max: 200 }),
      user_id,
    },
  });
}

export async function createCashItemWithParams({ user_id, cash_type, value }: CreateCashItem): Promise<CashItem> {
  return await prisma.cashItem.create({
    data: {
      cash_type,
      value,
      user_id,
    },
  });
}
