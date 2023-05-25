import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';

const app = express();

app
  .use(cors())
  .use(express.json())
  .get('/health', (_req, res) => res.send('OK!'));

export default app;
