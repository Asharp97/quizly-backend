import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly logger = new Logger(ConsumerService.name);
  private readonly kafka = new Kafka({
    clientId: 'my-app',
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  });
  private readonly consumers: Consumer[] = [];
  private healthController: any; // Will be injected via setter
  private quizScoringService: any; // Will be injected via setter

  async consume(
    topic: ConsumerSubscribeTopics,
    config: ConsumerRunConfig,
    groupIdSuffix?: string,
  ) {
    try {
      const groupId = `quizly-${groupIdSuffix || topic.topics[0]}`;
      const consumer = this.kafka.consumer({ groupId });
      await consumer.connect();
      await consumer.subscribe(topic);
      await consumer.run(config);
      this.consumers.push(consumer);
      this.logger.log(
        `Consumer started for topic ${topic.topics.join(', ')} with group ${groupId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to start consumer for topic ${topic.topics.join(', ')}. This is expected in test environments.`,
        error,
      );
    }
  }

  // Setter for circular dependency
  setHealthController(controller: any): void {
    this.healthController = controller;
  }

  setQuizScoringService(service: any): void {
    this.quizScoringService = service;
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
