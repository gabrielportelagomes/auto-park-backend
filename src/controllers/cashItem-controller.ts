import { Response } from 'express';
import httpStatus from 'http-status';

import { CreateCashItemParams } from '../protocols';
import { AuthenticatedRequest } from '../middlewares';
import cashService from '../services/cashItem-service';

export async function postCashItem(req: AuthenticatedRequest, res: Response) {
  const { user_id } = req;
  const { cash_type, value } = req.body as CreateCashItemParams;

  try {
    const cashType = await cashService.createCashItem({ user_id, cash_type, value });

    return res.status(httpStatus.CREATED).send(cashType);
  } catch (error) {
    return res.status(httpStatus.CONFLICT).send(error);
  }
}
