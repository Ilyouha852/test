/**
 * Произвольная фабричная функция с сигнатурой `Shape`.
 */
export type Factory<Shape> = (object?: Partial<Shape>) => Shape;
