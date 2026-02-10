import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(ProducerService.name);
  private readonly kafka = new Kafka({
    clientId: 'my-app',
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  });
  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit() {
    try {
      await this.producer.connect();
    } catch (error) {
      this.logger.warn(
        'Failed to connect to Kafka. This is expected in test environments.',
        error,
      );
    }
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
