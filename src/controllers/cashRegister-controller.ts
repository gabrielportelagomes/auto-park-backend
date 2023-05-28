import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { CreateCashRegister, CreateCashRegisterParams, CreateChangeAvailabilityParams } from '../protocols';
import { AuthenticatedRequest } from '../middlewares';
import cashRegisterService from '../services/cashRegister-service';

export async function postCashRegister(req: AuthenticatedRequest, res: Response) {
  const { user_id } = req;
  const body = req.body as CreateCashRegisterParams[];

  const cashRegisters = body.map((register) => ({
    ...register,
    user_id: user_id,
  })) as CreateCashRegister[];

  try {
    const registersCount = await cashRegisterService.createCashRegister(cashRegisters);

    return res.status(httpStatus.CREATED).send(registersCount);
  } catch (error) {
    if (error.name === 'ForbiddenError') {
      return res.status(httpStatus.FORBIDDEN).send(error);
    }
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}

export async function getCashRegisterBalance(req: Request, res: Response) {
  try {
    const registersBalance = await cashRegisterService.cashRegisterBalance();

    return res.status(httpStatus.OK).send(registersBalance);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}

export async function postChange(req: AuthenticatedRequest, res: Response) {
  const { user_id } = req;
  const body = req.body as CreateChangeAvailabilityParams;

  try {
    const registersBalance = await cashRegisterService.createChange(user_id, body);

    return res.status(httpStatus.CREATED).send(registersBalance);
  } catch (error) {
    if (error.name === 'ForbiddenError') {
      return res.status(httpStatus.FORBIDDEN).send(error);
    }
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}
