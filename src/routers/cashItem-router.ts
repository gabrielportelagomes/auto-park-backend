import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createCashItem } from '../schemas';
import { getAllCashItems, postCashItem } from '../controllers';

const cashItemRouter = Router();

cashItemRouter.all('/*', authenticateToken);
cashItemRouter.post('/', validateBody(createCashItem), postCashItem);
cashItemRouter.get('/all', getAllCashItems);

export { cashItemRouter };
