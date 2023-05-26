import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createCahsItem } from '../schemas';
import { getAllCashItens, postCashItem } from '../controllers';

const cashItemRouter = Router();

cashItemRouter.all('/', authenticateToken);
cashItemRouter.post('/', validateBody(createCahsItem), postCashItem);
cashItemRouter.get('/all', getAllCashItens);

export { cashItemRouter };
