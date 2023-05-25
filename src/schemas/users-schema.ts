import Joi from 'joi';

import { CreateUserParams } from '../protocols';

export const createUserSchema = Joi.object<CreateUserParams>({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .required()
    .messages({
      'string.min': 'The password must have a minimum of {#limit} characters',
      'string.pattern.base':
        'The password must contain at least one lowercase letter, one uppercase letter, and one digit',
    }),
});
