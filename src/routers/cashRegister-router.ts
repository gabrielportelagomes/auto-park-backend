import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createCahsRegister } from '../schemas';
import { getCashRegisterBalance, postCashRegister } from '../controllers';

const cashRegisterRouter = Router();

cashRegisterRouter.all('/', authenticateToken);
cashRegisterRouter.post('/', validateBody(createCahsRegister), postCashRegister);
cashRegisterRouter.get('/', getCashRegisterBalance);

export { cashRegisterRouter };
