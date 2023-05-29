import Joi from 'joi';

import { CreateCashItemParams } from '../protocols';

export const createCashItem = Joi.object<CreateCashItemParams>({
  cash_type: Joi.string().valid('COIN', 'NOTE').required(),
  value: Joi.number().integer().required(),
});
