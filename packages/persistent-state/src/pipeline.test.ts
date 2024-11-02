import { Pipeline, type PipelineStep } from 'src/pipeline';
import { describe, expect, it } from 'vitest';

describe('Pipeline', () => {
  describe('addStep()', () => {
    it('should process input through step when called with single step', () => {
      const pipeline: Pipeline<number, string> = new Pipeline();
      const step: PipelineStep<number, string> = (num: number): string =>
        num.toString();
      pipeline.addStep(step);
      expect(pipeline.process(42)).toBe('42');
    });

    it('should process input through all steps in order when called with multiple steps', () => {
      const pipeline: Pipeline<number, boolean> = new Pipeline();
      const stepOne: PipelineStep<number, string> = (num: number): string =>
        num.toString();
      const stepTwo: PipelineStep<string, boolean> = (str: string): boolean =>
        str === '42';
      pipeline.addStep(stepOne).addStep(stepTwo);
      expect(pipeline.process(42)).toBe(true);
    });
  });

  describe('process()', () => {
    it('should return original input when called with empty pipeline', () => {
      const pipeline: Pipeline<string, string> = new Pipeline();
      expect(pipeline.process('test')).toBe('test');
    });

    it('should handle multiple type changes when called with complex transformations', () => {
      interface Input {
        value: number;
      }
      interface Output {
        result: boolean;
      }
      const pipeline: Pipeline<Input, Output> = new Pipeline();
      pipeline
        .addStep((input: Input): number => input.value)
        .addStep((num: number): string => num.toString())
        .addStep((str: string): boolean => str === '42')
        .addStep((bool: boolean): Output => ({ result: bool }));
      expect(pipeline.process({ value: 42 })).toEqual({ result: true });
    });
  });
});
