import cashItemRepository from '../../repositories/cashItem-repository';
import { conflictError, notFoundError } from '../../errors';
import { CreateCashItem } from '../../protocols';
import { CashItem } from '@prisma/client';

async function createCashItem({ user_id, cash_type, value }: CreateCashItem): Promise<CashItem> {
  const cashItemExists = await cashItemRepository.findByValue(value);

  if (cashItemExists) {
    throw conflictError('Already exists a cash item with this value!');
  }

  const cashItem = await cashItemRepository.create({ user_id, cash_type, value });

  return cashItem;
}

async function findAllCashItens(): Promise<CashItem[]> {
  const cashItens = await cashItemRepository.findAll();

  if (cashItens.length === 0) {
    throw notFoundError();
  }

  return cashItens;
}

const cashService = {
  createCashItem,
  findAllCashItens,
};

export default cashService;
