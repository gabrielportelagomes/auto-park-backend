import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createCahsRegister, createChangeAvailability } from '../schemas';
import { getCashRegisterBalance, postCashRegister, postChange } from '../controllers';

const cashRegisterRouter = Router();

cashRegisterRouter.all('/*', authenticateToken);
cashRegisterRouter.post('/', validateBody(createCahsRegister), postCashRegister);
cashRegisterRouter.get('/balance', getCashRegisterBalance);
cashRegisterRouter.post('/change', validateBody(createChangeAvailability), postChange);

export { cashRegisterRouter };
