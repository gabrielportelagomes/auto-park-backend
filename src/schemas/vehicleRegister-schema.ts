import Joi from 'joi';

import { CreateVehicleRegisterParams } from '../protocols';

export const createVehicleRegister = Joi.object<CreateVehicleRegisterParams>({
  vehicle_type_id: Joi.number().integer().required(),
  plate_number: Joi.string().length(7).required(),
});
