import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createCahsRegister } from '../schemas';
import { postCashRegister } from '../controllers';

const cashRegisterRouter = Router();

cashRegisterRouter.all('/', authenticateToken);
cashRegisterRouter.post('/', validateBody(createCahsRegister), postCashRegister);

export { cashRegisterRouter };
