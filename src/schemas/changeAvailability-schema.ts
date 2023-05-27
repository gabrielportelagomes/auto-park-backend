import Joi from 'joi';

import { CreateChangeAvailabilityParams, CreateInflowCashRegisterParams } from '../protocols';

export const createChangeAvailability = Joi.object<CreateChangeAvailabilityParams>({
  total_price: Joi.number().integer().required(),
  total_paid: Joi.number().integer().required(),
  cash_register: Joi.array().items(
    Joi.object<CreateInflowCashRegisterParams>({
      cash_item_id: Joi.number().integer().required(),
      quantity: Joi.number().integer().required(),
      amount: Joi.number().integer().required(),
      transaction_type: Joi.string().valid('INFLOW').required(),
    }),
  ),
});
