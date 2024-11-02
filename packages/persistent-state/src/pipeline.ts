export type PipelineStep<I, O> = (state: I) => O;

export class Pipeline<I, O> {
  private steps: PipelineStep<any, any>[] = [];

  public addStep<T>(step: PipelineStep<I, T>): Pipeline<T, O> {
    this.steps.push(step);

    return this as unknown as Pipeline<T, O>;
  }

  public process(input: I): O {
    return this.steps.reduce(
      (current: I | O, step: PipelineStep<I | O, any>): I | O => step(current),
      input,
    ) as O;
  }
}
