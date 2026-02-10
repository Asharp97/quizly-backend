import { ConsumerService } from '../consumer.service';
import { ProducerService } from '../producer.service';
import { HealthPingEvent, HealthPongEvent } from '../events/health.event';
import { KafkaHealthController } from '../kafka.controller';

export async function setupKafkaConsumers(
  consumerService: ConsumerService,
  producerService: ProducerService,
  healthController: KafkaHealthController,
) {
  // Health ping consumer - responds with pong
  await consumerService.consume(
    { topics: ['health.ping'] },
    {
      eachMessage: async ({ message }) => {
        const event: HealthPingEvent = JSON.parse(
          message.value?.toString() || '{}',
        );

        console.log(`[Consumer] Health ping received: ${event.requestId}`);

        const latencyMs = Date.now() - event.timestamp;

        // Respond with pong
        const pongEvent: HealthPongEvent = {
          requestId: event.requestId,
          timestamp: Date.now(),
          latencyMs,
        };

        await producerService.produce({
          topic: 'health.pong',
          messages: [
            {
              key: event.requestId,
              value: JSON.stringify(pongEvent),
            },
          ],
        });

        console.log(`[Consumer] Health pong sent: ${event.requestId}`);
      },
    },
  );

  // Health pong consumer - notifies the health controller
  await consumerService.consume(
    { topics: ['health.pong'] },
    {
      eachMessage: async ({ message }) => {
        const event: HealthPongEvent = JSON.parse(
          message.value?.toString() || '{}',
        );

        console.log(`[Consumer] Health pong received: ${event.requestId}`);
        healthController.handleHealthPong(event.requestId, event.latencyMs);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate async processing
      },
    },
  );
}
