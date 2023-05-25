import { Router } from 'express';

import { validateBody } from '../middlewares';
import { createUserSchema } from '../schemas/users-schema';
import { postUser } from '../controllers';

const usersRouter = Router();

usersRouter.post('/', validateBody(createUserSchema), postUser);

export { usersRouter };
