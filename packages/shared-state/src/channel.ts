import type { StateTree } from 'pinia';
import type { DeepPartial } from 'src/types';

export interface Message<T extends StateTree> {
  state: T | DeepPartial<T>;
  time: number;
}

export interface Channel<T extends StateTree> {
  connect(): void;
  disconnect(): void;
  broadcast(state: T | DeepPartial<T>): void;
  subscribe(handler: (message: Message<T> | null) => void): void;
}

export class TabChannel<T extends StateTree> implements Channel<T> {
  private readonly requestChannel: BroadcastChannel;
  private readonly updateChannel: BroadcastChannel;

  constructor(
    name: string,
    private readonly instant: boolean = true,
  ) {
    this.requestChannel = new BroadcastChannel(`${name}:request`);
    this.updateChannel = new BroadcastChannel(`${name}:update`);
  }

  public connect(): void {
    if (this.instant) {
      this.requestChannel.postMessage(null);
    }
  }

  public disconnect(): void {
    this.requestChannel.close();
    this.updateChannel.close();
  }

  public broadcast(state: T | DeepPartial<T>): void {
    this.updateChannel.postMessage({
      state,
      time: Date.now(),
    });
  }

  public subscribe(handler: (message: Message<T> | null) => void): void {
    this.requestChannel.addEventListener('message', () => {
      handler(null);
    });

    this.updateChannel.addEventListener('message', (event: MessageEvent) => {
      handler(event.data);
    });
  }
}
