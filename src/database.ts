import { winstonLogger } from '@benjaminalcala/gigl-shared';
import { config } from '@users/config';
import mongoose from 'mongoose';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersServer', 'debug');

export async function mongoConnect(): Promise<void> {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('Users service successfully connected to mongo service');
  } catch (error) {
    log.error('Unable to connect to mongo');
    log.error(`Users Service mongoConnect(): ${error}`);
  }
}
