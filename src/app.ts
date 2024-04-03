import { mongoConnect } from '@users/database';
import { config } from '@users/config';
import { start } from '@users/server';
import express, { Express } from 'express';

function initialize(): void {
  config.cloudinaryConfig();
  mongoConnect();
  const app: Express = express();
  start(app);
}
initialize();
