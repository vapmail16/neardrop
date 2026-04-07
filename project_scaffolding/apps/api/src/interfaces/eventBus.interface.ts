export type DomainEvent = {
  type: string;
  payload: Record<string, unknown>;
  occurredAt: string;
};

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
}
