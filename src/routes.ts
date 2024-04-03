import { verifyGatewayRequest } from '@benjaminalcala/gigl-shared';
import { Application } from 'express';

const BUYER_BASE_ROUTE = '/api/v1/buyer';
const SELLER_BASE_ROUTE = '/api/v1/seller';

export function appRoutes(app: Application): void {
  app.use('', () => {
    console.log('users route healthy');
  });
  app.use(BUYER_BASE_ROUTE, verifyGatewayRequest, () => {
    console.log('buyer routes');
  });
  app.use(SELLER_BASE_ROUTE, verifyGatewayRequest, () => {
    console.log('seller routes');
  });
}
