import type { StateTree } from 'pinia';
import { type Message, TabChannel } from 'src/channel';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

describe('TabChannel', () => {
  const name: string = 'test-channel';
  const state: StateTree = { foo: 'bar' };
  let tabChannel: TabChannel<StateTree>;
  let requestChannel: BroadcastChannel;
  let updateChannel: BroadcastChannel;

  beforeEach(() => {
    requestChannel = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      close: vi.fn(),
    } as unknown as BroadcastChannel;
    updateChannel = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      close: vi.fn(),
    } as unknown as BroadcastChannel;

    vi.stubGlobal(
      'BroadcastChannel',
      vi
        .fn()
        .mockImplementation((name: string) =>
          name.endsWith(':request') ? requestChannel : updateChannel,
        ),
    );
  });

  describe('constructor()', () => {
    describe('with default options', () => {
      it('should create channels with correct names', () => {
        tabChannel = new TabChannel(name);
        expect(BroadcastChannel).toHaveBeenNthCalledWith(1, `${name}:request`);
        expect(BroadcastChannel).toHaveBeenNthCalledWith(2, `${name}:update`);
      });
    });
  });

  describe('connect()', () => {
    describe('with instant enabled', () => {
      it('should post null message to request channel', () => {
        tabChannel = new TabChannel(name, true);
        tabChannel.connect();
        expect(requestChannel.postMessage).toHaveBeenCalledWith(null);
      });
    });

    describe('with instant disabled', () => {
      it('should not post message to request channel', () => {
        tabChannel = new TabChannel(name, false);
        tabChannel.connect();
        expect(requestChannel.postMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe('disconnect()', () => {
    describe('when called', () => {
      it('should close both channels', () => {
        tabChannel = new TabChannel(name);
        tabChannel.disconnect();
        expect(requestChannel.close).toHaveBeenCalled();
        expect(updateChannel.close).toHaveBeenCalled();
      });
    });
  });

  describe('broadcast()', () => {
    describe('when called with state', () => {
      it('should post message with state and time', () => {
        const time: number = 1234567890;
        vi.spyOn(Date, 'now').mockReturnValue(time);
        tabChannel = new TabChannel(name);
        tabChannel.broadcast(state);
        expect(updateChannel.postMessage).toHaveBeenCalledWith({ state, time });
      });
    });
  });

  describe('subscribe()', () => {
    describe('when request message received', () => {
      it('should call handler with null', () => {
        const messageHandler: Mock = vi.fn();
        tabChannel = new TabChannel(name);
        tabChannel.subscribe(messageHandler);
        const requestCallback: (event?: MessageEvent) => void = (
          requestChannel.addEventListener as Mock
        ).mock.calls[0][1];
        requestCallback();
        expect(messageHandler).toHaveBeenCalledWith(null);
      });
    });

    describe('when update message received', () => {
      it('should call handler with message data', () => {
        const messageHandler: Mock = vi.fn();
        const message: Message<StateTree> = { state, time: Date.now() };
        tabChannel = new TabChannel(name);
        tabChannel.subscribe(messageHandler);
        const updateCallback: (
          event: Partial<MessageEvent<Message<StateTree>>>,
        ) => void = (updateChannel.addEventListener as Mock).mock.calls[0][1];
        updateCallback({ data: message });
        expect(messageHandler).toHaveBeenCalledWith(message);
      });
    });
  });
});
