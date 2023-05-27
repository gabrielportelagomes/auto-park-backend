import Joi from 'joi';

import { CreateCashRegisterParams } from '../protocols';

export const createCahsRegister = Joi.array().items(
  Joi.object<CreateCashRegisterParams>({
    cash_item_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().required(),
    amount: Joi.number().integer().required(),
    transaction_type: Joi.string().valid('INFLOW', 'OUTFLOW').required(),
  }),
);
