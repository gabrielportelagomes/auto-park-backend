import Joi from 'joi';

import {
  CreateVehicleRegisterParams,
  FindVehicleRegisterByDateParams,
  FindVehicleRegisterByPlateNumberParams,
  PatchVehicleRegisterIdParams,
} from '../protocols';

export const createVehicleRegister = Joi.object<CreateVehicleRegisterParams>({
  vehicle_type_id: Joi.number().integer().required(),
  plate_number: Joi.string().length(7).required(),
});

export const findVehicleRegisterByPlateNumber = Joi.object<FindVehicleRegisterByPlateNumberParams>({
  plate_number: Joi.string().length(7).required(),
});

export const findVehicleRegisterByDate = Joi.object<FindVehicleRegisterByDateParams>({
  date: Joi.date().iso().required(),
});

export const patchVehicleRegisterId = Joi.object<PatchVehicleRegisterIdParams>({
  id: Joi.number().integer().required(),
});
