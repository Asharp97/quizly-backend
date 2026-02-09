import { Controller, Get } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';
import { v4 as uuidv4 } from 'uuid';
import { HealthPingEvent } from './events/health.event';
import { Public } from 'src/common/decorators/public.decorator';

interface PendingHealthCheck {
  requestId: string;
  startTime: number;
  resolve: (latency: number) => void;
  timeout: NodeJS.Timeout;
}

@Controller('health')
export class KafkaHealthController {
  private pendingHealthChecks = new Map<string, PendingHealthCheck>();

  constructor(
    private readonly producerService: ProducerService,
    private readonly consumerService: ConsumerService,
  ) {}

  @Public()
  @Get('kafka')
  async checkKafkaHealth(): Promise<{
    status: 'ok' | 'degraded';
    latencyMs?: number;
    error?: string;
  }> {
    const requestId = uuidv4();
    const startTime = Date.now();

    try {
      // Create a promise that will resolve when we receive the pong
      const latencyPromise = new Promise<number>((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pendingHealthChecks.delete(requestId);
          reject(new Error('Health check timeout'));
        }, 3000); // 3 second timeout

        this.pendingHealthChecks.set(requestId, {
          requestId,
          startTime,
          resolve,
          timeout,
        });
      });

      // Send health ping event
      const pingEvent: HealthPingEvent = {
        requestId,
        timestamp: startTime,
      };

      await this.producerService.produce({
        topic: 'health.ping',
        messages: [
          {
            key: requestId,
            value: JSON.stringify(pingEvent),
          },
        ],
      });

      // Wait for pong response
      const latencyMs = await latencyPromise;

      return {
        status: 'ok',
        latencyMs,
      };
    } catch (error) {
      return {
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Called by consumer when pong is received
  handleHealthPong(requestId: string, latencyMs: number): void {
    const pending = this.pendingHealthChecks.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingHealthChecks.delete(requestId);
      pending.resolve(latencyMs);
    }
  }
}
