import 'reflect-metadata';
import 'express-async-errors';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { loadEnv, connectDb, disconnectDB } from './config';
import { ApplicationError } from './protocols';
import { handleApplicationErrors } from './middlewares';
import { authenticationRouter, cashItemRouter, usersRouter } from './routers';

loadEnv();

const app = express();

app
  .use(cors())
  .use(express.json())
  .get('/health', (_req: Request, res: Response) => res.send('OK!'))
  .use('/users', usersRouter)
  .use('/auth', authenticationRouter)
  .use('/cash-item', cashItemRouter)
  .use((err: Error | ApplicationError, req: Request, res: Response, next: NextFunction) => {
    handleApplicationErrors(err, res);
  });

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDB();
}

export default app;
