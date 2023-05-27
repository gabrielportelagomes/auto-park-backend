import Joi from 'joi';

import { CreateCashItemParams } from '../protocols';

export const createCahsItem = Joi.object<CreateCashItemParams>({
  cash_type: Joi.string().valid('COIN', 'NOTE').required(),
  value: Joi.number().integer().required(),
});
