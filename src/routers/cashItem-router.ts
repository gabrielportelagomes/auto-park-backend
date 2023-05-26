import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createCahsItem } from '../schemas';
import { postCashItem } from '../controllers';

const cashItemRouter = Router();

cashItemRouter.all('/', authenticateToken);
cashItemRouter.post('/', validateBody(createCahsItem), postCashItem);

export { cashItemRouter };
