import http from 'http';

import cors from 'cors';
import { Application, Request, Response, NextFunction, json, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { config } from '@users/config';
import { verify } from 'jsonwebtoken';
import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@benjaminalcala/gigl-shared';
import compression from 'compression';
import { checkElasticHealth } from '@users/elasticsearch';
import { appRoutes } from '@users/routes';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersServer', 'debug');
const PORT = 4003;

export function start(app: Application) {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticsearch();
  errorHandler(app);
  startServer(app);
}

function securityMiddleware(app: Application): void {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
    })
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload = verify(token, `${config.JWT_TOKEN}`) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application) {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routesMiddleware(app: Application): void {
  appRoutes(app);
}

async function startQueues(): Promise<void> {}

function startElasticsearch() {
  checkElasticHealth();
}

function errorHandler(app: Application): void {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.error(`UsersService ${error.comingFrom}: ${error}`);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}

function startServer(app: Application) {
  try {
    const server: http.Server = new http.Server(app);
    log.info(`Users Service has started with pid: ${process.pid}`);
    server.listen(PORT, () => {
      log.info(`Users Service is running on port ${PORT}`);
    });
  } catch (error) {
    log.error(`Users Service startServer(): ${error}`);
  }
}
