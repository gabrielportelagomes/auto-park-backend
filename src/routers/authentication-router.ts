import { Router } from 'express';

import { validateBody } from '../middlewares';
import { signInSchema } from '../schemas/auth-schema';
import { postSignIn } from '../controllers';

const authenticationRouter = Router();

authenticationRouter.post('/sign-in', validateBody(signInSchema), postSignIn);

export { authenticationRouter };
