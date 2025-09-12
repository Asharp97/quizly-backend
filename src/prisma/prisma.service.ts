import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', (event) => {
      console.log('Process beforeExit event:', event);
      app.close().catch((err) => console.error('Error during app close:', err));
    });
  }
}
