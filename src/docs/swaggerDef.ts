import { version } from '../../package.json';
import config from '../config/config';

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'POCRE (Proof Of co-CREation) API documentation',
    version,
  },
  servers: [
    {
      url: config.docs_server_url,
    },
  ],
};

export default swaggerDef;
