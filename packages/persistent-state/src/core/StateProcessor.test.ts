import { beforeEach, describe, expect, it } from 'vitest';
import { StateProcessor, type StateProcessorStep } from './StateProcessor';

describe('StateProcessor', () => {
  let processor: StateProcessor<any, any>;

  describe('addStep()', () => {
    beforeEach(() => {
      processor = new StateProcessor();
    });

    describe('when a step is added', () => {
      it('should return the processor instance to allow chaining', () => {
        const step: StateProcessorStep<number, number> = (
          state: number,
        ): number => state + 1;
        const result: StateProcessor<any, any> = processor.addStep(step);
        expect(result).toBe(processor);
      });

      it('should allow chaining of addStep calls', () => {
        const step1: StateProcessorStep<number, number> = (
          state: number,
        ): number => state + 1;
        const step2: StateProcessorStep<number, number> = (
          state: number,
        ): number => state * 2;
        processor.addStep(step1).addStep(step2);
        const result: StateProcessor<any, any> = processor.process(5);
        expect(result).toBe(12);
      });
    });
  });

  describe('process()', () => {
    beforeEach(() => {
      processor = new StateProcessor();
    });

    describe('when steps are added', () => {
      it('should process the state through all steps in order', () => {
        processor
          .addStep((state: number): number => state + 1)
          .addStep((state: number): number => state * 2)
          .addStep((state: number): number => state - 3);
        const result: StateProcessor<any, any> = processor.process(5);
        expect(result).toBe(9);
      });

      it('should handle steps that change the state type', () => {
        const processor = new StateProcessor<number, string>();
        processor
          .addStep<number>((state: number): number => state * 2)
          .addStep<string>((state: number): string => `Value: ${state}`);
        const result: string = processor.process(5);
        expect(result).toBe('Value: 10');
      });

      it('should handle complex transformations', () => {
        const processor = new StateProcessor<{ count: number }, string>();
        processor
          .addStep<number>((state: { count: number }): number => state.count)
          .addStep<number>((count: number): number => count ** 2)
          .addStep<string>(
            (value: number): string => `Squared count: ${value}`,
          );
        const result: string = processor.process({ count: 4 });
        expect(result).toBe('Squared count: 16');
      });
    });

    describe('when no steps are added', () => {
      it('should return the original state', () => {
        const initialState: number = 10;
        const result: StateProcessor<any, any> =
          processor.process(initialState);
        expect(result).toBe(10);
      });
    });

    describe('when a step throws an error', () => {
      it('should propagate the error', () => {
        processor.addStep(() => {
          throw new Error('Test error');
        });

        expect(() => processor.process(5)).toThrowError('Test error');
      });
    });
  });
});
