import Joi from 'joi';

import { CreateVehicleTypeParams } from '../protocols';

export const createVehicleType = Joi.object<CreateVehicleTypeParams>({
  vehicle_type: Joi.string().required().trim(),
  hour_hate: Joi.number().integer().required(),
});
