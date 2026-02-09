export interface HealthPingEvent {
  requestId: string;
  timestamp: number;
}

export interface HealthPongEvent {
  requestId: string;
  timestamp: number;
  latencyMs: number;
}
