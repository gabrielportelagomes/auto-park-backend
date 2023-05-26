import cashItemRepository from '../../repositories/cashItem-repository';
import { conflictError } from '../../errors';
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

const cashService = {
  createCashItem,
};

export default cashService;
