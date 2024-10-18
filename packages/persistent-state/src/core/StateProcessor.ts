export type StateProcessorStep<I, O> = (state: I) => O;

export class StateProcessor<I, O> {
  private steps: StateProcessorStep<any, any>[] = [];

  public addStep<T>(step: StateProcessorStep<I, T>): StateProcessor<T, O> {
    this.steps.push(step);

    return this as unknown as StateProcessor<T, O>;
  }

  public process(state: I): O {
    const result: unknown = this.steps.reduce<I | O>(
      (currentState: I | O, step: StateProcessorStep<I | O, any>): I | O =>
        step(currentState),
      state,
    );

    return result as O;
  }
}
