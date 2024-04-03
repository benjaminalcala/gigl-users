import { Client } from '@elastic/elasticsearch';
import { winstonLogger } from '@benjaminalcala/gigl-shared';
import { config } from '@users/config';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersElasticSearchServer', 'debug');

export const client: Client = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`,
  auth: {
    username: 'elastic',
    password: 'admin1234'
  }
});

export async function checkElasticHealth(): Promise<void> {
  let isHealthy = false;
  while (!isHealthy) {
    try {
      const health = await client.cluster.health();
      log.info('Users service Elasticsearch cluster health status - ', health.status);
      isHealthy = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.error(`Users service checkElasticHealth() error: ${error}`);
    }
  }
}
