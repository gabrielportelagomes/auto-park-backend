import Joi from 'joi';

import { CreateVehicleRegisterParams, FindVehicleRegisterByPlateNumberParams } from '../protocols';

export const createVehicleRegister = Joi.object<CreateVehicleRegisterParams>({
  vehicle_type_id: Joi.number().integer().required(),
  plate_number: Joi.string().length(7).required(),
});

export const findVehicleRegisterByPlateNumber = Joi.object<FindVehicleRegisterByPlateNumberParams>({
  plate_number: Joi.string().length(7).required(),
});
