import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbCondig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbCondig.type,
  host: process.env.RDS_HOSTNAME || dbCondig.host,
  port: process.env.RDS_PORT || dbCondig.port,
  username: process.env.RDS_USERNAME || dbCondig.username,
  password: process.env.RDS_PASSWORD || dbCondig.password,
  database: process.env.RDS_DB_NAME || dbCondig.database,
  entities: [__dirname + '/../**/*.entity.js', __dirname + '/../**/*.entity.ts'],
  synchronize: process.env.TYPEORM_SYNC || dbCondig.synch,
};
